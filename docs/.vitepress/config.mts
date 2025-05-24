import { defineConfig } from 'vitepress'
import { genRewritesPlugin } from './gen-rewrites-plugin'
import { genFullSidebar } from './gen-sidebar-plugin'
import rewritesJson from './rewrites.json'

const navLinks = [
  { text: '组件', link: '/pages/fe4521' },
  { text: '后端', link: '/pages/571de5' },
  { text: '资源', link: '/pages/87a36a' }
]

// 设置侧边栏是否默认折叠
const sidebarOptions = { collapsed: true }

const sidebar = genFullSidebar(rewritesJson.rewrites, 'docs/articles', navLinks, sidebarOptions)

export default defineConfig({
  title: "permalink test",
  description: "A VitePress Site",
  cleanUrls: true,
  markdown: {
    lineNumbers: true
  },
  vite: {
    plugins: [
      genRewritesPlugin()
    ]
  },
  rewrites: rewritesJson.rewrites,
  themeConfig: {
    nav: navLinks,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
    sidebar
  }
})


