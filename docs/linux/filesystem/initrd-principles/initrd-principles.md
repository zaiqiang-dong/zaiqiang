
# 根文件系统原理

---

| 软件版本  | 硬件版本 | 更新内容 |
|---------|--------|----------|
|linux 4.0| x86_64   |        |

---

## 1 根文件系统简介
根文件系统是linux 内核启动之后加载的第一个文件系统，可以是一种基于内存的文件系统，也可以是一种基于类似磁盘的文件系统（前提是在编译内核已经将改存储介质的驱动程序编译进内核），加载之后会进一步执行init进程或者linuxrc，或者其他任意的程序（只要你愿意），一般执行完init之后，便创建一个shell环境，你就可以通过系统接口使用系统的全部功能。

::: tip

根文件系统存在的最大意义在于让内核在某个文件中找到某个执行程序然后义无反顾的执行下去，在此过程中挂载其他的文件系统。
从而也解决了“先有鸡还有先有蛋的问题”，也就是第一个文件系统挂在那里的问题。

:::

## 2 根文件系统分类
做内核开发或者嵌入式linux系统开发同学，可能被以下名词困扰过：

- initrd.img
- initrd.gz
- initramfs
- cpio-initrd
- image-initrd

仅仅是为了加载根文件系统，然后执行init或者linuxrc创建一个shell环境，为什么会有如些多的名词？这些名词之间是什么关系？如何分类区分？

### 2.1 为什么会有各种各样的根文件系统
linux内核自1991年发布第一版到现在历经30年左右，期间经过无数大神的无数次修改。在此过程中必然会出现一些新的根文件系统，新的机制，其中一些不完美的代码或者机制逐渐被去除或者改善，亦或者被兼容，比如内核2.4是通过image-initrd机制来加载根文件系统，之后2.5又引入cpio-img来加载，image-initrd仍然被兼容。

硬件的变化也是一个重要原因，存储设备无论是内存还是磁盘容量都是按摩尔定律是增加，所以一些考虑内存消耗的机制变的愈加的鸡肋。还有存储设备的多样性，很早之前只有软盘、磁盘这样的存储介质，现在有SCSI, SATA, U盘等各种各样的存储介质，如果想使用这些存储介质作为根文件系统，那么内核中就必须加入这个存储设备的驱动，会使内核变得臃肿，不利于传播和使用。当然我们也可以定制加某特定存储介质的驱动，然后使用该介质作为根文件系统。基于这个原因，我们更倾向于使用基于内存的根文件系统，也就是initrd的机制。而且可以做为临时的根文件系统之后再切到磁盘中的根文件系统，一般PC机是这么的做的，嵌入式一般会使用initrd机制，使用内存做为最终的根文件系统。

### 2.2 根文件系统分类
我们把根文件系统分为如下两大类:

  1. 基于内存的根文件系统
  2. 基于磁盘等存储介质的根文件系统

其中基于内存的根文件系统又可以分为:
  1. Image initrd:如常用的initrd.img
  2. cpio initrd:如initramfs、initrd.gz
![initrd-ty](./initr-type.svg)

::: tip 

- 以上分类是基于根文件系统的制作与使用而进行的分类
- 以上使用名词都源内核代码，当然网上还有很多类似的名词，请自行进行对比归类，都应该找到归类

:::

## 3 根文件系统的制作 

如下的内容我们基于x86_64体系架构进行说明，其实架构也类似，需要exprot相关环境变量 ，如arm64:

```c
export ARCH=arm64
export CROSS_COMPILE=aarch64-linux-gnu-
```


### 3.1 准备原材料

在原材料中最重要的程序就是init进程，换句话说，其它的都可以没有，但是必须有一个init进程，当然名子可以叫别的只需要指定rdinit的启动参数即可，如果我们init进程叫xxx,那么如下指定：
```c
rdinit=/xxxx
```
基于如上的理论，我将采用两种方式来准备原材料。
#### 3.1.1 完全自定义的原材料

在你的工作目录下,我这里是一个叫work的目录，建文件夹`mkidr diy_initrd`,然后`cd diy_initrd`, `touch init.c;vim init.c`编写如下代码

```c
#include <stdio.h>
#include <unistd.h>

int main(int argc, char** argv){
	char *cmd[100];
	/* Wait for last log printf */
	sleep(5);
	printf("Welcome to init !\n");

	while(1){
		printf("Input Cmd: ");
		gets(cmd);
		usleep(300000);
		printf("%s Exe Result: xxx. \n", cmd);
		printf("\n");
	}
}

```
上面这段代码非常简单，就是模拟一个简单的命令输入，反馈结果。执行如下代码编译：

```c
gcc -o ./init ./init.c --static
```
这里编译生成的init就是我们的init进程，我们这里新建立一个文件`mkdir diy-rootfs`,然后`cp ./init ./diy-rootfs`. 
到目前为止，我们diy的原材料就已经全部准备完了，对就是一个init的可执行文件。我们将来会将`diy-rootfs`制作成initrd.

#### 3.1.2 使用busybox做原材料

1. 下载编译busybox
```c
cd work
wget https://www.busybox.net/downloads/busybox-1.32.0.tar.bz
tar -xvf busybox-1.32.0.tar.bz
cd busybox-1.32.0/
make menuconfig

```
然后在弹出的ui做如下配置
将`Settings - > []Build static binary (no shared libs) (NEW) `
修改为`[*] Build static binary (no shared libs)`

之后执行`make -j12`, `make install`,最后你会在当前目录下看到一个叫_install的目录
cd 到 work目录下，`mkdir busybox-rootfs`,`cd busybox-rootfs`,执行如下命令：

```c

mkdir root dev etc bin sbin mnt sys proc lib home tmp var usr
mkdir usr/sbin usr/bin usr/lib usr/modules
mkdir mnt/usb mnt/nfs mnt/etc mnt/etc/init.d
mkdir lib/modules
chmod 1777 tmp
cp ../busybox/__install/\* . -rf

cd ./dev
sudo mknod -m 660 console c 5 1
sudo mknod -m 660 null c 1 3
cd ..
touch ./etc/fstab
echo "proc    /proc   proc    defaults    0   0" > ./etc/fstab
echo "none    /tmp    ramfs   defaults    0   0" >> ./etc/fstab
echo "mdev    /dev    ramfs   defaults    0   0" >> ./etc/fstab
echo "sysfs   /sys    sysfs   defaults    0   0" >> ./etc/fstab
mkdir ./etc/init.d/
touch ./etc/init.d/rcS
chmod 777 ./etc/init.d/rcS

echo "#! /bin/sh" > ./etc/init.d/rcS
echo "/bin/mount -a" > ./etc/init.d/rcS

touch ./etc/inittab

echo "::sysinit:/etc/init.d/rcS" > ./etc/inittab
echo "::respawn:-/bin/sh" >> ./etc/inittab
echo "::restart:/sbin/init" >> ./etc/inittab
echo "::ctrlaltdel:/bin/umount -a -r" >> ./etc/inittab
echo "::shutdown:/bin/umount -a -r" >> ./etc/inittab
echo "::shutdown:/sbin/swapoff –a" >> ./etc/inittab

touch ./etc/group
echo "root:*:0:" > ./etc/group
echo "daemon:*:1:" >> ./etc/group
echo "bin:*:2:" >> ./etc/group
echo "sys:*:3:" >> ./etc/group
echo "adm:*:4:" >> ./etc/group
echo "tty:*:5:" >> ./etc/group
echo "disk:*:6:" >> ./etc/group
echo "lp:*:7:lp" >> ./etc/group
echo "mail:*:8:" >> ./etc/group
echo "news:*:9:" >> ./etc/group
echo "uucp:*:10:" >> ./etc/group
echo "proxy:*:13:" >> ./etc/group
echo "kmem:*:15:" >> ./etc/group
echo "dialout:*:20:" >> ./etc/group
echo "fax:*:21:" >> ./etc/group
echo "voice:*:22:" >> ./etc/group
echo "cdrom:*:24:" >> ./etc/group
echo "floppy:*:25:" >> ./etc/group
echo "tape:*:26:" >> ./etc/group
echo "sudo:*:27:" >> ./etc/group

touch ./etc/profile
echo "# /etc/profile: system-wide .profile file for the Bourne shells" > ./etc/profile
echo "" >> ./etc/profile
echo "echo" >> ./etc/profile
echo "echo "File system is ready"" >> ./etc/profile
echo "echo" >> ./etc/profile
echo "" >> ./etc/profile
echo "USER=\"`id -un`\"" >> ./etc/profile
echo "LOGNAME=$USER" >> ./etc/profile
echo "PS1='[\u@\h \W]\# '" >> ./etc/profile
echo "PATH=$PATH" >> ./etc/profile
echo "HOSTNAME=`/bin/hostname`" >> ./etc/profile
echo "" >> ./etc/profile
echo "export USER LOGNAME PS1 PATH" >> ./etc/profile

ln -sv bin/busybox init

```
到目前为止，基于busybox的原材料也已经准备好。

### 3.2 开始制作

我们这里做两种常用的根文件系统，主要是磁盘形式和cpio-initrd.

#### 3.2.1 制作基于磁盘的根文件系统
这里就不用真实的硬盘了，我们用虚拟磁盘来演示，还是work目录下,选用原材料为busybox-rootfs,其实两种原材料都可以，具体如下：

```c
/*创建一个虚拟磁盘*/
dd if=/dev/zero of=sda-rootfs.img bs=1M count=100
mkfs.ext4 sda-rootfs.img
mkdir tmp
sudo mount -t ext4 ./sda-rootfs.img ./tmp
cd tmp/
sudo cp ../busybox-rootfs/\* . -rf
sudo umount ./tmp
```
到这里就制作完成了,主要思路就是创建虚拟磁盘，然后挂载到./tmp下，再将相关initrd文件copy进去就可以了。

#### 3.2.2 制作cpio-initrd

这个比较简单，这个我们选用完全自定义的原材料，在work目录下，执行如下：

```c
cd diy-rootfs
sudo find . |sudo  cpio -H newc -o | sudo gzip -9 -n > ../diy-initrd.gz
```
简单的两步就可以生成了.

这里提一下，initramfs这种initrd,这种一般是和内核镜像打包到一起的，通过编译内核的时，配置
```c
CONFIG_BLK_DEV_INITRD=y
CONFIG_INITRAMFS_SOURCE="cpio file path"
```
其中cpio文件就是通过`sudo find . |sudo  cpio -H newc -o > initramfs.cpio`就可以生成

## 4 initrd测试
我们这里主要通过qemu-system-x86_64来测试,通过下面的命令生成bzImage内核镜像：
```c
wget https://cdn.kernel.org/pub/linux/kernel/v5.x/linux-5.8.1.tar.xz
tar -xvf ./linux-5.8.1.tar.xz
cd linux-5.8.1
cp arch/x86/configs/x86_64_defconfig ./.config
make -j12
cp arch/x86/boot/bzImage work
```
到现在为止，我们已经做好了内核镜像，下一步我们将通过qemu来运行他

### 4.1 测试完全自定义的diy-initrd.gz
运行命令如下
```c
qemu-system-x86_64 -m 1024 \
                   -nographic \
                   -kernel ./bzImage \
                   -initrd ./diy-initrd.gz \
                   --append "rdinit=/init console=ttyS0"
```
这里`rdinit=/init`不加也可以，因为默认就是`/init`,执行这个会就看到如下的画面：
![diy-show](./test-diy-initrd.svg)
这里因为就是简单写的一个输入然后反馈一个输出，如果你想，你可以写一个复杂的shell程序。我这里只是用作演示，说明内核要的仅仅是在某个文件系统中找到可以执行的一个程序，它不关心程序具体来自那里，做什么。

### 4.2 测试busybox做的sda-rootfs.img
运行命令如下

```c
qemu-system-x86_64 -m 1024 \
                   -kernel ./bzImage \
                   -hda ./sda-rootfs.img \
                   -nographic \
                   -append "rdinit=/init root=/dev/sda console=ttyS0"
```
这里需要特别注意的是一定要指定`root=/dev/sda`，否则系统无法正确的挂载`/dev/sda`也就无法找到`init`
运行后看的画面如下：
![diy-show](./test-busybox-initrd.svg)

## 5 总结
虽然根文件系统在实际生产环境中会有很多名子，但如果我们从制作方式就可以区分出来，无非就是我们在分类中提到的三类，目前至少我还没有看到有其他的类型。
另外，不管是采用何种制作方式，原材料都是一样的，你可以自定义，也可以使用busybox或者其他的编译生成的根文件系统。
在后面的文章中，我会从内核源码的角度去分析一下，这个镜像是如何加载的。

---
::: tip  

转载请注明出处！ [探索者](http://www.cxy.wiki)

:::


