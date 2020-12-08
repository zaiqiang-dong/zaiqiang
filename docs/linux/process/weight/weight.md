
# 虚拟运行时间计算

---

| 软件版本  | 硬件版本 | 更新内容 |
|---------|--------|----------|
|linux 5.8.18| arm64   |        |

---

虚拟运行时间计算，在内核中使用了一些计算技巧，使得计算过程不是那么容易理解，这里我们详细说明一个这个值的计算过程。


## 1. 权重初始化

在进程fork的时候，会设置进程的权重值，具体代码如下，代码的说明都在代码注释中。

```c
/*
 * Nice levels are multiplicative, with a gentle 10% change for every
 * nice level changed. I.e. when a CPU-bound task goes from nice 0 to
 * nice 1, it will get ~10% less CPU time than another CPU-bound task
 * that remained on nice 0.
 *
 * The "10% effect" is relative and cumulative: from _any_ nice level,
 * if you go up 1 level, it's -10% CPU usage, if you go down 1 level
 * it's +10% CPU usage. (to achieve that we use a multiplier of 1.25.
 * If a task goes up by ~10% and another task goes down by ~10% then
 * the relative distance between them is ~25%.)
 */
const int sched_prio_to_weight[40] = {
 /* -20 */     88761,     71755,     56483,     46273,     36291,
 /* -15 */     29154,     23254,     18705,     14949,     11916,
 /* -10 */      9548,      7620,      6100,      4904,      3906,
 /*  -5 */      3121,      2501,      1991,      1586,      1277,
 /*   0 */      1024,       820,       655,       526,       423,
 /*   5 */       335,       272,       215,       172,       137,
 /*  10 */       110,        87,        70,        56,        45,
 /*  15 */        36,        29,        23,        18,        15,
};


/*
 * Inverse (2^32/x) values of the sched_prio_to_weight[] array, precalculated.
 *
 * In cases where the weight does not change often, we can use the
 * precalculated inverse to speed up arithmetics by turning divisions
 * into multiplications:
 */
const u32 sched_prio_to_wmult[40] = {
 /* -20 */     48388,     59856,     76040,     92818,    118348,
 /* -15 */    147320,    184698,    229616,    287308,    360437,
 /* -10 */    449829,    563644,    704093,    875809,   1099582,
 /*  -5 */   1376151,   1717300,   2157191,   2708050,   3363326,
 /*   0 */   4194304,   5237765,   6557202,   8165337,  10153587,
 /*   5 */  12820798,  15790321,  19976592,  24970740,  31350126,
 /*  10 */  39045157,  49367440,  61356676,  76695844,  95443717,
 /*  15 */ 119304647, 148102320, 186737708, 238609294, 286331153,
};

static void set_load_weight(struct task_struct *p, bool update_load)
{
	int prio = p->static_prio - MAX_RT_PRIO;
	struct load_weight *load = &p->se.load;

	/*
	 * SCHED_IDLE tasks get minimal weight:
	 */

	/*
	 * idle进程的weight设置, 我们这里不关心这个
	 *
	 * */
	if (task_has_idle_policy(p)) {
		load->weight = scale_load(WEIGHT_IDLEPRIO);
		load->inv_weight = WMULT_IDLEPRIO;
		return;
	}

	/*
	 * SCHED_OTHER tasks have to update their load when changing their
	 * weight
	 */
	/*
	 * 进程设置 weight, 基本用户态的进程 weight 都是由这里设置的
	 *
	 * if 和 else两个分支设置的东西差不多
	 * 主要就是设置 weight 和 inv_weight 两个值
	 *
	 */
	if (update_load && p->sched_class == &fair_sched_class) {
		reweight_task(p, prio);
	} else {
		load->weight = scale_load(sched_prio_to_weight[prio]);
		load->inv_weight = sched_prio_to_wmult[prio];
	}
}

void reweight_task(struct task_struct *p, int prio)
{
	struct sched_entity *se = &p->se;
	struct cfs_rq *cfs_rq = cfs_rq_of(se);
	struct load_weight *load = &se->load;
	/*
	 * 从 sched_prio_to_weight 这个数组中查找对应该的weight
	 * scale_load 暂时可以不用关心，就是为了方便处理加入的移位
	 *
	 */
	unsigned long weight = scale_load(sched_prio_to_weight[prio]);

	/*
	 * 这里就是把 weight 赋值给 lw->weight
	 *
	 */
	reweight_entity(cfs_rq, se, weight);

	/*
	 * 这里就是设置 inv_weight ,这个是用来计算 vruntime
	 * 主要是为了简化计算过程，比如不使用除法，把除法转化为乘法和移位操作
	 *
	 * 这里的 inv_weight = 2^32 / weight
	 * 后面我们会通过公式推导得出为什么 inv_weight 是这样一个值
	 */
	load->inv_weight = sched_prio_to_wmult[prio];
}



```

## 2. 计算过程

在内核中，vruntime的定义的计算公式如下：

$$vruntime = \frac{delta\_exec*nice\_0\_weight}{weight}$$

但是这个公式计算过程中有除法，为了提高计算效率，我们需要对公式做一个变换，使它更加适合CPU的习惯。变换过程如下：

$$vruntime = \frac{delta\_exec*nice\_0\_weight * 2^{32}}{weight} >>32$$
$$ = delta\_exec*nice\_0\_weight *\frac{ 2^{32}}{weight} >>32$$
$$ = delta\_exec*nice\_0\_weight * inv\_weight >> 32$$

其中的$\frac{2^{32}}{weight}$，因为对于CFS调度的进程NICE值只有40个，也就是从-20～19.这40个NICE值，我们把它们转化为权重值，也就是 sched_prio_to_weight 这个数组,因此这个值也可以提前计算好放入 sched_prio_to_wmult 这个数组，这样使用的时候直接使用。

```c
static void update_curr(struct cfs_rq *cfs_rq)
{
    ...

    curr->vruntime += calc_delta_fair(delta_exec, curr);

    ...
}

static inline u64 calc_delta_fair(u64 delta, struct sched_entity *se)
{

	/*
	 * 按照 vruntime 的计算公式，如果NICE值等于0,那计算结果就是等于
	 * delta_exec,直接返回就行。
	 *
	 */
	if (unlikely(se->load.weight != NICE_0_LOAD))
		delta = __calc_delta(delta, NICE_0_LOAD, &se->load);

	return delta;
}


```

```c

#define WMULT_SHIFT	32

static u64 __calc_delta(u64 delta_exec, unsigned long weight, struct load_weight *lw)
{
	u64 fact = scale_load_down(weight);
	int shift = WMULT_SHIFT;

	__update_inv_weight(lw);

	if (unlikely(fact >> 32)) {
		while (fact >> 32) {
			fact >>= 1;
			shift--;
		}
	}

	fact = mul_u32_u32(fact, lw->inv_weight);

	while (fact >> 32) {
		fact >>= 1;
		shift--;
	}

	return mul_u64_u32_shr(delta_exec, fact, shift);
}

```
上面的计算过程用公式表示如下：


$$fact = weight = NICE\_0\_LOAD$$
$$fact = fact * inv_weight = weight * inv_weight$$
$$vruntime = delta\_exec * fact >> shift$$
$$vruntime = delta\_exec * weight * inv_weight >> WMULT_SHIFT$$
$$vruntime = delta\_exec * weight * inv_weight >> 32$$

## 3. 小结

虚拟运行时间计算，其实还是比较简单，只是使用一个技巧来简化计算过程。



---
::: tip Tip 

欢迎评论、探讨,如果发现错误请指正。转载请注明出处！ [探索者](http://www.tsz.wiki) 

:::



---
<Vssue :title="$title"/>

