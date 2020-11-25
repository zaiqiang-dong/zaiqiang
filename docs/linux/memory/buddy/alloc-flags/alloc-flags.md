
# 页分配掩码

---

| 软件版本  | 硬件版本 | 更新内容 |
|---------|--------|----------|
|linux 4.19| arm64   |        |

---

## 1. 掩码介绍

### 1.1 原始掩码
最原始的一部分flags（前面带三个_）,后面的flags基本都是用这部分“组合”出来的,具体信息如下：


```c

/* Plain integer GFP bitmasks. Do not use this directly. */

/*
 * 分配区域指定 一般占用整个掩码的最低 1~4 BIT
 */

//从ZONE_DMA区域分配内存
#define ___GFP_DMA 		0x01u

//从ZONE_HIGHMEM活ZONE_NORMAL中分配内存
#define ___GFP_HIGHMEM		0x02u

//从ZONE_DMA32中分配内存
#define ___GFP_DMA32		0x04u

//页是可移动的
#define ___GFP_MOVABLE		0x08u

/*
 * 分配行为指定, 占用掩码的第 5～16 BIT 
 */

//页是可回收的
#define ___GFP_RECLAIMABLE	0x10u

//未知
#define ___GFP_HIGH		0x20u

//未知			
#define ___GFP_IO		0x40u

//未知
#define ___GFP_FS		0x80u

//需要非缓存的冷页
#define ___GFP_COLD		0x100u

//禁止分配失败警告
#define ___GFP_NOWARN		0x200u

//一直重试直到成功				
#define ___GFP_REPEAT		0x400u

#define ___GFP_NOFAIL		0x800u

//失败返回不重试
#define ___GFP_NORETRY		0x1000u

//使用紧急分配链表
#define ___GFP_MEMALLOC		0x2000u

//未知
#define ___GFP_COMP		0x4000u

//返回的页面初始化为0
#define ___GFP_ZERO		0x8000u

/*
 * 分配类型指定， 占用掩码第 17～23 BIT
 */

//不使用紧急分配链表
#define ___GFP_NOMEMALLOC	0x10000u

//只允许在进程允许运行的CPU所关联的PCP分配内存
#define ___GFP_HARDWALL		0x20000u

//未知
#define ___GFP_THISNODE		0x40000u

//用于原子分配，在任何情况下都不能中断
#define ___GFP_ATOMIC		0x80000u

//未知
#define ___GFP_NOACCOUNT	0x100000u

//避免被内存检测工具kmemcheck检测
#define ___GFP_NOTRACK		0x200000u

//当内存不足时，直接进入内存回收
#define ___GFP_DIRECT_RECLAIM	0x400000u

//未知
#define ___GFP_OTHER_NODE	0x800000u

//未知
#define ___GFP_WRITE		0x1000000u


//当内存不足时，唤醒内存回收
#define ___GFP_KSWAPD_RECLAIM	0x2000000u


```

### 1.2 掩码组合

这个部分一分是由第一部分的flags中的一个或者多个组合而成。


```c
/* If the above are modified, __GFP_BITS_SHIFT may need updating */

/*
 * Physical address zone modifiers (see linux/mmzone.h - low four bits)
 *
 * Do not put any conditional on these. If necessary modify the definitions
 * without the underscores and use them consistently. The definitions here may
 * be used in bit comparisons.
 */

/*
 * 这个基本和第一部分一样
 * 使用了__force修饰的变量可以进行强制类型转换, 没有使用 __force修饰的变量进行强制类型转换时, Sparse会给出警告.
 */

 //和第一部分基本一样
#define __GFP_DMA	((__force gfp_t)___GFP_DMA)
#define __GFP_HIGHMEM	((__force gfp_t)___GFP_HIGHMEM)
#define __GFP_DMA32	((__force gfp_t)___GFP_DMA32)

//是页迁移机制所需的标志，可移动的
#define __GFP_MOVABLE	((__force gfp_t)___GFP_MOVABLE)  /* Page is movable */
#define __GFP_MOVABLE	((__force gfp_t)___GFP_MOVABLE)  /* ZONE_MOVABLE allowed */

//第一部分的组合
#define GFP_ZONEMASK	(__GFP_DMA|__GFP_HIGHMEM|__GFP_DMA32|__GFP_MOVABLE)

/*
 * Page mobility and placement hints
 *
 * These flags provide hints about how mobile the page is. Pages with similar
 * mobility are placed within the same pageblocks to minimise problems due
 * to external fragmentation.
 *
 * __GFP_MOVABLE (also a zone modifier) indicates that the page can be
 *   moved by page migration during memory compaction or can be reclaimed.
 *
 * __GFP_RECLAIMABLE is used for slab allocations that specify
 *   SLAB_RECLAIM_ACCOUNT and whose pages can be freed via shrinkers.
 *
 * __GFP_WRITE indicates the caller intends to dirty the page. Where possible,
 *   these pages will be spread between local zones to avoid all the dirty
 *   pages being in one zone (fair zone allocation policy).
 *
 * __GFP_HARDWALL enforces the cpuset memory allocation policy.
 *
 * __GFP_THISNODE forces the allocation to be satisified from the requested
 *   node with no fallbacks or placement policy enforcements.
 */
 
 //是页迁移机制所需的标志，可回收的
#define __GFP_RECLAIMABLE ((__force gfp_t)___GFP_RECLAIMABLE)

//未知
#define __GFP_WRITE	((__force gfp_t)___GFP_WRITE)

//未知
#define __GFP_HARDWALL   ((__force gfp_t)___GFP_HARDWALL)

//未知
#define __GFP_THISNODE	((__force gfp_t)___GFP_THISNODE)

/*
 * Watermark modifiers -- controls access to emergency reserves
 *
 * __GFP_HIGH indicates that the caller is high-priority and that granting
 *   the request is necessary before the system can make forward progress.
 *   For example, creating an IO context to clean pages.
 *
 * __GFP_ATOMIC indicates that the caller cannot reclaim or sleep and is
 *   high priority. Users are typically interrupt handlers. This may be
 *   used in conjunction with __GFP_HIGH
 *
 * __GFP_MEMALLOC allows access to all memory. This should only be used when
 *   the caller guarantees the allocation will allow more memory to be freed
 *   very shortly e.g. process exiting or swapping. Users either should
 *   be the MM or co-ordinating closely with the VM (e.g. swap over NFS).
 *
 * __GFP_NOMEMALLOC is used to explicitly forbid access to emergency reserves.
 *   This takes precedence over the __GFP_MEMALLOC flag if both are set.
 *
 * __GFP_NOACCOUNT ignores the accounting for kmemcg limit enforcement.
 */

 //中断中分配内存会使用，表明不允许打断
#define __GFP_ATOMIC	((__force gfp_t)___GFP_ATOMIC)

//高优先级分配内存，
#define __GFP_HIGH	((__force gfp_t)___GFP_HIGH)

//调用者需要很快释放分配的内存
#define __GFP_MEMALLOC	((__force gfp_t)___GFP_MEMALLOC)

//禁止从应急的内存空间分配 
#define __GFP_NOMEMALLOC ((__force gfp_t)___GFP_NOMEMALLOC)

//未知
#define __GFP_NOACCOUNT	((__force gfp_t)___GFP_NOACCOUNT)

/*
 * Reclaim modifiers
 *
 * __GFP_IO can start physical IO.
 *
 * __GFP_FS can call down to the low-level FS. Clearing the flag avoids the
 *   allocator recursing into the filesystem which might already be holding
 *   locks.
 *
 * __GFP_DIRECT_RECLAIM indicates that the caller may enter direct reclaim.
 *   This flag can be cleared to avoid unnecessary delays when a fallback
 *   option is available.
 *
 * __GFP_KSWAPD_RECLAIM indicates that the caller wants to wake kswapd when
 *   the low watermark is reached and have it reclaim pages until the high
 *   watermark is reached. A caller may wish to clear this flag when fallback
 *   options are available and the reclaim is likely to disrupt the system. The
 *   canonical example is THP allocation where a fallback is cheap but
 *   reclaim/compaction may cause indirect stalls.
 *
 * __GFP_RECLAIM is shorthand to allow/forbid both direct and kswapd reclaim.
 *
 * __GFP_REPEAT: Try hard to allocate the memory, but the allocation attempt
 *   _might_ fail.  This depends upon the particular VM implementation.
 *
 * __GFP_NOFAIL: The VM implementation _must_ retry infinitely: the caller
 *   cannot handle allocation failures. New users should be evaluated carefully
 *   (and the flag should be used only when there is no reasonable failure
 *   policy) but it is definitely preferable to use the flag rather than
 *   opencode endless loop around allocator.
 *
 * __GFP_NORETRY: The VM implementation must not retry indefinitely and will
 *   return NULL when direct reclaim and memory compaction have failed to allow
 *   the allocation to succeed.  The OOM killer is not called with the current
 *   implementation.
 */

 //说明在查找空闲内存期间内核可以进行I/O操作
#define __GFP_IO	((__force gfp_t)___GFP_IO)

//允许内核执行VFS操作
#define __GFP_FS	((__force gfp_t)___GFP_FS)

//当内存不足时，直接进入内存回收
#define __GFP_DIRECT_RECLAIM	((__force gfp_t)___GFP_DIRECT_RECLAIM) /* Caller can reclaim */

//当内存不足时，希望唤醒内存回收，回收成功后分配
#define __GFP_KSWAPD_RECLAIM	((__force gfp_t)___GFP_KSWAPD_RECLAIM) /* kswapd can wake */

//上面两个flag的组合
#define __GFP_RECLAIM ((__force gfp_t)(___GFP_DIRECT_RECLAIM|___GFP_KSWAPD_RECLAIM))

//在分配失败后自动重试，但在尝试若干次之后会停止
#define __GFP_REPEAT	((__force gfp_t)___GFP_REPEAT)

//在分配失败后一直重试，直至成功
#define __GFP_NOFAIL	((__force gfp_t)___GFP_NOFAIL)

//在分配失败后不重试直接返回
#define __GFP_NORETRY	((__force gfp_t)___GFP_NORETRY)

/*
 * Action modifiers
 *
 * __GFP_COLD indicates that the caller does not expect to be used in the near
 *   future. Where possible, a cache-cold page will be returned.
 *
 * __GFP_NOWARN suppresses allocation failure reports.
 *
 * __GFP_COMP address compound page metadata.
 *
 * __GFP_ZERO returns a zeroed page on success.
 *
 * __GFP_NOTRACK avoids tracking with kmemcheck.
 *
 * __GFP_NOTRACK_FALSE_POSITIVE is an alias of __GFP_NOTRACK. It's a means of
 *   distinguishing in the source between false positives and allocations that
 *   cannot be supported (e.g. page tables).
 *
 * __GFP_OTHER_NODE is for allocations that are on a remote node but that
 *   should not be accounted for as a remote allocation in vmstat. A
 *   typical user would be khugepaged collapsing a huge page on a remote
 *   node.
 */

 //分配一个不在cpu 缓存中的内存
#define __GFP_COLD	((__force gfp_t)___GFP_COLD)

//在分配失败时禁止内核故障警告
#define __GFP_NOWARN	((__force gfp_t)___GFP_NOWARN)

//分配大页时会使用
#define __GFP_COMP	((__force gfp_t)___GFP_COMP)

//返回的页面初始化为0
#define __GFP_ZERO	((__force gfp_t)___GFP_ZERO)

//避免被内存检测工具kmemcheck检测
#define __GFP_NOTRACK	((__force gfp_t)___GFP_NOTRACK)

//未知
#define __GFP_NOTRACK_FALSE_POSITIVE (__GFP_NOTRACK)


//未知
#define __GFP_OTHER_NODE ((__force gfp_t)___GFP_OTHER_NODE)

/* Room for N __GFP_FOO bits */
#define __GFP_BITS_SHIFT 26
#define __GFP_BITS_MASK ((__force gfp_t)((1 << __GFP_BITS_SHIFT) - 1))


```
### 1.3 最终掩码

这部分的掩码就是我们在分配内存过程经常会使用的掩码。

```c
/*
 * Useful GFP flag combinations that are commonly used. It is recommended
 * that subsystems start with one of these combinations and then set/clear
 * __GFP_FOO flags as necessary.
 *
 * GFP_ATOMIC users can not sleep and need the allocation to succeed. A lower
 *   watermark is applied to allow access to "atomic reserves"
 *
 * GFP_KERNEL is typical for kernel-internal allocations. The caller requires
 *   ZONE_NORMAL or a lower zone for direct access but can direct reclaim.
 *
 * GFP_NOWAIT is for kernel allocations that should not stall for direct
 *   reclaim, start physical IO or use any filesystem callback.
 *
 * GFP_NOIO will use direct reclaim to discard clean pages or slab pages
 *   that do not require the starting of any physical IO.
 *
 * GFP_NOFS will use direct reclaim but will not use any filesystem interfaces.
 *
 * GFP_USER is for userspace allocations that also need to be directly
 *   accessibly by the kernel or hardware. It is typically used by hardware
 *   for buffers that are mapped to userspace (e.g. graphics) that hardware
 *   still must DMA to. cpuset limits are enforced for these allocations.
 *
 * GFP_DMA exists for historical reasons and should be avoided where possible.
 *   The flags indicates that the caller requires that the lowest zone be
 *   used (ZONE_DMA or 16M on x86-64). Ideally, this would be removed but
 *   it would require careful auditing as some users really require it and
 *   others use the flag to avoid lowmem reserves in ZONE_DMA and treat the
 *   lowest zone as a type of emergency reserve.
 *
 * GFP_DMA32 is similar to GFP_DMA except that the caller requires a 32-bit
 *   address.
 *
 * GFP_HIGHUSER is for userspace allocations that may be mapped to userspace,
 *   do not need to be directly accessible by the kernel but that cannot
 *   move once in use. An example may be a hardware allocation that maps
 *   data directly into userspace but has no addressing limitations.
 *
 * GFP_HIGHUSER_MOVABLE is for userspace allocations that the kernel does not
 *   need direct access to but can use kmap() when access is required. They
 *   are expected to be movable via page reclaim or page migration. Typically,
 *   pages on the LRU would also be allocated with GFP_HIGHUSER_MOVABLE.
 *
 * GFP_TRANSHUGE is used for THP allocations. They are compound allocations
 *   that will fail quickly if memory is not available and will not wake
 *   kswapd on failure.
 */

 //用于原子分配，不能中断, 可使用紧急分配链表中的内存, 这个标志用在中断处理程序, 下半部, 
 //持有自旋锁以及其他不能睡眠的地方
#define GFP_ATOMIC	(__GFP_HIGH|__GFP_ATOMIC|__GFP_KSWAPD_RECLAIM)

//这是一种常规的分配方式, 可能会阻塞. 这个标志在睡眠安全时用在进程的长下文代码中. 为了获取调用者所需的内存,
//内核会尽力而为. 这个标志应该是首选标志
#define GFP_KERNEL	(__GFP_RECLAIM | __GFP_IO | __GFP_FS)

//与GFP_ATOMIC类似
#define GFP_NOWAIT	(__GFP_KSWAPD_RECLAIM)

//这种分配可以阻塞, 但不会启动磁盘I/O, 这个标志在不能引发更多的磁盘I/O时阻塞I/O代码
#define GFP_NOIO	(__GFP_RECLAIM)

//这种分配在必要时可以阻塞, 但是也可能启动磁盘, 但是不会启动文件系统操作
#define GFP_NOFS	(__GFP_RECLAIM | __GFP_IO)
#define GFP_TEMPORARY	(__GFP_RECLAIM | __GFP_IO | __GFP_FS | \
			 __GFP_RECLAIMABLE)

//这是一种常规的分配方式, 可能会阻塞. 这个标志用于为用户空间进程分配内存时使用
#define GFP_USER	(__GFP_RECLAIM | __GFP_IO | __GFP_FS | __GFP_HARDWALL)

//用于分配适用于DMA的内存
#define GFP_DMA		__GFP_DMA
#define GFP_DMA32	__GFP_DMA32

//是GFP_USER的一个扩展, 也用于用户空间. 它允许分配无法直接映射的高端内存
#define GFP_HIGHUSER	(GFP_USER | __GFP_HIGHMEM)
#define GFP_HIGHUSER_MOVABLE	(GFP_HIGHUSER | __GFP_MOVABLE)
#define GFP_TRANSHUGE	((GFP_HIGHUSER_MOVABLE | __GFP_COMP | \
			 __GFP_NOMEMALLOC | __GFP_NORETRY | __GFP_NOWARN) & \
			 ~__GFP_KSWAPD_RECLAIM)


```

## 掩码的使用

经常使用是就是上面1.3中描述的掩码组合，具体含义如1.3注释。


---
::: tip  

转载请注明出处！ [探索者](http://www.cxy.wiki)

:::


<Vssue :title="$title" />
