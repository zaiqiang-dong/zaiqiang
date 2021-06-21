(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{419:function(t,e,v){t.exports=v.p+"assets/img/tbl_walks.ecc27536.png"},420:function(t,e,v){t.exports=v.p+"assets/img/ia.058f3549.png"},421:function(t,e,v){t.exports=v.p+"assets/img/l123-e.b1d89300.png"},422:function(t,e,v){t.exports=v.p+"assets/img/l3.034c456a.png"},423:function(t,e,v){t.exports=v.p+"assets/img/l3-p.42a63acc.png"},467:function(t,e,v){"use strict";v.r(e);var s=v(28),_=Object(s.a)({},(function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h1",{attrs:{id:"vmsav8页表"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#vmsav8页表"}},[t._v("#")]),t._v(" VMSAv8页表")]),t._v(" "),s("hr"),t._v(" "),s("table",[s("thead",[s("tr",[s("th",[t._v("软件版本")]),t._v(" "),s("th",[t._v("硬件版本")]),t._v(" "),s("th",[t._v("更新内容")])])]),t._v(" "),s("tbody",[s("tr",[s("td",[t._v("linux 4.14")]),t._v(" "),s("td",[t._v("arm64")]),t._v(" "),s("td",[t._v("first")])])])]),t._v(" "),s("hr"),t._v(" "),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),s("p",[t._v("在本文中，我们只关注地址总线宽度为48bits,页面大小为4k的情况，其它情况请自行参考arm手册。")])]),t._v(" "),s("h2",{attrs:{id:"_0-什么是页表"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_0-什么是页表"}},[t._v("#")]),t._v(" 0 什么是页表")]),t._v(" "),s("p",[t._v("在我们读书的时候，比如我们要读数学书的第三章第四小节的内容，我会可能会按如下操作进行：")]),t._v(" "),s("ol",[s("li",[t._v("找到数学书")]),t._v(" "),s("li",[t._v("打开目录找到第三章")]),t._v(" "),s("li",[t._v("在第三章里找到第四小节对应的页码X")]),t._v(" "),s("li",[t._v("打开书的第X页")]),t._v(" "),s("li",[t._v("读取内容")])]),t._v(" "),s("p",[t._v("当读取内存的数据也是同样方式，只不过查的不是目录而是页表，具体如下图所示\n"),s("img",{attrs:{src:v(419),alt:""}})]),t._v(" "),s("ol",[s("li",[t._v("先从TTBR中拿到页表的基地址Ａ，也就是相当于先找到书")]),t._v(" "),s("li",[t._v("Ａ加上IA[47:39]偏移找到在level0中的页表项也是下一级页表基地址Ｂ， 相当于找章的过程")]),t._v(" "),s("li",[t._v("Ｂ再加IA[38:30]偏移找到在level1中的页表项也就是下一级页表基地址Ｃ，还是相当找章的过程")]),t._v(" "),s("li",[t._v("Ｃ再加IA[29:21]偏移找到在level2中的页表项也就是下一级页表基地址Ｄ，还是相当找章的过程")]),t._v(" "),s("li",[t._v("Ｄ再加IA[20:12]偏移找到在level3中的页表项，这个项也就一个4k页的基地址Ｅ，还是相当找章的过程")]),t._v(" "),s("li",[t._v("Ｅ再加IA[11:0 ]偏移找到在就找到一个页内物理地址Ｆ")]),t._v(" "),s("li",[t._v("读取物理地址Ｆ的值")])]),t._v(" "),s("h2",{attrs:{id:"_1-输入地址"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-输入地址"}},[t._v("#")]),t._v(" 1 输入地址")]),t._v(" "),s("p",[t._v("输入地址（IA）大致情况如下图所示：\n"),s("img",{attrs:{src:v(420),alt:"ia"}}),t._v("\n说明：")]),t._v(" "),s("ul",[s("li",[t._v("IA[47:39]　level0页表索引")]),t._v(" "),s("li",[t._v("IA[38:30]　level1页表索引")]),t._v(" "),s("li",[t._v("IA[29:21]　level2页表索引，如果是块映射，那个这几个bit将做为OA[29:21]")]),t._v(" "),s("li",[t._v("IA[20:12]　level3页表索引，如果是块映射，那个这几个bit将做为OA[20:12]")]),t._v(" "),s("li",[t._v("IA[11:00]　页内偏移，也就是输出地址的OA[11:00]")])]),t._v(" "),s("p",[t._v("以上这个表基本和内核文档中的表述是一致的")]),t._v(" "),s("div",{staticClass:"language- line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-text"}},[s("code",[t._v("+--------+--------+--------+--------+--------+--------+--------+--------+\n|63    56|55    48|47    40|39    32|31    24|23    16|15     8|7      0|\n+--------+--------+--------+--------+--------+--------+--------+--------+\n |                 |         |         |         |         |\n |                 |         |         |         |         v\n |                 |         |         |         |   [11:0]  in-page offset\n |                 |         |         |         +-> [20:12] L3 index\n |                 |         |         +-----------\x3e [29:21] L2 index\n |                 |         +---------------------\x3e [38:30] L1 index\n |                 +-------------------------------\x3e [47:39] L0 index\n +-------------------------------------------------\x3e [63] TTBR0/1\n\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br"),s("span",{staticClass:"line-number"},[t._v("8")]),s("br"),s("span",{staticClass:"line-number"},[t._v("9")]),s("br"),s("span",{staticClass:"line-number"},[t._v("10")]),s("br"),s("span",{staticClass:"line-number"},[t._v("11")]),s("br"),s("span",{staticClass:"line-number"},[t._v("12")]),s("br")])]),s("h2",{attrs:{id:"_2-页表项"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-页表项"}},[t._v("#")]),t._v(" 2 页表项")]),t._v(" "),s("h3",{attrs:{id:"_2-1-level-0-1-2页表的项"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-1-level-0-1-2页表的项"}},[t._v("#")]),t._v(" 2.1  level 0,1,2页表的项")]),t._v(" "),s("p",[s("img",{attrs:{src:v(421),alt:""}}),t._v("\n我们主要讨论Table且m=12的页表项,逐个bit说明，其他的自行参考arm手册")]),t._v(" "),s("ul",[s("li",[t._v("BIT[0],0表示无效的项，1表示有效的项")]),t._v(" "),s("li",[t._v("BIT[1],0表示输出地址为一个块地址，１表示输出地址为下一级table基地址")]),t._v(" "),s("li",[t._v("BIT[11:2],忽略")]),t._v(" "),s("li",[t._v("BIT[47:12],输出地址")]),t._v(" "),s("li",[t._v("BIT[51:48],RES0")]),t._v(" "),s("li",[t._v("BIT[52:58],忽略")]),t._v(" "),s("li",[t._v("BIT[59],定义了后续 lookup 操作的 PXN 属性")]),t._v(" "),s("li",[t._v("BIT[60],定义了后续 lookup 操作的 XN 属性")]),t._v(" "),s("li",[t._v("BIT[62:61],定义了后续 lookup 操作的访问权限控制位 (Access permissions)")]),t._v(" "),s("li",[t._v("BIT[63],Non-secure state 下的内存访问, bit[63] 没有意义")])]),t._v(" "),s("h3",{attrs:{id:"_2-2-level-3页表的项"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-2-level-3页表的项"}},[t._v("#")]),t._v(" 2.2  level 3页表的项")]),t._v(" "),s("p",[s("img",{attrs:{src:v(422),alt:""}})]),t._v(" "),s("p",[t._v("这里主要关注bit[47:12],这些bit再加上IA[11:0]就是最终的物理地址。")]),t._v(" "),s("ul",[s("li",[t._v("BIT[0],0无效项，1表示有效")]),t._v(" "),s("li",[t._v("BIT[1],0与bit[0]一样，1表示包含了 4KB、16KB 或者 64KB page 的地址和属性信息")]),t._v(" "),s("li",[t._v("BIT[11:2],属性")]),t._v(" "),s("li",[t._v("BIT[47:12],这些bit再加上IA[11:0]就是最终的物理地址")]),t._v(" "),s("li",[t._v("BIT[50:48],RES0")]),t._v(" "),s("li",[t._v("BIT[63:51],属性")])]),t._v(" "),s("p",[t._v("关于属性见下面的表述\n"),s("img",{attrs:{src:v(423),alt:""}}),t._v("\n这里的Upper attributes和Lower attributes就是上图中的bit[63:51],bit[11:2],")]),t._v(" "),s("ul",[s("li",[t._v("BIT[4:2],该 bit 为 Stage 1 memory attributes index,即 MAIR_ELx")]),t._v(" "),s("li",[t._v("BIT[5],Non-secure,用于指示在 Secure state 下发起的内存访问的 translation 的 output address 指向 Secure world 还是 Non-\nsecure world")]),t._v(" "),s("li",[t._v("BIT[7:6],该 bit 为 Data Access Permissions")]),t._v(" "),s("li",[t._v("BIT[9:8],该 bit 为 Shareability field")]),t._v(" "),s("li",[t._v("BIT[10],该 bit 为 Access flag")]),t._v(" "),s("li",[t._v("BIT[11],该 bit 为 not global,当 entry 被加载到 TLB 时,该 bit 用于指示 TLB entry 是属于当前 ASID 还是属于所有的 ASID")]),t._v(" "),s("li",[t._v("BIT[52],该 bit 用于指示 translation table entry 是否属于 contiguous set or entries")]),t._v(" "),s("li",[t._v("BIT[53],该 bit 为 Privileged execute-never,决定了 descriptor 所指向的 region 在 EL1 中是否 executable")]),t._v(" "),s("li",[t._v("BIT[54],该 bit 为 Execute-never,决定了 descriptor 所指向的 region 是否 executable")]),t._v(" "),s("li",[t._v("BIT[58:55],忽略")]),t._v(" "),s("li",[t._v("BIT[62:59],PBHA")]),t._v(" "),s("li",[t._v("BIT[63],忽略")])]),t._v(" "),s("h2",{attrs:{id:"小结"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#小结"}},[t._v("#")]),t._v(" 小结")]),t._v(" "),s("p",[t._v("以上就是对VMSAv8页表的描述，更多的信息请自行参考arm手册。")]),t._v(" "),s("hr"),t._v(" "),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[t._v("参考文件")]),t._v(" "),s("p",[s("a",{attrs:{href:"https://www.arm.com/zh/files/downloads/ARMv8_white_paper_v5.pdf",target:"_blank",rel:"noopener noreferrer"}},[t._v("ARMv8_white_paper_v5"),s("OutboundLink")],1)]),t._v(" "),s("p",[s("a",{attrs:{href:"https://silver.arm.com/download/ARM_and_AMBA_Architecture/AR150-DA-70000-r0p0-07eac0/DDI0487E_a_armv8_arm.pdf",target:"_blank",rel:"noopener noreferrer"}},[t._v("Armv8-A architecture profile "),s("OutboundLink")],1)]),t._v(" "),s("p",[s("a",{attrs:{href:"https://www.kernel.org/doc/html/latest/arm64/memory.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("Memory Layout on AArch64 Linux"),s("OutboundLink")],1)])]),t._v(" "),s("hr"),t._v(" "),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),s("p",[t._v("转载请注明出处！ "),s("a",{attrs:{href:"http://www.cxy.wiki",target:"_blank",rel:"noopener noreferrer"}},[t._v("探索者"),s("OutboundLink")],1)])]),t._v(" "),s("hr"),t._v(" "),s("Vssue",{attrs:{title:t.$title}})],1)}),[],!1,null,null,null);e.default=_.exports}}]);