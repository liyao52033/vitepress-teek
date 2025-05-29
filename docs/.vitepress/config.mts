import { defineConfig } from 'vitepress'
import rewritesJson from '../rewrites.json'
import { SidebarPermalinkPlugin } from 'vitepress-plugin-sidebar-permalink'
import { genSidebar } from 'vitepress-plugin-sidebar-permalink/sidebar'

const navLinks = [
  { text: '组件', link: '/pages/fe4521' },
  { text: '后端', link: '/pages/571de5' },
  { text: '资源', link: '/pages/87a36a' }
]

// 设置侧边栏是否默认折叠
const sidebarOptions = { collapsed: true }
const sidebar = genSidebar(navLinks, 'docs/articles', rewritesJson.rewrites, sidebarOptions)

export default defineConfig({
  title: "permalink test",
  description: "A VitePress Site",
  cleanUrls: true,
  markdown: {
    lineNumbers: true
  },
  vite: {
    plugins: [
      SidebarPermalinkPlugin()
    ]
  },
  rewrites: rewritesJson.rewrites,
  themeConfig: {
    nav: navLinks,
    sidebar,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
  }
})


