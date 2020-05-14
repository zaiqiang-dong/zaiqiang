## 权重计算

### weight

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

static const int prio_to_weight[40] = {
 /* -20 */     88761,     71755,     56483,     46273,     36291,
 /* -15 */     29154,     23254,     18705,     14949,     11916,
 /* -10 */      9548,      7620,      6100,      4904,      3906,
 /*  -5 */      3121,      2501,      1991,      1586,      1277,
 /*   0 */      1024,       820,       655,       526,       423,
 /*   5 */       335,       272,       215,       172,       137,
 /*  10 */       110,        87,        70,        56,        45,
 /*  15 */        36,        29,        23,        18,        15,
};

```
这里有一个10%效应和一个1.25系数，这里假设有两个进程A和B，优先级均为120（对应用户态就是nice=0）,那两个进程在系统中应该各使用505的cpu.通过注释可以看出，如果一个进程优先级上升1个级别，它将少使用大约10%的cpu,如果下降一个level则多使用大约10%的cpu.这样两个之间相关大约25%，也就是一个1.25的系数.

### inverse weight
这个中间weight值仅仅是为了计算方便，避免系统进行除法运算，预先计算好一个值，后面会看到怎么使用这个中间值。公式如下：

$$inv\_weight = \frac{2^{32}}{weight}$$

```c
static const u32 prio_to_wmult[40] = {
 /* -20 */     48388,     59856,     76040,     92818,    118348,
 /* -15 */    147320,    184698,    229616,    287308,    360437,
 /* -10 */    449829,    563644,    704093,    875809,   1099582,
 /*  -5 */   1376151,   1717300,   2157191,   2708050,   3363326,
 /*   0 */   4194304,   5237765,   6557202,   8165337,  10153587,
 /*   5 */  12820798,  15790321,  19976592,  24970740,  31350126,
 /*  10 */  39045157,  49367440,  61356676,  76695844,  95443717,
 /*  15 */ 119304647, 148102320, 186737708, 238609294, 286331153,
};

```
### vruntime


$$vruntime = \frac{delta\_exec,*nice\_0\_weight}{weight}$$
$$ = \frac{delta\_exec,*nice\_0\_weight * 2^{32}}{weight} >>32$$
$$ = delta\_exec*nice\_0\_weight * inv\_weight >> 32$$

::: tip

 delta_exec 为调度周期，如果进程数小于8,delta_exec = 6ms.否则：
 $$
 delta\_exec = 进程数 * 0.75
 $$

:::

### runnable_avg_sum
调试实体在就绪队列里可运行状态下总的衰减累加时间

### runnable_avg_period
调试实体在系统中总的衰减累加时间

### load_avg_contrib
进程平均负载贡献度


### runnable_avg_yN_inv

一个进程的负载贡献在当前1024us为a0,在下一个1024us,这个值对未来的影响应该衰减（这个就好像你因为一件事，生一个人的气，随着时间推移，会慢慢减小），这里假设为a1，假设衰减因子为y,那么a1,a0,y会存在如下关系：
$$
a_1=a_0*y
$$

这里面的y是由内核的大神确定的，基本的原理，就是希望贡献在32个周期之后衰减为原来的一半，也就是
$$
y^{32} = 0.5
$$

所以y = 0.978520621

那第计算一个贡献在a在经过n周期（1024us）后衰减为：
$$
	a_n = a * y^n = \frac{a * (y^n * 2^{32})}{2^{32}} = a * (y^n * 2^{32}) >> 32
$$

之所以做上面的公式变换是为了不做浮点运算，提高计算效率。怎么提高,就是把
$$$(y^n * 2^{32})$$$
从n=0到n=31提前计算好放到数组中，如下所示：

```c
/* Precomputed fixed inverse multiplies for multiplication by y^n */
static const u32 runnable_avg_yN_inv[] = {
	0xffffffff, 0xfa83b2da, 0xf5257d14, 0xefe4b99a, 0xeac0c6e6, 0xe5b906e6,
	0xe0ccdeeb, 0xdbfbb796, 0xd744fcc9, 0xd2a81d91, 0xce248c14, 0xc9b9bd85,
	0xc5672a10, 0xc12c4cc9, 0xbd08a39e, 0xb8fbaf46, 0xb504f333, 0xb123f581,
	0xad583ee9, 0xa9a15ab4, 0xa5fed6a9, 0xa2704302, 0x9ef5325f, 0x9b8d39b9,
	0x9837f050, 0x94f4efa8, 0x91c3d373, 0x8ea4398a, 0x8b95c1e3, 0x88980e80,
	0x85aac367, 0x82cd8698,
};

```

### runnable_avg_yN_sum

假设一个进程从一个102us开始跑，跑了n个1024us,这个他的负载贡献怎么计算

$$
S_n = a_1 + a_2 + a_3 +  .... +a_n
$$

$$
a_1 = 1024 * y^n
$$

$$
a_2 = 1024 * y^{n - 1}
$$

$$
.
$$

$$
a_n = 1024 * y
$$

$$
S_n = 1024*(y^1 + y^2 + . . . + y^n)
$$

为了计算方便内核计算了n=0到n=32的和，如下所示：
```c
static const u32 runnable_avg_yN_sum[] = {
	    0, 1002, 1982, 2941, 3880, 4798, 5697, 6576, 7437, 8279, 9103,
	 9909,10698,11470,12226,12966,13690,14398,15091,15769,16433,17082,
	17718,18340,18949,19545,20128,20698,21256,21802,22336,22859,23371,
};

```
$$
runnable\_avg\_yN\_sum[n] = 1024*(y^1+y^2+y^3.....+y^n)
$$


### scale_freq
表示 当前freq 相对 本cpu最大freq 的比值
$$scale\_freq = \frac{cpu\_curr\_freq }{cpu\_max\_freq}*1024$$

### scale_cpu
表示 (当前cpu最大运算能力 相对 所有cpu中最大的运算能力 的比值) * (cpufreq_policy的最大频率 相对 本cpu最大频率 的比值)
$$scale\_cpu = \frac{cpu\_scale * max\_freq\_scale}{1024}$$

### cpu_scale
表示 当前cpu最大运算能力 相对 所有cpu中最大的运算能力 的比值.当前cpu的最大运算能力等于当前cpu的最大频率乘以当前cpu每clk的运算能力efficiency，efficiency相当于DMIPS，A53/A73不同架构每个clk的运算能力是不一样的
$$cpu\_scale = (\frac{cpu\_max\_freq * efficiency}{max\_cpu\_perf})* 1024$$

### max_freq_scale
表示 cpufreq_policy的最大频率 相对 本cpu最大频率 的比值
$$
max\_freq\_scale = \frac{policy->max}{cpuinfo->max\_freq} * 1024
$$
