(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{421:function(s,t,n){s.exports=n.p+"assets/img/Slide1.b7eccef2.png"},422:function(s,t,n){s.exports=n.p+"assets/img/Slide2.61a1545b.png"},423:function(s,t,n){s.exports=n.p+"assets/img/Slide3.1ac5ceb2.png"},456:function(s,t,n){"use strict";n.r(t);var e=n(27),a=Object(e.a)({},(function(){var s=this,t=s.$createElement,e=s._self._c||t;return e("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[e("h1",{attrs:{id:"内存模型"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#内存模型"}},[s._v("#")]),s._v(" 内存模型")]),s._v(" "),e("hr"),s._v(" "),e("table",[e("thead",[e("tr",[e("th",[s._v("软件版本")]),s._v(" "),e("th",[s._v("硬件版本")]),s._v(" "),e("th",[s._v("更新内容")])])]),s._v(" "),e("tbody",[e("tr",[e("td",[s._v("linux 4.14")]),s._v(" "),e("td",[s._v("arm64")]),s._v(" "),e("td",[s._v("first")])])])]),s._v(" "),e("hr"),s._v(" "),e("h2",{attrs:{id:"_0-概述"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#_0-概述"}},[s._v("#")]),s._v(" 0 概述")]),s._v(" "),e("p",[s._v("系统中的物理内存可以用不同的方式处理。最简单的情况是，物理内存从地址0开始，跨越一个连续的范围，直到最大地址。但是，这个范围可能包含CPU无法访问的holes。然后在完全不同的地址上可能有几个相邻的范围。在NUMA，不同的cpu访问不同的内存。")]),s._v(" "),e("p",[s._v("Linux 中对物理内存存在三种模式 :FLATMEM、DISCONTIGMEM和SPARSEMEM。每个体系结构都定义了它支持什么内存模型、默认内存模型是什么以及是否可以手动覆盖该默认值。在arm64中只支持SPARSEMEM，本文的重点也在SPARSEMEM上。")]),s._v(" "),e("h2",{attrs:{id:"_1-flatmem-模型"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#_1-flatmem-模型"}},[s._v("#")]),s._v(" 1 FLATMEM 模型")]),s._v(" "),e("p",[s._v("FLATMEM 模型是最简单的模型。此模型适用于具有连续物理内存(或大部分为连续物理内存)的非numa系统。")]),s._v(" "),e("p",[s._v("在FLATMEM内存模型中，有一个全局mem_map数组，它映射整个物理内存。在mem_map数组中有些条目对应物理内存上holes,与这些holes对应的struct page 结构体没有完全初始化。")]),s._v(" "),e("p",[e("img",{attrs:{src:n(421),alt:""}})]),s._v(" "),e("h2",{attrs:{id:"_2-discontigmem-模型"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#_2-discontigmem-模型"}},[s._v("#")]),s._v(" 2 DISCONTIGMEM 模型")]),s._v(" "),e("p",[s._v("DISCONTIGMEM模型将物理内存视为节点集合，这与Linux NUMA支持的方式类似。对于每个节点，Linux都构造一个独立的内存管理子系统，由struct pglist_data(或简称pg_data_t)表示。pg_data_t包含node_mem_map数组，它映射属于该节点的物理页面。pg_data_t的node_start_pfn字段是属于该节点的第一个页面帧的编号。")]),s._v(" "),e("p",[s._v("每个node_mem_map数组其实就是一个FLATMEM内存模型。")]),s._v(" "),e("div",{staticClass:"custom-block tip"},[e("p",{staticClass:"custom-block-title"},[s._v("DISCONTIGMEM")]),s._v(" "),e("p",[s._v("DISCONTIGMEM 使用情况很少，很快可能被废弃。")])]),s._v(" "),e("p",[e("img",{attrs:{src:n(422),alt:""}})]),s._v(" "),e("h2",{attrs:{id:"_3-sparsemem-模型"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#_3-sparsemem-模型"}},[s._v("#")]),s._v(" 3 SPARSEMEM 模型")]),s._v(" "),e("p",[s._v("SPARSEMEM是Linux中可用的最通用的内存模型，它是惟一支持多个高级特性的内存模型，比如物理内存的热插拔和热删除、非易失性内存设备的替代内存映射以及大型系统内存映射的延迟初始化。")]),s._v(" "),e("p",[s._v("SPARSEMEM模型将物理内存表示为section的集合。section由struct mem_section表示，其中包含section_mem_map，从逻辑上讲，它是指向struct页面数组的指针。使用SECTION_SIZE_BITS和MAX_PHYSMEM_BITS常量指定节的大小和最大节数，这些常量由支持SPARSEMEM的每个体系结构定义。MAX_PHYSMEM_BITS是体系结构支持的物理地址的实际宽度，SECTION_SIZE_BITS是一个任意值。")]),s._v(" "),e("p",[e("img",{attrs:{src:n(423),alt:""}})]),s._v(" "),e("h2",{attrs:{id:"_4-arm64-内存模型"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#_4-arm64-内存模型"}},[s._v("#")]),s._v(" 4 ARM64 内存模型")]),s._v(" "),e("p",[s._v("在 "),e("code",[s._v("mm/Kconfig")]),s._v(" 中有如下配置项目")]),s._v(" "),e("div",{staticClass:"language- line-numbers-mode"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[s._v('config SELECT_MEMORY_MODEL\n\tdef_bool y\n\tdepends on ARCH_SELECT_MEMORY_MODEL\n\nchoice\n\tprompt "Memory model"\n\tdepends on SELECT_MEMORY_MODEL\n\tdefault DISCONTIGMEM_MANUAL if ARCH_DISCONTIGMEM_DEFAULT\n\tdefault SPARSEMEM_MANUAL if ARCH_SPARSEMEM_DEFAULT\n\tdefault FLATMEM_MANUAL\n\nconfig FLATMEM_MANUAL\n\tbool "Flat Memory"\n\tdepends on !(ARCH_DISCONTIGMEM_ENABLE || ARCH_SPARSEMEM_ENABLE) || ARCH_FLATMEM_ENABLE\n\thelp\n\t  This option allows you to change some of the ways that\n\t  Linux manages its memory internally.  Most users will\n\t  only have one option here: FLATMEM.  This is normal\n\t  and a correct option.\n\n\t  Some users of more advanced features like NUMA and\n\t  memory hotplug may have different options here.\n\t  DISCONTIGMEM is a more mature, better tested system,\n\t  but is incompatible with memory hotplug and may suffer\n\t  decreased performance over SPARSEMEM.  If unsure between\n\t  "Sparse Memory" and "Discontiguous Memory", choose\n\t  "Discontiguous Memory".\n\n\t  If unsure, choose this option (Flat Memory) over any other.\n\nconfig DISCONTIGMEM_MANUAL\n\tbool "Discontiguous Memory"\n\tdepends on ARCH_DISCONTIGMEM_ENABLE\n\thelp\n\t  This option provides enhanced support for discontiguous\n\t  memory systems, over FLATMEM.  These systems have holes\n\t  in their physical address spaces, and this option provides\n\t  more efficient handling of these holes.  However, the vast\n\t  majority of hardware has quite flat address spaces, and\n\t  can have degraded performance from the extra overhead that\n\t  this option imposes.\n\n\t  Many NUMA configurations will have this as the only option.\n\n\t  If unsure, choose "Flat Memory" over this option.\n\nconfig SPARSEMEM_MANUAL\n\tbool "Sparse Memory"\n\tdepends on ARCH_SPARSEMEM_ENABLE\n\thelp\n\t  This will be the only option for some systems, including\n\t  memory hotplug systems.  This is normal.\n\n\t  For many other systems, this will be an alternative to\n\t  "Discontiguous Memory".  This option provides some potential\n\t  performance benefits, along with decreased code complexity,\n\t  but it is newer, and more experimental.\n\n\t  If unsure, choose "Discontiguous Memory" or "Flat Memory"\n\t  over this option.\n\nendchoice\n\n')])]),s._v(" "),e("div",{staticClass:"line-numbers-wrapper"},[e("span",{staticClass:"line-number"},[s._v("1")]),e("br"),e("span",{staticClass:"line-number"},[s._v("2")]),e("br"),e("span",{staticClass:"line-number"},[s._v("3")]),e("br"),e("span",{staticClass:"line-number"},[s._v("4")]),e("br"),e("span",{staticClass:"line-number"},[s._v("5")]),e("br"),e("span",{staticClass:"line-number"},[s._v("6")]),e("br"),e("span",{staticClass:"line-number"},[s._v("7")]),e("br"),e("span",{staticClass:"line-number"},[s._v("8")]),e("br"),e("span",{staticClass:"line-number"},[s._v("9")]),e("br"),e("span",{staticClass:"line-number"},[s._v("10")]),e("br"),e("span",{staticClass:"line-number"},[s._v("11")]),e("br"),e("span",{staticClass:"line-number"},[s._v("12")]),e("br"),e("span",{staticClass:"line-number"},[s._v("13")]),e("br"),e("span",{staticClass:"line-number"},[s._v("14")]),e("br"),e("span",{staticClass:"line-number"},[s._v("15")]),e("br"),e("span",{staticClass:"line-number"},[s._v("16")]),e("br"),e("span",{staticClass:"line-number"},[s._v("17")]),e("br"),e("span",{staticClass:"line-number"},[s._v("18")]),e("br"),e("span",{staticClass:"line-number"},[s._v("19")]),e("br"),e("span",{staticClass:"line-number"},[s._v("20")]),e("br"),e("span",{staticClass:"line-number"},[s._v("21")]),e("br"),e("span",{staticClass:"line-number"},[s._v("22")]),e("br"),e("span",{staticClass:"line-number"},[s._v("23")]),e("br"),e("span",{staticClass:"line-number"},[s._v("24")]),e("br"),e("span",{staticClass:"line-number"},[s._v("25")]),e("br"),e("span",{staticClass:"line-number"},[s._v("26")]),e("br"),e("span",{staticClass:"line-number"},[s._v("27")]),e("br"),e("span",{staticClass:"line-number"},[s._v("28")]),e("br"),e("span",{staticClass:"line-number"},[s._v("29")]),e("br"),e("span",{staticClass:"line-number"},[s._v("30")]),e("br"),e("span",{staticClass:"line-number"},[s._v("31")]),e("br"),e("span",{staticClass:"line-number"},[s._v("32")]),e("br"),e("span",{staticClass:"line-number"},[s._v("33")]),e("br"),e("span",{staticClass:"line-number"},[s._v("34")]),e("br"),e("span",{staticClass:"line-number"},[s._v("35")]),e("br"),e("span",{staticClass:"line-number"},[s._v("36")]),e("br"),e("span",{staticClass:"line-number"},[s._v("37")]),e("br"),e("span",{staticClass:"line-number"},[s._v("38")]),e("br"),e("span",{staticClass:"line-number"},[s._v("39")]),e("br"),e("span",{staticClass:"line-number"},[s._v("40")]),e("br"),e("span",{staticClass:"line-number"},[s._v("41")]),e("br"),e("span",{staticClass:"line-number"},[s._v("42")]),e("br"),e("span",{staticClass:"line-number"},[s._v("43")]),e("br"),e("span",{staticClass:"line-number"},[s._v("44")]),e("br"),e("span",{staticClass:"line-number"},[s._v("45")]),e("br"),e("span",{staticClass:"line-number"},[s._v("46")]),e("br"),e("span",{staticClass:"line-number"},[s._v("47")]),e("br"),e("span",{staticClass:"line-number"},[s._v("48")]),e("br"),e("span",{staticClass:"line-number"},[s._v("49")]),e("br"),e("span",{staticClass:"line-number"},[s._v("50")]),e("br"),e("span",{staticClass:"line-number"},[s._v("51")]),e("br"),e("span",{staticClass:"line-number"},[s._v("52")]),e("br"),e("span",{staticClass:"line-number"},[s._v("53")]),e("br"),e("span",{staticClass:"line-number"},[s._v("54")]),e("br"),e("span",{staticClass:"line-number"},[s._v("55")]),e("br"),e("span",{staticClass:"line-number"},[s._v("56")]),e("br"),e("span",{staticClass:"line-number"},[s._v("57")]),e("br"),e("span",{staticClass:"line-number"},[s._v("58")]),e("br"),e("span",{staticClass:"line-number"},[s._v("59")]),e("br"),e("span",{staticClass:"line-number"},[s._v("60")]),e("br"),e("span",{staticClass:"line-number"},[s._v("61")]),e("br"),e("span",{staticClass:"line-number"},[s._v("62")]),e("br"),e("span",{staticClass:"line-number"},[s._v("63")]),e("br")])]),e("p",[s._v("而在 "),e("code",[s._v("arch/arm64/Kconfig")]),s._v(" 只有如下配置")]),s._v(" "),e("div",{staticClass:"language- line-numbers-mode"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[s._v("config ARCH_SPARSEMEM_ENABLE\n\tdef_bool y\n\tselect SPARSEMEM_VMEMMAP_ENABLE\n\n")])]),s._v(" "),e("div",{staticClass:"line-numbers-wrapper"},[e("span",{staticClass:"line-number"},[s._v("1")]),e("br"),e("span",{staticClass:"line-number"},[s._v("2")]),e("br"),e("span",{staticClass:"line-number"},[s._v("3")]),e("br"),e("span",{staticClass:"line-number"},[s._v("4")]),e("br")])]),e("p",[s._v("这样的话当你 "),e("code",[s._v("make menuconfig")]),s._v(" 你只会看到只有 "),e("code",[s._v("Sparse Memory")]),s._v(" 一个选项。也就是说在arm64位平台下只支持 SPARSEMEM_MANUAL")]),s._v(" "),e("hr"),s._v(" "),e("div",{staticClass:"custom-block tip"},[e("p",{staticClass:"custom-block-title"},[s._v("TIP")]),s._v(" "),e("p",[s._v("转载请注明出处！ "),e("a",{attrs:{href:"http://www.cxy.wiki",target:"_blank",rel:"noopener noreferrer"}},[s._v("探索者"),e("OutboundLink")],1)])]),s._v(" "),e("Vssue",{attrs:{title:s.$title}})],1)}),[],!1,null,null,null);t.default=a.exports}}]);