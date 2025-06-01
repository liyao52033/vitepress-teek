import type { DefaultTheme } from "vitepress";

export const nav: DefaultTheme.Config["nav"]  = [
	{
		"text": "指南",
		"link": "/pages/fe4521",
	},
	{
		"text": "组件",
		"link": "/pages/1a7d12",
	},
	{
		"text": "后端",
		"link": "/pages/571de5",
	},
	{
		"text": "资源",
		"link": "/pages/87a36a",
	},
	{

		"text": "Github",
		"items": [
			{
				"items": [
					{ "text": "本站仓库", "link": "https://github.com/liyao52033/vitepress-teek" },
					{ "text": "前端组件仓库", "link": "https://github.com/liyao52033/liyao-vue-common" },
					{ "text": "官方文档", "link": "https://vp.teek.top/" }
				],
			},

		]
	}

]
