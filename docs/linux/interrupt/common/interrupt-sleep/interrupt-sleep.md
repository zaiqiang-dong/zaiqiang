# 异步中断处理中能否睡眠
---

中断中能否睡眠或者说是中断中能否调用可能引起睡眠的API，其实本质上是在中断中可否引发调度的问题，这个问题被在网上多次被激烈的讨论过，但我还是没有看到一个很完美的答案，所以这里我说一下自己的理解。欢迎留言讨论、指正或者批评。

---

| 软件版本  | 硬件版本 | 更新内容 |
|---------|--------|----------|
|linux 4.4|x86 & arm64|        |

---
## 1. 问题前置条件

### 1.1 内核版本需要是比较新的版本 <Badge text="linux-4.4以上"/>

这里为什么需要指定内核版本，原因是在很老的内核和现在的内核在中断的处理上存在以下区别

1. 老内核中会有fast handler和slow handler之分而新版内核不存在
2. 新版的内核中都是会关中断不会出现中断嵌套的情况
3. 讨论的情况会涉及强占太老的内核不支持


### 1.2 硬件CPU需要是多核的

需要是多核的原因如下：

1. 在单核中这个问题比较简单讨论意义不大
2. 现在的生产环境中单核CPU运行linux情况比较少

### 1.3 这里中断只指异步中断

在同步中断睡眠或者调度本来就是可以的，也不会引起内核发生错误。

## 2. 问题分析与结论

其实答案大家都已明白，所以我这里先给结论：

::: tip 结论
中断中不允许睡眠或者调度，且不存在能不能与应不应该的问题。
:::

下面我们来说明为什么不能，这个问题从正面回答比较难，那我们从反向来回答。
我们从先假设在中断可以被调度，那么就表示在整个内核的运行过程不会因为在中断中发生调度而引发一些问题。如果在内核运行过程存在因中断发生调度而引起别的问题，那么这个假设就是错误的。
在下面的场景中,这个假设是错误的。

### 2.1  中断后续代码永远无法执行的问题

在中断中出现调度，会出现中断处理程序在发生调度之后的代码永远无法执行的问题,下面分两种情况来讨论。<br>   
**情况1**:通常我们认为，发生中断时执行中断处理函数执行所使用的栈是发生中断时CPU正在执行的进程的栈，如果是这种情况下，即使发生调度，一般情况下中断处理函数在调度之后的代码会得到运行，因为最终一定会有一个时刻被中断的进程会再次调试运行。
::: warning 注意
这里说的是一般情况下，那很有一些特殊情况下可能就无法执行，比如下面两种情况：
1. 在进程被调度出去的之后被kill掉了。
2. 在中断处理函数中持有了spin_ lock被调度出去后一个高优先级的实时进程又会尝试获取spin lock会出现死锁
:::

**情况2**:中断使用的栈来被中断的进程使用的栈不是同一个栈，中断函数有自己的栈。例如在x86平台会有如下的代码：

```c
bool handle_irq(struct irq_desc *desc, struct pt_regs *regs)
{
	int overflow = check_stack_overflow();

	if (IS_ERR_OR_NULL(desc))
		return false;

	if (user_mode(regs) || !execute_on_irq_stack(overflow, desc)) {
		if (unlikely(overflow))
			print_stack_overflow();
		generic_handle_irq_desc(desc);
	}

	return true;
}

static inline int execute_on_irq_stack(int overflow, struct irq_desc *desc)
{
	struct irq_stack *curstk, *irqstk;
	u32 *isp, *prev_esp, arg1;

	curstk = (struct irq_stack *) current_stack();
	irqstk = __this_cpu_read(hardirq_stack);

	/*
	 * this is where we switch to the IRQ stack. However, if we are
	 * already using the IRQ stack (because we interrupted a hardirq
	 * handler) we can't do that and just have to keep using the
	 * current stack (which is the irq stack already after all)
	 */
	if (unlikely(curstk == irqstk))
		return 0;

	isp = (u32 *) ((char *)irqstk + sizeof(*irqstk));

	/* Save the next esp at the bottom of the stack */
	prev_esp = (u32 *)irqstk;
	*prev_esp = current_stack_pointer;

	if (unlikely(overflow))
		call_on_stack(print_stack_overflow, isp);

	asm volatile("xchgl	%%ebx,%%esp	\n"
		     CALL_NOSPEC
		     "movl	%%ebx,%%esp	\n"
		     : "=a" (arg1), "=b" (isp)
		     :  "0" (desc),   "1" (isp),
			[thunk_target] "D" (desc->handle_irq)
		     : "memory", "cc", "ecx");
	return 1;
}

```
也就是在中断服务运行时，会切换为中断栈，如果此时发生调度，那上下文信息被保存到中断栈中，而不是被中断的进程栈上。而调度的最小单位是进程，但被调度的进程再次调度回来时，也没有中断的相关上下文也不会再执行。



### 2.2 中断丢失的问题

这个问题可能是上面两个问题的衍生问题，就是在以上两种情况中，都会出现中断得不到响应或者丢失的情况，因为在中断处理过程中是关中断的。即使在多核系统中，这个时候中断会被分配到别的核，但是linux特点就是如果当前中断在别的核正在处理，那么它仅仅会设置pending状态去委托别正在处理该中断源的核去处理，然后就会退出，所以在这种情况下，就会存在中断丢失的问题或者至少可以称会存在外设状态或者数据丢失的情况，尤其的在2.1中使用单独的中断栈的情况，问题就更加严重。

### 2.3 其他的一些问题

这有一些中断调度产生问题，这些问题仅仅是一些公平性和配置方面的问题，而不是中断不能调度的的充分条件。

1. 一个正常运行的进程，被中断还要被调度出去强制让出CPU，这个很不公平。
2. 在一些产商提供的内核中schedule会检测是否在中断上下文中，如果在基本都会panic 

## 3. 结论

结论说是中断上下文中不可以睡觉或者调度，欢迎大家留言讨论，批评指正。

---
::: tip  

转载请注明出处！ [探索者](http://www.tsz.wiki)

:::

---
<Vssue :title="$title"/>
