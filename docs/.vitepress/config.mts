import path from "path";
import { defineConfig } from "vitepress";
import { generatedRewrites, generatedSidebar } from "vitepress-plugin-sidebar-permalink";
import baseConfig from "vitepress-theme-base-teek/config";
import rewritesJson from "../rewrites.json";
import secureInfo from "../secureInfo";
import { FooterInfo } from "./footer";
import { nav, toSidebarNavItems } from "./nav";

const tkConfig = baseConfig({
    webSiteInfo: {
        createTime: "2025-03-08",
    },
    loginInfo: {
        isLogin: false, // 是否开启全局登录
        expiration: 0.5,  // token过期时间，单位：天,
        type: 'node'
    },
    articleTip: {
        articleTopTip: (frontmatter) => {
            const tip: Record<string, string> = {
                type: "warning",
                text: "文章发布已超过一年，内容可能过时，阅读注意甄别。",
            };

            // 大于一年，添加提示
            const longTime = 12 * 30 * 24 * 60 * 60 * 1000;
            if (
                frontmatter.date &&
                Date.now() - new Date(frontmatter.date).getTime() > longTime
            )
                return tip;
        },
    },
    footerInfo: FooterInfo,
    vitePlugins: {
        autoFrontmatterOption: {
            pattern: "**/*.md",
            globOptions: { ignore: ["utils", "index.md", "login.md"] },
            transform: (frontmatter: any) => {
                let transformResult = {};
                const createAuthor = () => {
                    return {
                        author: { name: "liyao", link: "https://xiaoying.org.cn" }
                    };
                }
                if (!frontmatter.author) {
                    transformResult = { ...transformResult, ...createAuthor() };
                }
                return transformResult;
            }
        },
        sidebarOption: {
            rewrites: rewritesJson.rewrites,
            navLinks: toSidebarNavItems(nav),
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
    title: "组件库文档",
    lang: "zh-CN",
    description: "常用组件及代码封装，减少重复造轮子, 快速开发",
    head: [
        ["link", { rel: "icon", href: "favicon.ico", type: "image/x-icon" }],
        ['script', { src: '//at.alicdn.com/t/c/font_5002477_3r8q6p0a9n8.js' }],
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
        [
            "meta",
            {
                name: "algolia-site-verification",
                content: "CA4B71628D467FFC",
            },
        ]
    ],
    vite: {
        build: {
            chunkSizeWarningLimit: 2000,
        },
        server: {
            proxy: {
                // 当前端请求 /coze 的时候，就代理到 http://localhost:3000
                '/coze': {
                    target: 'https://vp.xiaoying.org.cn',
                    //   target: 'http://localhost:3000',
                    changeOrigin: true
                },
                "/multi-search": {
                    target: "https://vp.xiaoying.org.cn",
                    changeOrigin: true
                },

            },
        },
        resolve: {
            alias: [
                {
                    find: '@',
                    replacement: path.resolve(__dirname, '../') // 指向 docs
                },
                // {
                //     find: /^.*\/VPAlgoliaSearchBox\.vue$/,
                //     replacement: fileURLToPath(
                //         new URL('./theme/components/AlgoliaSearch.vue', import.meta.url)
                //     )
                // }
            ]
           
        }
    },
    rewrites: generatedRewrites,
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
        sidebar: generatedSidebar,
        // search: {
        //     provider: 'local',
        //     options: {
        //         _render(src, env, md) {
        //             const html = md.render(src, env)
        //             if (env.frontmatter?.search === false) return ''
        //             return html
        //         }
        //     }
        // },
        // search: {
        //     provider: 'algolia',
        //     options: {
        //         appId: secureInfo.appId,
        //         apiKey: secureInfo.apiKey,
        //         indexName: secureInfo.indexName
        //     }
        // },
        //@ts-ignore
        meilisearch: {
            host: "http://localhost:5173/", // 服务地址（自建或云服务）
            apiKey: secureInfo.searchKey, // 搜索密钥（非管理员密钥）
            indexName: "teek", // 索引名称
            placeholder: "搜索文档..." // 搜索框提示文字
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
