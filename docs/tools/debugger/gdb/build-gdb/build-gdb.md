
# 编译全功能GDB

---

| 软件版本  | 硬件版本 | 更新内容 |
|---------|--------|----------|
|gdb-10.1| amd64   |        |

---

## 1.概述

平时我们使用`apt install gdb`或者`yum install gdb`安装的gdb,可能功能不是最全的，比如我的使用场景中会存在如下两个功能需求：

1. host 平台是x86_64，但目标平台是aarch64
2. 需要支持python，这样可以装插件或者做一些分析工具

普通方式安装的`gdb`无法满足需求，这时需要我们自己来编译安装具备特定功能的`gdb`.

## 2.编译python 

这里为什么要编译python,原因是我们平时安装的python其实只是python的库和python解析器，但是我们在编译一些其他的软件时，是需要`libpythonxxx.so`,这种动态连接库的，所以我们需要编译python源码，当然你可以通过`apt install python-dev`来安装，我这里为了展示编译过程，选择从源来编译安装。

### 2.1 下载python

因为我们gdb只支持python2（只是从一些资料了解到，但没有从官方的文档中确认），所以我这下载`python2.7.18`代码，下载如下
```sh
wget https://www.python.org/ftp/python/2.7.18/Python-2.7.18.tgz
tar -xvf Python-2.7.18.tgz
```

### 2.2 编译python
编译如下：

```sh

# 新建安装目录
mkdir python-install

cd Python-2.7.18

# 新建编译目录
mkdir build
cd build
# 配置,这半 --prefix 安装路径必须是绝对路径
../configure --prefix=/home/dongzaiq/Downloads/python-install --enable-shared


# 编译安装
make
make install


```

以上过程，如果需要缺少一些，请根据错误提示自行安装


## 3.编译GDB
### 3.1 下载GDB
根据需要下载相应的`gdb`版本，我这里下载`8.3`版本
```sh
wget http://ftp.gnu.org/gnu/gdb/gdb-10.1.tar.xz
```

### 3.2 编译带有全功能的gdb
过程如下：

```sh

# 解压
tar -xvf ./gdb-10.1.tar.xz
cd gdb-10.1

# 新建编译目录
mkdir build
cd build

# 这里python-install就是我们在`2.2`编译出来python
../configure --enable-python=../../python-install

# 编译
make

```

### 3.3 测试
编译完成，`build`目录下的内容如下
```sh
~/Downloads/gdb-10.1/build
❯ ls
bfd  config.log  config.status  etc  gdb  intl  libdecnumber  libiberty  Makefile  opcodes  readline  serdep.tmp  sim  zlib

```
编译好的`gdb`在`gdb/`
测试过程如下：
![test python](./test-python.svg "test python fucntion")


### 3.4 编译aarch64目标平台gdb
编译aarch64目标平台gdb，其实大体过程和上面一样，只是在`configure`时，加下如下选项
```sh
configure --host=x86_64-linux-gnu --target=aarch64-linux-gnu

```

## 小结
在这里我们介绍编译带有`python2`功能和支持`aarch64`功能的`gdb`,如果你需要其实的gdb功能，也可以自己做配置，总之`gdb`是一个神器，用好它，可以帮助我们解析很多问题。







---
::: tip Tip 

欢迎评论、探讨,如果发现错误请指正。转载请注明出处！ [探索者](http://www.tsz.wiki) 

:::


---
<Vssue :title="$title"/>
