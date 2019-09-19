module.exports = {
    base: 'https://zaiqiang-dong.github.io/zaiqiang/',
	title: '探索者',
	description: '-> 在 LINUX ANDROID 中不断探索 <-',
    //git hub
    repo: 'zaiqiang-dong/zaiqiang',
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
        ['@vuepress/back-to-top'],
        ['@vuepress/last-updated'],
        ['@vuepress/active-header-links'],
	],
	themeConfig: {
        lastUpdated: 'Last Updated ',
		nav: [{
			text: 'Home',
			link: '/'
		},
		{
			text: 'linux',
			link: '/linux/'
		},
		{
			text: 'selinux',
			link: '/selinux/'
		}],
		sidebarDepth: 3,
		sidebar: {
			'/linux/': [{
				title: '并发同步',
				collapsable: true,
				children: ['/linux/concurency/smb']
			},
			{
				title: '进程管理',
				collapsable: true,
				children: ['/linux/process/weight']
			}],
			'/selinux/': [{
                title: '系统权限',
				collapsable: true,
                children: ['/selinux/AndroidSelinux/Selinux']
            }],
		}
	},
}

