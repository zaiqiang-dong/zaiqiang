(window.webpackJsonp=window.webpackJsonp||[]).push([[23],{443:function(t,s,a){"use strict";a.r(s);var n=a(27),r=Object(n.a)({},(function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"异步中断处理中能否睡眠"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#异步中断处理中能否睡眠"}},[t._v("#")]),t._v(" 异步中断处理中能否睡眠")]),t._v(" "),a("hr"),t._v(" "),a("p",[t._v("中断中能否睡眠或者说是中断中能否调用可能引起睡眠的API，其实本质上是在中断中可否引发调度的问题，这个问题被在网上多次被激烈的讨论过，但我还是没有看到一个很完美的答案，所以这里我说一下自己的理解。欢迎留言讨论、指正或者批评。")]),t._v(" "),a("hr"),t._v(" "),a("table",[a("thead",[a("tr",[a("th",[t._v("软件版本")]),t._v(" "),a("th",[t._v("硬件版本")]),t._v(" "),a("th",[t._v("更新内容")])])]),t._v(" "),a("tbody",[a("tr",[a("td",[t._v("linux 4.4")]),t._v(" "),a("td",[t._v("x86 & arm64")]),t._v(" "),a("td")])])]),t._v(" "),a("hr"),t._v(" "),a("h2",{attrs:{id:"_1-问题前置条件"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-问题前置条件"}},[t._v("#")]),t._v(" 1. 问题前置条件")]),t._v(" "),a("h3",{attrs:{id:"_1-1-内核版本需要是比较新的版本"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-1-内核版本需要是比较新的版本"}},[t._v("#")]),t._v(" 1.1 内核版本需要是比较新的版本 "),a("Badge",{attrs:{text:"linux-4.4以上"}})],1),t._v(" "),a("p",[t._v("这里为什么需要指定内核版本，原因是在很老的内核和现在的内核在中断的处理上存在以下区别")]),t._v(" "),a("ol",[a("li",[t._v("老内核中会有fast handler和slow handler之分而新版内核不存在")]),t._v(" "),a("li",[t._v("新版的内核中都是会关中断不会出现中断嵌套的情况")]),t._v(" "),a("li",[t._v("讨论的情况会涉及强占太老的内核不支持")])]),t._v(" "),a("h3",{attrs:{id:"_1-2-硬件cpu需要是多核的"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-2-硬件cpu需要是多核的"}},[t._v("#")]),t._v(" 1.2 硬件CPU需要是多核的")]),t._v(" "),a("p",[t._v("需要是多核的原因如下：")]),t._v(" "),a("ol",[a("li",[t._v("在单核中这个问题比较简单讨论意义不大")]),t._v(" "),a("li",[t._v("现在的生产环境中单核CPU运行linux情况比较少")])]),t._v(" "),a("h3",{attrs:{id:"_1-3-这里中断只指异步中断"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-3-这里中断只指异步中断"}},[t._v("#")]),t._v(" 1.3 这里中断只指异步中断")]),t._v(" "),a("p",[t._v("在同步中断睡眠或者调度本来就是可以的，也不会引起内核发生错误。")]),t._v(" "),a("h2",{attrs:{id:"_2-问题分析与结论"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_2-问题分析与结论"}},[t._v("#")]),t._v(" 2. 问题分析与结论")]),t._v(" "),a("p",[t._v("其实答案大家都已明白，所以我这里先给结论：")]),t._v(" "),a("div",{staticClass:"custom-block tip"},[a("p",{staticClass:"custom-block-title"},[t._v("结论")]),t._v(" "),a("p",[t._v("中断中不允许睡眠或者调度，且不存在能不能与应不应该的问题。")])]),t._v(" "),a("p",[t._v("下面我们来说明为什么不能，这个问题从正面回答比较难，那我们从反向来回答。\n我们从先假设在中断可以被调度，那么就表示在整个内核的运行过程不会因为在中断中发生调度而引发一些问题。如果在内核运行过程存在因中断发生调度而引起别的问题，那么这个假设就是错误的。\n在下面的场景中,这个假设是错误的。")]),t._v(" "),a("h3",{attrs:{id:"_2-1-中断后续代码永远无法执行的问题"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_2-1-中断后续代码永远无法执行的问题"}},[t._v("#")]),t._v(" 2.1  中断后续代码永远无法执行的问题")]),t._v(" "),a("p",[t._v("在中断中出现调度，会出现中断处理程序在发生调度之后的代码永远无法执行的问题,下面分两种情况来讨论。"),a("br"),a("br"),t._v(" "),a("strong",[t._v("情况1")]),t._v(":通常我们认为，发生中断时执行中断处理函数执行所使用的栈是发生中断时CPU正在执行的进程的栈，如果是这种情况下，即使发生调度，一般情况下中断处理函数在调度之后的代码会得到运行，因为最终一定会有一个时刻被中断的进程会再次调试运行。")]),t._v(" "),a("div",{staticClass:"custom-block warning"},[a("p",{staticClass:"custom-block-title"},[t._v("注意")]),t._v(" "),a("p",[t._v("这里说的是一般情况下，那很有一些特殊情况下可能就无法执行，比如下面两种情况：")]),t._v(" "),a("ol",[a("li",[t._v("在进程被调度出去的之后被kill掉了。")]),t._v(" "),a("li",[t._v("在中断处理函数中持有了spin_ lock被调度出去后一个高优先级的实时进程又会尝试获取spin lock会出现死锁")])])]),t._v(" "),a("p",[a("strong",[t._v("情况2")]),t._v(":中断使用的栈来被中断的进程使用的栈不是同一个栈，中断函数有自己的栈。例如在x86平台会有如下的代码：")]),t._v(" "),a("div",{staticClass:"language-c line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-c"}},[a("code",[t._v("bool "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("handle_irq")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("struct")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("irq_desc")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v("desc"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("struct")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("pt_regs")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v("regs"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\t"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),t._v(" overflow "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("check_stack_overflow")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n\t"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("IS_ERR_OR_NULL")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("desc"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\t\t"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" false"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n\t"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("user_mode")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("regs"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("||")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("!")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("execute_on_irq_stack")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("overflow"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" desc"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\t\t"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("unlikely")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("overflow"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\t\t\t"),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("print_stack_overflow")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\t\t"),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("generic_handle_irq_desc")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("desc"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\t"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n\t"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" true"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("static")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("inline")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("execute_on_irq_stack")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("int")]),t._v(" overflow"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("struct")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("irq_desc")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v("desc"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\t"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("struct")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("irq_stack")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v("curstk"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v("irqstk"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\tu32 "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v("isp"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v("prev_esp"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" arg1"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n\tcurstk "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("struct")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("irq_stack")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("current_stack")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\tirqstk "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("__this_cpu_read")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("hardirq_stack"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n\t"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/*\n\t * this is where we switch to the IRQ stack. However, if we are\n\t * already using the IRQ stack (because we interrupted a hardirq\n\t * handler) we can't do that and just have to keep using the\n\t * current stack (which is the irq stack already after all)\n\t */")]),t._v("\n\t"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("unlikely")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("curstk "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("==")]),t._v(" irqstk"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\t\t"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n\tisp "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("u32 "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("char")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("irqstk "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("sizeof")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v("irqstk"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n\t"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/* Save the next esp at the bottom of the stack */")]),t._v("\n\tprev_esp "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("u32 "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("irqstk"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\t"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v("prev_esp "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" current_stack_pointer"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n\t"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("unlikely")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("overflow"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\t\t"),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("call_on_stack")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("print_stack_overflow"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" isp"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n\t"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("asm")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("volatile")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"xchgl\t%%ebx,%%esp\t\\n"')]),t._v("\n\t\t     CALL_NOSPEC\n\t\t     "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"movl\t%%ebx,%%esp\t\\n"')]),t._v("\n\t\t     "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"=a"')]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("arg1"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"=b"')]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("isp"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\t\t     "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v("  "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"0"')]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("desc"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("   "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"1"')]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("isp"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n\t\t\t"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("thunk_target"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"D"')]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("desc"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("->")]),t._v("handle_irq"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\t\t     "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"memory"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"cc"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"ecx"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\t"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br"),a("span",{staticClass:"line-number"},[t._v("6")]),a("br"),a("span",{staticClass:"line-number"},[t._v("7")]),a("br"),a("span",{staticClass:"line-number"},[t._v("8")]),a("br"),a("span",{staticClass:"line-number"},[t._v("9")]),a("br"),a("span",{staticClass:"line-number"},[t._v("10")]),a("br"),a("span",{staticClass:"line-number"},[t._v("11")]),a("br"),a("span",{staticClass:"line-number"},[t._v("12")]),a("br"),a("span",{staticClass:"line-number"},[t._v("13")]),a("br"),a("span",{staticClass:"line-number"},[t._v("14")]),a("br"),a("span",{staticClass:"line-number"},[t._v("15")]),a("br"),a("span",{staticClass:"line-number"},[t._v("16")]),a("br"),a("span",{staticClass:"line-number"},[t._v("17")]),a("br"),a("span",{staticClass:"line-number"},[t._v("18")]),a("br"),a("span",{staticClass:"line-number"},[t._v("19")]),a("br"),a("span",{staticClass:"line-number"},[t._v("20")]),a("br"),a("span",{staticClass:"line-number"},[t._v("21")]),a("br"),a("span",{staticClass:"line-number"},[t._v("22")]),a("br"),a("span",{staticClass:"line-number"},[t._v("23")]),a("br"),a("span",{staticClass:"line-number"},[t._v("24")]),a("br"),a("span",{staticClass:"line-number"},[t._v("25")]),a("br"),a("span",{staticClass:"line-number"},[t._v("26")]),a("br"),a("span",{staticClass:"line-number"},[t._v("27")]),a("br"),a("span",{staticClass:"line-number"},[t._v("28")]),a("br"),a("span",{staticClass:"line-number"},[t._v("29")]),a("br"),a("span",{staticClass:"line-number"},[t._v("30")]),a("br"),a("span",{staticClass:"line-number"},[t._v("31")]),a("br"),a("span",{staticClass:"line-number"},[t._v("32")]),a("br"),a("span",{staticClass:"line-number"},[t._v("33")]),a("br"),a("span",{staticClass:"line-number"},[t._v("34")]),a("br"),a("span",{staticClass:"line-number"},[t._v("35")]),a("br"),a("span",{staticClass:"line-number"},[t._v("36")]),a("br"),a("span",{staticClass:"line-number"},[t._v("37")]),a("br"),a("span",{staticClass:"line-number"},[t._v("38")]),a("br"),a("span",{staticClass:"line-number"},[t._v("39")]),a("br"),a("span",{staticClass:"line-number"},[t._v("40")]),a("br"),a("span",{staticClass:"line-number"},[t._v("41")]),a("br"),a("span",{staticClass:"line-number"},[t._v("42")]),a("br"),a("span",{staticClass:"line-number"},[t._v("43")]),a("br"),a("span",{staticClass:"line-number"},[t._v("44")]),a("br"),a("span",{staticClass:"line-number"},[t._v("45")]),a("br"),a("span",{staticClass:"line-number"},[t._v("46")]),a("br"),a("span",{staticClass:"line-number"},[t._v("47")]),a("br"),a("span",{staticClass:"line-number"},[t._v("48")]),a("br"),a("span",{staticClass:"line-number"},[t._v("49")]),a("br"),a("span",{staticClass:"line-number"},[t._v("50")]),a("br"),a("span",{staticClass:"line-number"},[t._v("51")]),a("br"),a("span",{staticClass:"line-number"},[t._v("52")]),a("br")])]),a("p",[t._v("也就是在中断服务运行时，会切换为中断栈，如果此时发生调度，那上下文信息被保存到中断栈中，而不是被中断的进程栈上。而调度的最小单位是进程，但被调度的进程再次调度回来时，也没有中断的相关上下文也不会再执行。")]),t._v(" "),a("h3",{attrs:{id:"_2-2-中断丢失的问题"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_2-2-中断丢失的问题"}},[t._v("#")]),t._v(" 2.2 中断丢失的问题")]),t._v(" "),a("p",[t._v("这个问题可能是上面两个问题的衍生问题，就是在以上两种情况中，都会出现中断得不到响应或者丢失的情况，因为在中断处理过程中是关中断的。即使在多核系统中，这个时候中断会被分配到别的核，但是linux特点就是如果当前中断在别的核正在处理，那么它仅仅会设置pending状态去委托别正在处理该中断源的核去处理，然后就会退出，所以在这种情况下，就会存在中断丢失的问题或者至少可以称会存在外设状态或者数据丢失的情况，尤其的在2.1中使用单独的中断栈的情况，问题就更加严重。")]),t._v(" "),a("h3",{attrs:{id:"_2-3-其他的一些问题"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_2-3-其他的一些问题"}},[t._v("#")]),t._v(" 2.3 其他的一些问题")]),t._v(" "),a("p",[t._v("这有一些中断调度产生问题，这些问题仅仅是一些公平性和配置方面的问题，而不是中断不能调度的的充分条件。")]),t._v(" "),a("ol",[a("li",[t._v("一个正常运行的进程，被中断还要被调度出去强制让出CPU，这个很不公平。")]),t._v(" "),a("li",[t._v("在一些产商提供的内核中schedule会检测是否在中断上下文中，如果在基本都会panic")])]),t._v(" "),a("h2",{attrs:{id:"_3-结论"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_3-结论"}},[t._v("#")]),t._v(" 3. 结论")]),t._v(" "),a("p",[t._v("结论说是中断上下文中不可以睡觉或者调度，欢迎大家留言讨论，批评指正。")]),t._v(" "),a("hr"),t._v(" "),a("div",{staticClass:"custom-block tip"},[a("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),a("p",[t._v("转载请注明出处！ "),a("a",{attrs:{href:"http://www.tsz.wiki",target:"_blank",rel:"noopener noreferrer"}},[t._v("探索者"),a("OutboundLink")],1)])]),t._v(" "),a("hr"),t._v(" "),a("Vssue",{attrs:{title:t.$title}})],1)}),[],!1,null,null,null);s.default=r.exports}}]);