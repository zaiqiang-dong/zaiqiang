
# SLUB计算order

---

| 软件版本  | 硬件版本 | 更新内容 |
|---------|--------|----------|
|linux-5.8.18| arm64   |        |

---

## 1. 简介
在struct kmem_cache中有一个非常重要的成员变量叫oo， 这是一个32位的整数，其中低16位表示在一个slab中有多少个object，高16位则表示，一个slab是由多少个page组成的,也就是所谓的order。本篇主要介绍order计算以及其中思想。

$$objects = oo\&((1<<16)-1)$$

$$pages = 2^{order} = 2^{oo>>16}$$

## 2. 基本思想

1. order的大小会影响系统性能和系统中的其他组件的工作，比如伙伴系统和内存回收机制。一般情况`order=0`应该是最好的情况，因为这样引起内存的外部碎片的可能性更小。但是一个比较大的order,可以减少slab在cpu partial表和node partial表的移动，从而提高分配效率，因为这样可以减少持锁的机率。
2. 应该尽可能的减少未使用的内存区域，如果使用的区域达到$\frac{1}{16}$,就应该尝试使用更大的order来避免
3. 要尽量让一个slab上的object多，不然会引更多的slab在cpu和node的partial上移动。
4. 如果计算出来的order大于最大的order,也就是slub_max_order，那么就考虑接受浪费更多的空间和减低slab上的object数量

## 3. order的影响因素

- slub_min_objects
  这个变量是由用户指定，如果不指定就等于0,在我们的实验平台的这个值是0. 如果不为0将影响`	min_objects `.

- slub_max_order
  这个值由在定义的时候就赋值等于`PAGE_ALLOC_COSTLY_ORDER`，代码如下：
  ```c

  #define PAGE_ALLOC_COSTLY_ORDER 3

  static int slub_max_order = PAGE_ALLOC_COSTLY_ORDER;

  ```
  从代码我们很容易知道这个值就是3,但为什么是3,这里主要考虑内存的回收问题，具体的我们会在内存回收的相关文章中做介绍。

- slub_min_order
  这个值也是由用户指定，如果不指定也是等于0,我这里的实验平台也是0.

- size
  这个是slab单个object的大小，是对齐到cache和字之后的大小。这个值也会影响`	min_objects `.

- nr_cpu_ids
  系统中的cpu个数，这个变量起使用是在$slub\_min\_objects=0$的时候, 会影响`min_objects`.

以上就些就是计算order全部输入参数，当然有些值因为是0可能不会起使用。



## 4. order的计算过程

直接分析代码：

```c {.line-numbers}

static inline int calculate_order(unsigned int size)
{
	unsigned int order;
	unsigned int min_objects;
	unsigned int max_objects;

	/*
	 * Attempt to find best configuration for a slab. This
	 * works by first attempting to generate a layout with
	 * the best configuration and backing off gradually.
	 *
	 * First we increase the acceptable waste in a slab. Then
	 * we reduce the minimum objects required in a slab.
	 */
	min_objects = slub_min_objects;
	if (!min_objects)
		min_objects = 4 * (fls(nr_cpu_ids) + 1);
	max_objects = order_objects(slub_max_order, size);
	min_objects = min(min_objects, max_objects);

	while (min_objects > 1) {
		unsigned int fraction;

		fraction = 16;
		while (fraction >= 4) {
			order = slab_order(size, min_objects,
					slub_max_order, fraction);
			if (order <= slub_max_order)
				return order;
			fraction /= 2;
		}
		min_objects--;
	}

	/*
	 * We were unable to place multiple objects in a slab. Now
	 * lets see if we can place a single object there.
	 */
	order = slab_order(size, 1, slub_max_order, 1);
	if (order <= slub_max_order)
		return order;

	/*
	 * Doh this slab cannot be placed using slub_max_order.
	 */
	order = slab_order(size, 1, MAX_ORDER, 1);
	if (order < MAX_ORDER)
		return order;
	return -ENOSYS;
}

static inline unsigned int slab_order(unsigned int size,
		unsigned int min_objects, unsigned int max_order,
		unsigned int fract_leftover)
{
	unsigned int min_order = slub_min_order;
	unsigned int order;

	if (order_objects(min_order, size) > MAX_OBJS_PER_PAGE)
		return get_order(size * MAX_OBJS_PER_PAGE) - 1;

	for (order = max(min_order, (unsigned int)get_order(min_objects * size));
			order <= max_order; order++) {

		unsigned int slab_size = (unsigned int)PAGE_SIZE << order;
		unsigned int rem;

		rem = slab_size % size;

		if (rem <= slab_size / fract_leftover)
			break;
	}

	return order;
}

```
- 代码15～17行：
slub_min_objects为0,所以`min_objects`计算如下公式
  
$$min\_objects=4*(fls(nr\_cpu\_ids)+1)$$

其中fls函数就是返回一个整数的最后一个为1的bit所在的位置。如1返回的就是1,8返回的就是4.
- 代码18～19行：
  确保`min_object`需要的页面数order不超过最大的order.
- 代码21~33行：
  这个就是求order的过程，基本的算法就是先保持`min_objects`不变，然后加大对浪费空间的容忍程度，就是先看能不能计算出一个order，浪费的空间$<\frac{1}{16}*size$,如果不行，再看$\frac{1}{8}*size$能否满足，最后一直到$\frac{1}{4}*size$,同时还要满足`order < lsub_max_order`如果还是不能满足就，就减低`min_objects`,再重复上面的过程。直到计算出来一个order.
- 代码62行：
  这里的get_order，就是获取满足`min_objects`和`size`的最小order,如下所示：

  $$order=fls64((((min\_objects*size)-1) >> 12)$$

- 代码68行：
  计算浪费的空间。

  $$rem=slab\_size \%size$$

- 代码70行：
  允许的浪费空间如下
  $$allowd\_rem=\frac{slab\_size}{fract\_leftover}$$
  然后比较rem是不是小于allowd_rem.
## 4. 小结
其实计算的过程比较简单，复杂的是背后的思想，需要考虑伙伴系统，内存回收，锁竞争等问题。以上就是我的一些理解，欢迎大家留言讨论，指正。

---
::: tip  

转载请注明出处！ [探索者](http://www.tsz.wiki)

:::


---
<Vssue :title="$title"/>
