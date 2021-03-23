module.exports = {
	title: '探索者',
	description: '-> 在 LINUX ANDROID 中不断探索 <-',
    lang : 'zh-CN',
    //git hub
    repo : '/zaiqiang-dong/zaiqiang/',
    base : '/zaiqiang/',
    repoLabel: '查看源码',
    docsRepo: 'zaiqiang-dong/zaiqiang',
    docsDir: 'docs',
    docsBranch: 'source',
    editLinks: true,
    editLinkText: '帮助我改善此页面！',
    //
	head: [['link', {
		rel: 'icon',
		href: '/hero.png'
	}]],
	markdown: {
		lineNumbers: true,
	},
	plugins: [
        ['mathjax', {
		    target: 'svg',
		    macros: {
			    '*': '\\times'
		    }
	    }],
        ['container', {
		    type: 'right',
		    defaultTitle: '',
	    }],
        ['container', {
		    type: 'theorem',
		    before: info => `<div class="theorem"><p class="title">${info}</p>`,
            after: '</div>'
        }],
        ['@vuepress/google-analytics',{
            'ga': 'UA-149833085-1'
        }],
        ['@vuepress/back-to-top'],
        ['@vuepress/last-updated'],
        ['@vuepress/active-header-links'],
        ['@vssue/vuepress-plugin-vssue',{
            platform: 'github',
            owner: 'zaiqiang-dong',
            repo: 'zaiqiang',
            clientId: '01a047c7f3aceebf8a0c',
            clientSecret: '419c684ff0462df5cbe99c3d43ef0705ae0297a4',
        }],
	],
	themeConfig: {
        lastUpdated: '最近更新 ',
		nav: [
            {
			    text: '主页',
			    link: '/'
		    },
		    {
			    text: '内核',
			    link: '/linux/'
		    },
		    {
		    	text: '硬件',
		    	link: '/hardware/'
		    },
		    {
		    	text: '工具',
		    	link: '/tools/'
		    },
		    {
		    	text: '编码',
		    	link: '/coding/'
		    },
		    {
		    	text: '虚拟化',
		    	link: '/virtualization/'
		    },
		    {
		    	text: '关于',
		    	link: '/about/'
		    }
        ],
		sidebarDepth: 3,
		sidebar: {
			'/linux/': [
                {
			    	title: '内存管理',
			    	collapsable: true,
                    children: [
                        {
                            title: 'common',
			    	        collapsable: true,
			    	        children: ['/linux/memory/common/modle/modle']
                        },
                        {
                            title: 'buddy',
			    	        collapsable: true,
			    	        children: ['/linux/memory/buddy/alloc-flags/alloc-flags',
                                       '/linux/memory/buddy/wartermark/watermark']
                        },
                        {
                            title: 'slxb',
			    	        collapsable: true,
			    	        children: [`../linux/memory/slub/slub_order/slub_order`]
                        }
                    ]
			    },
                {
			    	title: '文件系统',
			    	collapsable: true,
                    children: [
                        {
                            title: 'root-fs',
			    	        collapsable: true,
			    	        children: ['/linux/filesystem/initrd-principles/initrd-principles']
                        }
                    ]
			    },
                {
			    	title: '并发同步',
			    	collapsable: true,
			    	children: [
                        {
                            title: 'barriers',
			    	        collapsable: true,
			    	        children: ['/linux/concurency/barriers/overview/overview.md',
                                        '/linux/concurency/barriers/principle/principle.md']
                        }
                    ]
			    },
			    {
			    	title: '进程管理',
			    	collapsable: true,
			    	children: ['/linux/process/weight/weight',
                               '/linux/process/priority/priority',
                               '/linux/process/pelt/pelt']
			    },
                {
			    	title: '中断系统',
			    	collapsable: true,
			    	children: [
                        {
                            title: 'common',
			    	        collapsable: true,
			    	        children: ['/linux/interrupt/common/interrupt-sleep/interrupt-sleep.md']
                        }
                    ]
			    },
                {
			    	title: '安全机制',
			    	collapsable: true,
			    	children: [ '../linux/selinux/AndroidSelinux/Selinux.md']
			    },
                {
			    	title: '系统工具',
			    	collapsable: true,
                    children: [
                        {
                            title: 'common',
			    	        collapsable: true,
			    	        children: []
                        },
                        {
                            title: 'ftrace',
			    	        collapsable: true,
			    	        children: ['../linux/tools/ftrace/file-interface/file-interface.md']
                        },
                        {
                            title: 'perf',
			    	        collapsable: true,
			    	        children: []
                        },
                        {
                            title: 'bpf',
			    	        collapsable: true,
			    	        children: []
                        }
                    ]
			    }
            ],
			'/hardware/': [
                {
			    	title: '处理器',
			    	collapsable: true,
			    	children: [
                        {
                            title: 'COMMON',
			    	        collapsable: true,
			    	        children: []
                        },
                        {
                            title: 'ARM',
			    	        collapsable: true,
			    	        children: ['/hardware/arm/intro/intro']
                        }
                    ]
			    },
                {
			    	title: '内存',
			    	collapsable: true,
			    	children: [
                        {
                            title: 'COMMON',
			    	        collapsable: true,
			    	        children: []
                        },
                        {
                            title: 'ARM',
			    	        collapsable: true,
			    	        children: ['/hardware/arm/vmsa/vmsa_intro/vmsa_intro','/hardware/arm/vmsa/vmsa_page/vmsa_page']
                        }
                    ]
			    }
            ],
			'/tools/': [
                {
                    title: '编译工具',
				    collapsable: true,
                    children: ['/tools/builder/builder.md']
                },
                {
                    title: '调试工具',
				    collapsable: true,
                    children: ['/tools/debugger/ramdump/ramdump.md']
                },
                {
                    title: '编辑工具',
				    collapsable: true,
                    children: ['/tools/editor/editor.md']
                },
                {
                    title: '命令工具',
				    collapsable: true,
                    children: ['/tools/cmd/cmd.md']
                }
            ],
			'/coding/': [
                {
                    title: '数据结构',
				    collapsable: true,
                    children: ['/coding/datastruct/datastruct.md']
                },
                {
                    title: '算法分析',
				    collapsable: true,
                    children: ['/coding/algorithm/algorithm.md']
                },
                {
                    title: '并行编程',
				    collapsable: true,
                    children: ['/coding/parallel/parallel.md']
                },
                {
                    title: '编程技巧',
				    collapsable: true,
                    children: ['/coding/skills/skills.md']
                }
            ],
			'/virtualization/': [
                {
                    title: 'QEMU',
				    collapsable: true,
                    children: [
                        {
                            title: 'components',
				            collapsable: true,
                            children: ['/virtualization/qemu/component/qom/qom.md']
                        }

                    ]
                },
                {
                    title: '管理工具',
				    collapsable: true,
                    children: ['/virtualization/tools/virt-install/virt-install']
                }
            ],
		}
	},
}

