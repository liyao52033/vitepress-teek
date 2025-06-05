import { defineConfig } from 'vitepress'
import { nav, toSidebarNavItems } from "./theme/config/nav";
import tkThemeConfig from "./theme/config/index";
import secureInfo from '../secureInfo'
import SidebarPermalinkPlugin from 'vitepress-plugin-sidebar-permalink'
import { genSidebar } from 'vitepress-plugin-sidebar-permalink/sidebar'
import rewritesJson from '../rewrites.json' //插件自动生成

// 生成侧边栏
const sidebarOptions = { collapsed: true }
const sidebar = genSidebar(toSidebarNavItems(nav), 'docs/articles', rewritesJson.rewrites, sidebarOptions)

const tkConfig = tkThemeConfig({
    tkTheme: true,
    webSiteInfo: {
        createTime: "2025-03-08",
    },
    vitePlugins: {
        autoFrontmatterOption: {
            pattern: "**/*.md",
            globOptions: { ignore: ["utils", "index.md", "login.md", "pages"] }
        },
        catalogueOption: {
            ignoreList: ["pages"]
        },
        docAnalysisOption: {
            ignoreList: ["login.md", "pages"]
        }
    }
});

export default defineConfig({
    extends: tkConfig,
    title: "VitePress",
    description: "A VitePress Site",
    head: [
        ['link', { rel: 'icon', href: '/img/logo.png' }],
        [
            "meta",
            {
                name: "viewport",
                content: "width=device-width,initial-scale=1,minimum-scale=1.0,maximum-scale=1.0",
            },
        ],
        [
            "meta",
            {
                name: "google",
                content: "notranslate",
            },
        ],
    ],
    vite: {
        plugins: [
            SidebarPermalinkPlugin({
                ignoreDirs: ["index.md"]
            })
        ],
        build: {
            chunkSizeWarningLimit: 1500,
        }
    },
    rewrites: rewritesJson.rewrites,
    markdown: {
        lineNumbers: true,
        image: {
            lazyLoading: true
        },
        container: {
            tipLabel: "提示",
            warningLabel: "警告",
            dangerLabel: "危险",
            infoLabel: "信息",
            detailsLabel: "详细信息",
        },
    },
    cleanUrls: true,
    cacheDir: '.vite-cache',
    metaChunk: true,
    sitemap: {
        hostname: 'https://vp.xiaoying.org.cn/'
    },
    themeConfig: ({
        logo: '/img/logo.png',
        nav,
        sidebar,
        search: {
            provider: 'local',
            options: {
                _render(src, env, md) {
                    const html = md.render(src, env)
                    if (env.frontmatter?.search === false) return ''
                    return html
                }
            }
        },
        loginInfo: {
            isLogin: true, // 是否开启登录
            username: secureInfo.username, // 登录用户名
            password: secureInfo.password, // 登录密码
            token: Math.random().toString(32).slice(2) + Math.round(new Date().getTime() / 1000),
            List: [
                // '/pages/89cd20'
                // '/pages/47a27c'
            ], //加密文章列表
            expiration: 0.5  // token过期时间，单位：天
        },
        outline: {
            level: [2, 3],
            label: "页面导航",
        },
        docFooter: {
            prev: "上一页",
            next: "下一页",
        },
        externalLinkIcon: true,
        // socialLinks: [
        //     { icon: 'github', link: 'https://github.com/liyao52033/liyao-vue-common' }
        // ],
        lastUpdated: {
            text: '上次更新时间',
            formatOptions: {
                dateStyle: 'short',
                timeStyle: 'medium'
            }
        }
    }) as any,
})
