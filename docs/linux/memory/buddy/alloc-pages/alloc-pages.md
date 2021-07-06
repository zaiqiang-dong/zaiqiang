
# 页面分配基本流程

---

| 软件版本     | 硬件版本 | 更新内容 |
|--------------|----------|----------|
| linux 5.8.18 | arm64    |          |

---

本章只是梳理页面分配流程，不存在代码思想的解析。

## 1. 接口函数

### 1.1 alloc_page
```c
#define alloc_page(gfp_mask) alloc_pages(gfp_mask, 0)
```
从代码可以看出`alloc_page`最终调用的是`alloc_pages`,只是在第二个参数的位置写0,表示 $2^0$,也就是1个页面。

### 1.2 __get_free_pages
```c
unsigned long __get_free_pages(gfp_t gfp_mask, unsigned int order)
{
	struct page *page;

	page = alloc_pages(gfp_mask & ~__GFP_HIGHMEM, order);
	if (!page)
		return 0;
	return (unsigned long) page_address(page);
}
```
同样的`__get_free_pages`也是调用了调用了`alloc_pages`,只是在`gfp_mask`参数部分清除了`__GFP_HIGHMEM`,也就是不能从高端内存部分分配。这里最后一行`page_address`,表示返回的是页面的虚拟地址。

### 1.3 __get_free_page
```c
#define __get_free_page(gfp_mask) \
		__get_free_pages((gfp_mask), 0)

```
这个很明显调用了`__get_free_pages`,只是页面个数为1.

### 1.4 get_zeroed_page
```c
unsigned long get_zeroed_page(gfp_t gfp_mask)
{
	return __get_free_pages(gfp_mask | __GFP_ZERO, 0);
}
```
这个函数调用了上面的`__get_free_pages`,只是设置了`__GFP_ZERO`,表示需要将页面进行清0处理。另外页面个数部分为0,表示只分配一个页面。

### 1.5 __get_dma_pages
```c
#define __get_dma_pages(gfp_mask, order) \
		__get_free_pages((gfp_mask) | GFP_DMA, (order))
```
这里同样调用了`__get_free_pages`,只是设置了`GFP_DMA`,表示从DMA内存分区进行内存分配。


## 2. alloc_pages
从上面的接口分析中可以看出所有的接口最终都是调用了`alloc_pages`,下面我重点分析这个函数。
```c
#ifdef CONFIG_NUMA
extern struct page *alloc_pages_current(gfp_t gfp_mask, unsigned order);

static inline struct page *
alloc_pages(gfp_t gfp_mask, unsigned int order)
{
	return alloc_pages_current(gfp_mask, order);
}
extern struct page *alloc_pages_vma(gfp_t gfp_mask, int order,
			struct vm_area_struct *vma, unsigned long addr,
			int node, bool hugepage);
#define alloc_hugepage_vma(gfp_mask, vma, addr, order) \
	alloc_pages_vma(gfp_mask, order, vma, addr, numa_node_id(), true)
#else
#define alloc_pages(gfp_mask, order) \
		alloc_pages_node(numa_node_id(), gfp_mask, order)
#define alloc_pages_vma(gfp_mask, order, vma, addr, node, false)\
	alloc_pages(gfp_mask, order)
#define alloc_hugepage_vma(gfp_mask, vma, addr, order) \
	alloc_pages(gfp_mask, order)
#endif

```
从宏定义可以看出在`NUMA`和非`NUMA`,存在不同，我们这里按非`NUMA`来分析。也就是如下：
```c
#define alloc_pages(gfp_mask, order) \
		alloc_pages_node(numa_node_id(), gfp_mask, order)
```
最终调用的是`alloc_pages_node`,这里的node是`NUMA`节点。这里`numa_node_id`返回的是当前`CPU`所在的`NUMA`节点，我们这里是讨论的是非`NUMA`平台，所以这里的节点值为0。


### 2.1 alloc_pages_node

从上面的分析最终是调用了`alloc_pages_node`,代码如下：

```c
static inline struct page *alloc_pages_node(int nid, gfp_t gfp_mask,
						unsigned int order)
{
	if (nid == NUMA_NO_NODE)
		nid = numa_mem_id();

	return __alloc_pages_node(nid, gfp_mask, order);
}

```
代码很简单就是调用`__alloc_pages_node`

### 2.2 __alloc_pages_node
```c
static inline struct page *
__alloc_pages_node(int nid, gfp_t gfp_mask, unsigned int order)
{
	/* 保证nid的合法性 */
	VM_BUG_ON(nid < 0 || nid >= MAX_NUMNODES);
	VM_WARN_ON((gfp_mask & __GFP_THISNODE) && !node_online(nid));

	return __alloc_pages(gfp_mask, order, nid);
}
```

### 2.3 __alloc_pages
```c
struct page *
__alloc_pages_nodemask(gfp_t gfp_mask, unsigned int order, int preferred_nid,
							nodemask_t *nodemask);

static inline struct page *
__alloc_pages(gfp_t gfp_mask, unsigned int order, int preferred_nid)
{
	return __alloc_pages_nodemask(gfp_mask, order, preferred_nid, NULL);
}
```
上面代码很简单，`__alloc_pages_nodemask`是真正的内存分配函数。


### 3. __alloc_pages_nodemask
```c
struct page *
__alloc_pages_nodemask(gfp_t gfp_mask, unsigned int order, int preferred_nid,
							nodemask_t *nodemask)
{
	struct page *page;
	unsigned int alloc_flags = ALLOC_WMARK_LOW;
	gfp_t alloc_mask; /* The gfp_t that was actually used for allocation */
	struct alloc_context ac = { };

	/*
	 * There are several places where we assume that the order value is sane
	 * so bail out early if the request is out of bound.
	 */
	if (unlikely(order >= MAX_ORDER)) {
		WARN_ON_ONCE(!(gfp_mask & __GFP_NOWARN));
		return NULL;
	}

	/*
	 * gfp_allowed_mask 在系统启动中为GFP_BOOT_MASK
	 * #define GFP_BOOT_MASK (__GFP_BITS_MASK & ~(__GFP_RECLAIM|__GFP_IO|__GFP_FS))
	 *
	 * 后设置为如下
	 * gfp_allowed_mask = __GFP_BITS_MASK; = 0x7FFFFF;
	 *
	 */
	gfp_mask &= gfp_allowed_mask;
	alloc_mask = gfp_mask;
	/*
	 * prepare_alloc_pages 主要是初始化ac，具体见函数实现
	 */
	if (!prepare_alloc_pages(gfp_mask, order, preferred_nid, nodemask, &ac, &alloc_mask, &alloc_flags))
		return NULL;
	/*
	 * 这里主要是要找一个最好的zone用于后面分配内存
	 *
	 * */
	finalise_ac(gfp_mask, &ac);

	/*
	 * Forbid the first pass from falling back to types that fragment
	 * memory until all local zones are considered.
	 */
	alloc_flags |= alloc_flags_nofragment(ac.preferred_zoneref->zone, gfp_mask);
	/*
	 * 大部分情况会走这里
	 */
	/* First allocation attempt */
	page = get_page_from_freelist(alloc_mask, order, alloc_flags, &ac);
	if (likely(page))
		goto out;

	/*
	 * Apply scoped allocation constraints. This is mainly about GFP_NOFS
	 * resp. GFP_NOIO which has to be inherited for all allocation requests
	 * from a particular context which has been marked by
	 * memalloc_no{fs,io}_{save,restore}.
	 */
	alloc_mask = current_gfp_context(gfp_mask);
	ac.spread_dirty_pages = false;

	/*
	 * Restore the original nodemask if it was potentially replaced with
	 * &cpuset_current_mems_allowed to optimize the fast-path attempt.
	 */
	ac.nodemask = nodemask;
	/*
	 * 系统内存不足，先回收再分配
	 */

	page = __alloc_pages_slowpath(alloc_mask, order, &ac);

out:
	if (memcg_kmem_enabled() && (gfp_mask & __GFP_ACCOUNT) && page &&
	    unlikely(__memcg_kmem_charge_page(page, gfp_mask, order) != 0)) {
		__free_pages(page, order);
		page = NULL;
	}

	trace_mm_page_alloc(page, order, alloc_mask, ac.migratetype);

	return page;
}

```

## 4. 小结
本文只是梳理了大体的内存页面分配的思路，从上面代码分析中可以看到`__alloc_pages_nodemask`才是真正的分配函数，无论你调用了那个接口函数，最终都会调到这里。

---
::: tip 提示 

欢迎评论、探讨,如果发现错误请指正。转载请注明出处！ [探索者](http://www.tsz.wiki) 

:::


---
<Vssue :title="$title"/>
