
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
```
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

所以在用户空间priority概念只有一个，就是一个-20 to 19整数。



 
---
::: tip  

转载请注明出处！ [探索者](http://www.cxy.wiki)

:::


