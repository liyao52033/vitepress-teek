import type { DefaultTheme } from "vitepress";

export const nav: DefaultTheme.NavItem[] = [
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
		"text": "关于",
		"link": "/About",
	},
	// {
	// 	"text": "Github",
	// 	"items": [
	// 		{
	// 			"items": [
	// 				{ "text": "本站仓库", "link": "https://github.com/liyao52033/vitepress-teek" },
	// 				{ "text": "前端组件仓库", "link": "https://github.com/liyao52033/liyao-vue-common" },
	// 				{ "text": "官方文档", "link": "https://vp.teek.top/" }
	// 			],
	// 		},
	// 	]
	// }

]

// 转换 NavItem 为 sidebar 需要的格式
export function toSidebarNavItems(nav: DefaultTheme.NavItem[]): { text: string; link?: string; items?: any[] }[] {
	return nav
		.filter((item): item is DefaultTheme.NavItemWithLink | DefaultTheme.NavItemWithChildren => typeof (item as any).text === 'string')
		.map(item => ({
			text: (item as any).text as string, // 保证 text 一定为 string
			link: 'link' in item ? (item as any).link : undefined,
			items: 'items' in item && (item as any).items ? toSidebarNavItems((item as any).items as DefaultTheme.NavItem[]) : undefined
		}));
}
