
# 进程优先级

---

| 软件版本  | 硬件版本 | 更新内容 |
|---------|--------|----------|
|linux 4.9| arm64   |        |

---

## 概述
由于进程优先级在用户空间和内核空间的定义不同，而且在内核空间也存在多种优先级，所以让人比较费解。本文将介绍linux系统中的各种优先，算是作一个总结吧。

## 用户空间进程优先级

在用户空间对于优先级的控制接口大概有3个，如下：
```
int nice (int __inc);
int getpriority(int which, id_t who);
int setpriority(int which, id_t who, int value);

```

其中nice()源码如下：

```c
int
nice (int incr)
{
  int save;
  int prio;
  int result;

  /* -1 is a valid priority, so we use errno to check for an error.  */
  save = errno;
  __set_errno (0);
  prio = __getpriority (PRIO_PROCESS, 0);
  if (prio == -1)
    {
      if (errno != 0)
	return -1;
    }

  result = __setpriority (PRIO_PROCESS, 0, prio + incr);
  if (result == -1)
    {
      if (errno == EACCES)
	__set_errno (EPERM);
      return -1;
    }

  __set_errno (save);
  return __getpriority (PRIO_PROCESS, 0);
}
```

所以只有setpriority getpriority.
当我们 man setpriority时，可以看到：
>The prio argument is a value in the range -20 to 19 (but see NOTES below).

所以在用户空间普通进程priority就是一个-20（优先级最高）～19（优先级最低)的整数。
另外还有一个实时进程，优先级为1-99,99为最高。
## 内核中的优先级

先看代码：

```
struct task_struct {
	...
    int prio, static_prio, normal_prio;
	unsigned int rt_priority;
	...
    unsigned int policy;
	...
}
```

在内核中一共有四种优先级，一一说明一下。
### static_prio
这个是所有其他优先级计算的Base。这个优先级是进程启动时会被设置，也可以通过用户态的设置接口，如nice来设置。但在内核中设置的值会被转化，如下代码：
```c

#define MAX_NICE	19
#define MIN_NICE	-20
#define NICE_WIDTH	(MAX_NICE - MIN_NICE + 1)

/*
 * Priority of a process goes from 0..MAX_PRIO-1, valid RT
 * priority is 0..MAX_RT_PRIO-1, and SCHED_NORMAL/SCHED_BATCH
 * tasks are in the range MAX_RT_PRIO..MAX_PRIO-1. Priority
 * values are inverted: lower p->prio value means higher priority.
 *
 * The MAX_USER_RT_PRIO value allows the actual maximum
 * RT priority to be separate from the value exported to
 * user-space.  This allows kernel threads to set their
 * priority to a value higher than any user task. Note:
 * MAX_RT_PRIO must not be smaller than MAX_USER_RT_PRIO.
 */

#define MAX_USER_RT_PRIO	100
#define MAX_RT_PRIO		MAX_USER_RT_PRIO

#define MAX_PRIO		(MAX_RT_PRIO + NICE_WIDTH)
#define DEFAULT_PRIO		(MAX_RT_PRIO + NICE_WIDTH / 2)

/*
 * Convert user-nice values [ -20 ... 0 ... 19 ]
 * to static priority [ MAX_RT_PRIO..MAX_PRIO-1 ],
 * and back.
 */
#define NICE_TO_PRIO(nice)	((nice) + DEFAULT_PRIO)


NICE_TO_PRIO(attr->sched_nice);


```
从这里很明显的可以看到，对于普通进程，优化级在内核会被转化为100～139的值
另外进程在fork的时候会执行如下代码：
```c
	if (unlikely(p->sched_reset_on_fork)) {
		if (task_has_dl_policy(p) || task_has_rt_policy(p)) {
			p->policy = SCHED_NORMAL;
			p->static_prio = NICE_TO_PRIO(0);
			p->rt_priority = 0;
		} else if (PRIO_TO_NICE(p->static_prio) < 0)
			p->static_prio = NICE_TO_PRIO(0);

		p->prio = p->normal_prio = __normal_prio(p);
		set_load_weight(p);

		/*
		 * We don't need the reset flag anymore after the fork. It has
		 * fulfilled its duty:
		 */
		p->sched_reset_on_fork = 0;
	}


```
sched_reset_on_fork为真，那么static_prio会被设置成NICE_TO_PRIO(0)=120。
这个值的取值范围：0～139，但有一点对于实时进程，这个值没什么意义，后面会讲到。
### rt_priority
实时优先级，同样可以通用户态的设置的，在内核中的代码如下：
```c
static void __setscheduler_params(struct task_struct *p,
		const struct sched_attr *attr)
{
	int policy = attr->sched_policy;

	if (policy == SETPARAM_POLICY)
		policy = p->policy;

	p->policy = policy;

	if (dl_policy(policy))
		__setparam_dl(p, attr);
	else if (fair_policy(policy))
		p->static_prio = NICE_TO_PRIO(attr->sched_nice);

	/*
	 * __sched_setscheduler() ensures attr->sched_priority == 0 when
	 * !rt_policy. Always setting this ensures that things like
	 * getparam()/getattr() don't report silly values for !rt tasks.
	 */
	p->rt_priority = attr->sched_priority;
	p->normal_prio = normal_prio(p);
	set_load_weight(p);
}

```
 >__sched_setscheduler() ensures attr->sched_priority == 0 when!rt_policy. Always setting this ensures that things like

这个注释说的很普通进程这个值=0。同样的如果 sched_reset_on_fork为真，这个值会被清0.另外他的范围为0～99（#define MAX_RT_PRIO		MAX_USER_RT_PRIO）

### normal_prio
这是一个动态优先级会被动态计算出来的，计算过程如下：
```c
	p->normal_prio = normal_prio(p);
    
static inline int normal_prio(struct task_struct *p)
{
	int prio;

	if (task_has_dl_policy(p))
		prio = MAX_DL_PRIO-1;
	else if (task_has_rt_policy(p))
		prio = MAX_RT_PRIO-1 - p->rt_priority;
	else
		prio = __normal_prio(p);
	return prio;
}

static inline int __normal_prio(struct task_struct *p)
{
	return p->static_prio;
}


```
如果是deadline进程，那么值为-1.如果是实时进程则是MAX_RT_PRIO-1 - p->rt_priority;。否则就等于static_prio.

### prio

这个是最关键的一个动态优先级，因为这个调度算法真正使用的值，它的设置在一开始会被设置为一父进程一样，代码在sched_fork中
```c
int sched_fork(unsigned long clone_flags, struct task_struct *p)
{
	...
    p->prio = current->normal_prio;
	...
}

```
之后的计算如下：
```c
static int effective_prio(struct task_struct *p)
{
	p->normal_prio = normal_prio(p);
	/*
	 * If we are RT tasks or we were boosted to RT priority,
	 * keep the priority unchanged. Otherwise, update priority
	 * to the normal priority:
	 */
	if (!rt_prio(p->prio))
		return p->normal_prio;
	return p->prio;
}

```

这段代码很简单，就是如果是实时进程，我们就不去改变他的prio，直接返回它自己的prio.其他情况，返回normal_prio.

## 总结

四种优先级，实是调度使用的只prio,其实几个都会最终通过prio体现。

---
::: tip  

转载请注明出处！ [探索者](http://www.cxy.wiki)

:::


