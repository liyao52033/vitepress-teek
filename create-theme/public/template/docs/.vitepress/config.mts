import { defineConfig } from 'vitepress'
import secureInfo from '../secureInfo'
import { genSidebar } from 'vitepress-plugin-sidebar-permalink/sidebar'
import baseConfig from "vitepress-theme-base-teek/config";
import rewritesJson from '../rewrites.json' //插件自动生成
import { FooterInfo } from "./footer"
import { toSidebarNavItems, nav } from "./nav"

// 生成侧边栏
const sidebarOptions = { collapsed: true }
const sidebar = genSidebar(toSidebarNavItems(nav), 'docs/articles', rewritesJson.rewrites, sidebarOptions)

const tkConfig = baseConfig({
    webSiteInfo: {
        createTime: "2025-03-08",
    },
    loginInfo: {
        isLogin: false, // 是否开启全局登录
        username: secureInfo.username, // 登录用户名
        password: secureInfo.password, // 登录密码
        token: Math.random().toString(32).slice(2) + Math.round(new Date().getTime() / 1000),
        expiration: 0.5  // token过期时间，单位：天
    },
    articleTip: {
        articleTopTip: (frontmatter) => {
            const tip: Record<string, string> = {
                type: "warning",
                text: "文章发布较早，内容可能过时，阅读注意甄别。",
            };

            // 大于半年，添加提示
            const longTime = 2 * 30 * 24 * 60 * 60 * 1000;
            if (
                frontmatter.date &&
                Date.now() - new Date(frontmatter.date).getTime() > longTime
            )
                return tip;
        },
        articleBottomTip: () => {
            return {
                type: "tip",
                title: "声明",
                text: `<p>作者：Hyde</p>
             <p>版权：此文章版权归 Hyde 所有，如有转载，请注明出处!</p>
             <p style="margin-bottom: 0">链接：可点击浏览器地址栏分享此页面复制文章链接</p>
            `,
            };
        },
    },
    footerInfo: FooterInfo,
    vitePlugins: {
        autoFrontmatterOption: {
            pattern: "**/*.md",
            globOptions: { ignore: ["utils", "index.md", "login.md", "pages"] }
        },
        sidebarOption:{
            // root: "docs/articles"
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
        ['link', { rel: 'icon', href: '/img/favicon.ico' }],
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
        outline: {
            level: [2, 3],
            label: "页面导航",
        },
        docFooter: {
            prev: "上一页",
            next: "下一页",
        },
        externalLinkIcon: true,
        lastUpdated: {
            text: '上次更新时间',
            formatOptions: {
                dateStyle: 'short',
                timeStyle: 'medium'
            }
        }
    })
})
