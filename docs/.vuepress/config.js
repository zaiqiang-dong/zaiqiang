module.exports = {
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
        ['@vuepress/google-analytics',{
            'ga': 'UA-149833085-3'
        }],
        ['@vuepress/back-to-top'],
        ['@vuepress/last-updated'],
        ['@vuepress/active-header-links'],
	],
	themeConfig: {
        lastUpdated: '最近更新 ',
		nav: [{
			text: 'Home',
			link: '/'
		},
		{
			text: 'linux',
			link: '/linux/'
		},
		{
			text: 'arm',
			link: '/arm/'
		},
		{
			text: 'selinux',
			link: '/selinux/'
		}],
		sidebarDepth: 3,
		sidebar: {
			'/linux/': [
            {
				title: '内存管理',
				collapsable: true,
				children: ['/linux/memory/modle/modle']
			},
            {
				title: '并发同步',
				collapsable: true,
				children: ['/linux/concurency/smb']
			},
			{
				title: '进程管理',
				collapsable: true,
				children: ['/linux/process/weight']
			}],
			'/arm/': [
            {
				title: 'ARM简介',
				collapsable: true,
				children: ['/arm/intro']
			},
            {
				title: '虚拟内存',
				collapsable: true,
				children: ['/arm/vmsa/vmsa_intro/vmsa_intro','/arm/vmsa/vmsa_page/vmsa_page']
			}],
			'/selinux/': [{
                title: '系统权限',
				collapsable: true,
                children: ['/selinux/AndroidSelinux/Selinux']
            }],
		}
	},
}

