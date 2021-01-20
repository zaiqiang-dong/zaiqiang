
# RAMDUMP分析

---

| 软件版本  | 硬件版本 | 更新内容 |
|---------|--------|----------|
|linux 4.4| arm64   |        |

---

## 1.概述
在一些BUG场景中是无法在线调试的，如系统突然panic，而且是一种复现概率很低的情况，再有系统突然卡死无任何反应。这个时候在线调度就无法介入来分析bug.但是一般的嵌入式系统都会提供一些ramdump的机制，这个ramdump就是crash的时刻内存的所有信息，所以ramdump文件的大小基本等于实际内存的大小，这个ramdump文件就可以用来分析panic或者其它问题的原因。

## 2. RAMDUMP获取

这个RAMDUMP获取应该各个平台都不太一样，具体查自己使用的平台文档。我这里使用是的高通平台，所以我使用高通平台来说明。为了演示，我这里手动通过如下两条命令来触发一个panic

```c
echo 1 > /sys/module/msm_poweroff/parameters/download_mode
echo c > /proc/sysrq-trigger
```
当然生产环境中，需要修改代码来控制当系统遇到panic直接自动进入ramdump模式，具体看各个平台的相关文档。
通过上面两条命令，我手里的设备就是进入ramdump模式，高通平台是通过usb来进行dump的，所以我通过usb连接的设备，在pc端可以看到usb端口为900e.说明这时系统已经进入dump模式。
进入dump模式后，我们通过相关的工具或者接口来获取ramdump.在高通平台有两种方式来获取

- 通过QPST，高通提供的工具,连接上设备会自动进行ramdump
- 通过python脚本，高通提供相关的python接口，调用就可以获得ramdump

我这里通过QPST来获取，连接上设备大约3分钟左右（具体看你平台的内存大小还有usb版本），可以获取完成,完成后会得到如下文件：

```c
CODERAM.BIN   DDRCS1_0.BIN   FSM_STS.BIN   IPA_MBOX.BIN  MSGRAM10.BIN  MSGRAM15.BIN  MSGRAM5.BIN  OCIMEM.BIN    SHRM_MEM.BIN
DATARAM.BIN   DDRCS1_1.BIN   IPA_DRAM.BIN  IPA_SEQ.BIN   MSGRAM11.BIN  MSGRAM1.BIN   MSGRAM6.BIN  PIMEM.BIN     SN_C3D53934
DCC_SRAM.BIN  DDR_DATA.BIN   IPA_GSI1.BIN  IPA_SRAM.BIN  MSGRAM12.BIN  MSGRAM2.BIN   MSGRAM7.BIN  PMIC_PON.BIN
DDRCS0_0.BIN  dump_info.txt  IPA_HRAM.BIN  load.cmm      MSGRAM13.BIN  MSGRAM3.BIN   MSGRAM8.BIN  PMON_HIS.BIN
DDRCS0_1.BIN  FSM_CTRL.BIN   IPA_IRAM.BIN  MSGRAM0.BIN   MSGRAM14.BIN  MSGRAM4.BIN   MSGRAM9.BIN  RST_STAT.BIN4
```
在高通平台ramdump出来的文件很多，下面的文件就是内核内存信息

```c
DDRCS0_0.BIN  DDRCS0_1.BIN  DDRCS1_0.BIN  DDRCS1_1.BIN  DDR_DATA.BIN 
```
## 3. RAMDUMP解析

### 3.1 通过平台特定的工具来解析 
在高通平台提供一个工具来解析，这个工具可以通过下面两个方式获取到

- 在高通提供的源码中获取 (vendor/qcom/opensource/tools)
- 从git://codeaurora.org/quic/la/platform/vendor/qcom-opensource/tools克隆

拿到工具后，就可以进行解析了，我这里写了下面脚本dumppraser.sh来解析

```c
if [ $# -lt 4 ]
then
    echo "Need 4 parameters"
    echo "1. ramdump file path"
    echo "2. vmlinux file path"
    echo "3. ramdump parser path"
    echo "   git clone git://codeaurora.org/quic/la/platform/vendor/qcom-opensource/tools"
    echo "4. out path"
    exit 8
fi

ramdump=$1
vmlinux=$2/vmlinux
outdir=$4
ramparse_dir=$3

gdb="/usr/bin/aarch64-linux-gnu-gdb"
nm="/usr/bin/aarch64-linux-gnu-gcc-nm"
objdump="/usr/bin/aarch64-linux-gnu-objdump"


python $ramparse_dir/ramparse.py -v $vmlinux -g $gdb  -n $nm  -j $objdump -a $ramdump -o $outdir --force-hardware sdm845 -x


```
这个脚本需要4个参数：

- ramdump 文件的路径
- vmlinux 文件的路径
- praser 的路径也就是工具的路径
- 输出目录

另外脚本的gdb,nm这些工具的路径是我本地的配置，你需要根据你自己的路径来修改

::: tip Tip 

- 另外脚本的gdb,nm这些工具的路径是我本地的配置，你需要根据你自己的路径来修改
- 获取的通过工具需要一个local_settings.py文件，这个文件用来设置gdb等工具路径，我们在脚本是已经设置，但还是需要创建这个文件，否则会出错
- 在解析过程需要vmlinux，注意这个vmlinux必须是你设备烧录的镜像对应的vmlinux,也就是你编译boot.img会同时生成的vmlinux

:::

我这里将dumppraser.sh拷贝到ramdump目录下，并将vmlunxu也拷贝到这个目录下，我们解析工具是在上层目录下的 **../tools/linux-ramdump-parser-v2** 所以我通过下面命令来解析

```c
 ./dumppraser.sh . . ../tools/linux-ramdump-parser-v2/ ./out
```
如里看到下面的输出表示正在解析

```c
[1/35] --clock-dump ... 1.778102s
    [2/35] --cpr3-info ... NOTE: 'kryo_regulator_list' list not found to extract kryo_addr information
0.060217s
    [3/35] --cpr-info ... 0.029881s
    [4/35] --cpu-state ... 0.162867s
    [5/35] --ddr-compare ... 2.657010s
    [6/35] --check-for-watchdog ... 0.064028s
    [7/35] --watchdog ... 1.425430s
    [8/35] --parse-debug-image ... FAILED! 21.200236s
    [9/35] --dmesg ... 0.344962s
    [10/35] --print-iommu-pg-tables ... 2.491361s
    [11/35] --print-ipc-logging ...

```
解析输出会在 **./out** 目录下，如下所示

```c
arm_iommu_domain_00.txt  arm_iommu_domain_21.txt  core4_regs.cmm               secure_world_core2_regs.cmm
arm_iommu_domain_01.txt  arm_iommu_domain_22.txt  core5_regs.cmm               secure_world_core3_regs.cmm
arm_iommu_domain_02.txt  arm_iommu_domain_23.txt  core6_regs.cmm               secure_world_core4_regs.cmm
arm_iommu_domain_03.txt  arm_iommu_domain_24.txt  core7_regs.cmm               secure_world_core5_regs.cmm
arm_iommu_domain_04.txt  arm_iommu_domain_25.txt  cpr3_info.txt                secure_world_core6_regs.cmm
arm_iommu_domain_05.txt  arm_iommu_domain_26.txt  cprinfo.txt                  secure_world_core7_regs.cmm
arm_iommu_domain_06.txt  arm_iommu_domain_27.txt  DDRCacheCompare.txt          spm.txt
arm_iommu_domain_07.txt  arm_iommu_domain_28.txt  dmesg_TZ.txt                 t32_config.t32
arm_iommu_domain_08.txt  arm_iommu_domain_29.txt  fcm.bin                      t32_startup_script.cmm
arm_iommu_domain_09.txt  arm_iommu_domain_30.txt  kconfig.txt                  tasks_sched_stats0.txt
arm_iommu_domain_10.txt  arm_iommu_domain_31.txt  l1_cache.txt                 tasks_sched_stats1.txt
arm_iommu_domain_11.txt  arm_iommu_domain_32.txt  launch_t32.sh                tasks_sched_stats2.txt
arm_iommu_domain_12.txt  arm_iommu_domain_33.txt  lpm.txt                      tasks_sched_stats3.txt
arm_iommu_domain_13.txt  arm_iommu_domain_34.txt  memory.txt                   tasks_sched_stats4.txt
arm_iommu_domain_14.txt  arm_iommu_domain_35.txt  mem_stat.txt                 tasks_sched_stats5.txt
arm_iommu_domain_15.txt  arm_iommu_domain_36.txt  mmcreport.txt                tasks_sched_stats6.txt
arm_iommu_domain_16.txt  ClockDumps.txt           page_tables.txt              tasks_sched_stats7.txt
arm_iommu_domain_17.txt  core0_regs.cmm           pmicdump.xml                 tasks.txt
arm_iommu_domain_18.txt  core1_regs.cmm           roareadiff.txt               thermal_info.txt
arm_iommu_domain_19.txt  core2_regs.cmm           secure_world_core0_regs.cmm  timerlist.txt
arm_iommu_domain_20.txt  core3_regs.cmm           secure_world_core1_regs.cmm  vmalloc.txt
```

这里面对我们比较重要就是 **dmesg_TZ.txt** ，这里面会有cpu寄存器的值，dmesg等信息，还有很多其它重要信息，根据需要查看。

### 3.2 通过高通网站来解析
这个很简单，就是把dump文件上传到高通的网站就可以解析了，当然，这个是需要有账号的，地址：https://cap.qti.qualcomm.com/default.aspx


### 3.3 通过crash工具来解析

这个是我认为最好的解析方式，它提供的功能非常强大。
首先我们来获取crash工具,通过下面的方式来获取编译crash
```c

git clone  https://github.com/crash-utility/crash.git
make target=ARM64
```
这里通过 **target=ARM64** 来编译出我们需要的crash. 执行./crash会看到如下输出：

```c
❯ ./crash        

crash 7.2.9++
Copyright (C) 2002-2020  Red Hat, Inc.
Copyright (C) 2004, 2005, 2006, 2010  IBM Corporation
Copyright (C) 1999-2006  Hewlett-Packard Co
Copyright (C) 2005, 2006, 2011, 2012  Fujitsu Limited
Copyright (C) 2006, 2007  VA Linux Systems Japan K.K.
Copyright (C) 2005, 2011  NEC Corporation
Copyright (C) 1999, 2002, 2007  Silicon Graphics, Inc.
Copyright (C) 1999, 2000, 2001, 2002  Mission Critical Linux, Inc.
This program is free software, covered by the GNU General Public License,
and you are welcome to change it and/or distribute copies of it under
certain conditions.  Enter "help copying" to see the conditions.
This program has absolutely no warranty.  Enter "help warranty" for details.
 

crash: compiled for the ARM64 architecture

```
最后一行，显示了它对应的平台。

到这里我们工具就准备好了，下面我们 **cd** 到ramdump目录下，将vmlinxu来拷贝过来，通过下面指令来解析
```c
../crash/crash vmlinux --kaslr=0xe0c800000 DDRCS0_0.BIN@0x80000000,DDRCS1_0.BIN@0x140000000,DDRCS0_1.BIN@0x100000000,DDRCS1_1.BIN@0x1c0000000
```
解析之前我们做一个说明：
- vmlinux 和3.1中的解析一样，也是需要对应的vmlinux
- kaslr 这个内核的一个机制可以做到每次开机kernel image映射的虚拟地址都不一样，所以这里要指定
这个地址怎么获取，两种方式
  - hexdump  -e '16/4 "%08x " "\n"' -s 0x03f6d4 -n 8 OCIMEM.BIN
    ```c
    ❯ hexdump  -e '16/4 "%08x " "\n"' -s 0x03f6d4 -n 8 OCIMEM.BIN
    0c800000 0000000e
    ```
  组合，变成 0xe0c800000

  - 在3.1中的对dump的解析中已经提供 在解析输出的 **dmesg_TZ.txt** 文件中有如下内容,可以得到kaslr：

    ```c
    TZ address: 146bf658
    Adding ./DDRCS0_0.BIN 80000000--ffffffff
    Adding ./DDRCS0_1.BIN 100000000--13fffffff
    Adding ./DDRCS1_0.BIN 140000000--1bfffffff
    Adding ./DDRCS1_1.BIN 1c0000000--1ffffffff
    Adding ./OCIMEM.BIN 14680000--146bffff
    Adding ./PIMEM.BIN 1c000000--1c4fffff
    The kaslr_offset extracted is: 0xe0c800000
    The kimage_voffset extracted is: ffffff8d94800000
    
    ```
   -  类似 DDRCS0_0.BIN@0x80000000 后面的地址从那获取，在dump目录下有一文件叫 **load.cmm**,这个文件中有如下内容：

    ```c
    if OS.FILE(DDRCS0_0.BIN)
    (
      d.load.binary DDRCS0_0.BIN 0x80000000 /noclear
    )
    if OS.FILE(DDRCS0_1.BIN)
    (
      d.load.binary DDRCS0_1.BIN 0x100000000 /noclear
    )
    if OS.FILE(DDRCS1_0.BIN)
    (
      d.load.binary DDRCS1_0.BIN 0x140000000 /noclear
    )
    if OS.FILE(DDRCS1_1.BIN)
    (
      d.load.binary DDRCS1_1.BIN 0x1c0000000 /noclear
    )

    ```
执行完上面的指令可以看到如下输出：

```C
crash 7.2.9++
Copyright (C) 2002-2020  Red Hat, Inc.
Copyright (C) 2004, 2005, 2006, 2010  IBM Corporation
Copyright (C) 1999-2006  Hewlett-Packard Co
Copyright (C) 2005, 2006, 2011, 2012  Fujitsu Limited
Copyright (C) 2006, 2007  VA Linux Systems Japan K.K.
Copyright (C) 2005, 2011  NEC Corporation
Copyright (C) 1999, 2002, 2007  Silicon Graphics, Inc.
Copyright (C) 1999, 2000, 2001, 2002  Mission Critical Linux, Inc.
This program is free software, covered by the GNU General Public License,
and you are welcome to change it and/or distribute copies of it under
certain conditions.  Enter "help copying" to see the conditions.
This program has absolutely no warranty.  Enter "help warranty" for details.
 
GNU gdb (GDB) 7.6
Copyright (C) 2013 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.  Type "show copying"
and "show warranty" for details.
This GDB was configured as "--host=x86_64-unknown-linux-gnu --target=aarch64-elf-linux"...

WARNING: kernel relocated [57544MB]: patching 152839 gdb minimal_symbol values

      KERNEL: vmlinux                                                  
   DUMPFILES: /var/tmp/ramdump_elf_QGC1Qk [temporary ELF header]
              DDRCS0_0.BIN
              DDRCS1_0.BIN
              DDRCS0_1.BIN
              DDRCS1_1.BIN
        CPUS: 8
        DATE: Tue Jan 19 20:16:31 CST 2021
      UPTIME: 00:02:01
LOAD AVERAGE: 0.86, 0.51, 0.20
       TASKS: 1795
    NODENAME: localhost
     RELEASE: 4.9.65+
     VERSION: #5 SMP PREEMPT Tue Jan 19 18:05:07 CST 2021
     MACHINE: aarch64  (unknown Mhz)
      MEMORY: 5.7 GB
       PANIC: "sysrq: SysRq : Trigger a crash"
         PID: 3062
     COMMAND: "sh"
        TASK: fffffff266c0d700  [THREAD_INFO: fffffff266c0d700]
         CPU: 5
       STATE: TASK_RUNNING (SYSRQ)
crash> 

```

上面最后 **crash>** 就可以通过crash的相关指令进行debug了。

## 4.小结

通过对dump的解析，我们可以得到当时现场的很多信息，可以帮助我们来解决一些无法在线解决的问题，尤其是使用 **crash** 这种强大的dubug工具，可以方便的帮助我们解决一些复杂的问题。




---
::: tip Tip 

欢迎评论、探讨,如果发现错误请指正。转载请注明出处！ [探索者](http://www.tsz.wiki) 

:::


---
<Vssue :title="$title"/>
