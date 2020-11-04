# 文件接口

## 1.文件系统
ftrace使用专用的文件系统ftracefs,挂载如下：

```C
tracefs on /sys/kernel/tracing type tracefs (rw,nosuid,nodev,noexec,relatime)
```

## 2.文件接口描述

**current_trace**
当前使用的tracer，默认是nop.

```c
root@M:/sys/kernel/tracing# cat current_tracer 
nop
```

**available_tracers**
当前已经注册的tracer
```c
root@M:/sys/kernel/tracing# cat available_tracers 
hwlat blk mmiotrace function_graph wakeup_dl wakeup_rt wakeup function nop
```
**tracing_on**
- 0 : disable ring buffer
- 1 : enable ring buffer

这个只是针对ring buffer而言，并非禁用了tarce,只是不写入ring buffer.

** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **
** **