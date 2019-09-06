
##权重计算

###weight
```
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
###inverse weight


$$$inv\_weight = \frac{2^{32}}{weight}$$$

```
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
###vruntime


$$$vruntime = \frac{delta*nice\_0\_weight}{weight}$$$
$$$ = \frac{delta*nice\_0\_weight * 2^{32}}{weight} >>32$$$
$$$= delta*nice\_0\_weight * inv\_weight >> 32 $$$



###runnable_avg_sum
调试实体在就绪队列里可运行状态下总的衰减累加时间

###runnable_avg_period
调试实体在系统中总的衰减累加时间

###load_avg_contrib
进程平均负载贡献度


###runnable_avg_yN_inv

原本的衰减因子$$$ y^n ＝  0.5^{\frac{n}{32}}$$$
为了不做浮点运算，使用下面的中间结果。

/* Precomputed fixed inverse multiplies for multiplication by y^n */
static const u32 runnable_avg_yN_inv[] = {
	0xffffffff, 0xfa83b2da, 0xf5257d14, 0xefe4b99a, 0xeac0c6e6, 0xe5b906e6,
	0xe0ccdeeb, 0xdbfbb796, 0xd744fcc9, 0xd2a81d91, 0xce248c14, 0xc9b9bd85,
	0xc5672a10, 0xc12c4cc9, 0xbd08a39e, 0xb8fbaf46, 0xb504f333, 0xb123f581,
	0xad583ee9, 0xa9a15ab4, 0xa5fed6a9, 0xa2704302, 0x9ef5325f, 0x9b8d39b9,
	0x9837f050, 0x94f4efa8, 0x91c3d373, 0x8ea4398a, 0x8b95c1e3, 0x88980e80,
	0x85aac367, 0x82cd8698,
};

$$$runnable\_avg\_yN\_inv[n] = {(0.5^{\frac{n}{32}})}*2^{32}$$$

###runnable_avg_yN_sum
static const u32 runnable_avg_yN_sum[] = {
	    0, 1002, 1982, 2941, 3880, 4798, 5697, 6576, 7437, 8279, 9103,
	 9909,10698,11470,12226,12966,13690,14398,15091,15769,16433,17082,
	17718,18340,18949,19545,20128,20698,21256,21802,22336,22859,23371,
};
$$$runnable\_avg\_yN\_sum[n] = 1024*(y^1+y^2+y^3.....+y^n)$$$


###scale_freq
表示 当前freq 相对 本cpu最大freq 的比值
$$$scale\_freq = \frac{cpu\_curr\_freq }{cpu\_max\_freq}*1024$$$

###scale_cpu
表示 (当前cpu最大运算能力 相对 所有cpu中最大的运算能力 的比值) * (cpufreq_policy的最大频率 相对 本cpu最大频率 的比值)
$$$scale\_cpu = \frac{cpu\_scale * max\_freq\_scale}{1024}$$$

###cpu_scale
表示 当前cpu最大运算能力 相对 所有cpu中最大的运算能力 的比值.当前cpu的最大运算能力等于当前cpu的最大频率乘以当前cpu每clk的运算能力efficiency，efficiency相当于DMIPS，A53/A73不同架构每个clk的运算能力是不一样的
$$$cpu\_scale = (\frac{cpu\_max\_freq * efficiency}{max\_cpu\_perf})* 1024$$$

###max_freq_scale
表示 cpufreq_policy的最大频率 相对 本cpu最大频率 的比值
$$$max\_freq\_scale = \frac{policy->max}{cpuinfo->max\_freq} * 1024$$$