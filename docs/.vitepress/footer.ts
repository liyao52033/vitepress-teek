import pkg from '../../package.json'; 
const TKversion = pkg.devDependencies?.['vitepress-theme-base-teek'];
const version = TKversion.replace(/^\^/, '')

export const FooterInfo = {
    topMessage: [
        `<span><img alt="VitePress" src="https://liuyuyang.net/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fanimals.65eaf6e3.webp&w=750&q=75"><span/>`,

        `<a target="_blank" href="https://vitepress.dev/" title="本站框架基于 VitePress_v1.6.3" ><img alt="VitePress" src="https://img.shields.io/badge/Frame-VitePress-4868C2?logo=vitepress&amp;logoColor=fff" ></a>

        <a target="_blank" href="http://creativecommons.org/licenses/by-nc-sa/4.0/" title="本站内容采用 CC BY-NC-SA 4.0 国际许可协议进行许可"><img alt="Copyright" src="https://img.shields.io/badge/Copyright-BY--NC--SA%204.0-d42328?logo=coursera&amp;logoColor=fff"></a>
        
        <a target="_blank" href="https://www.algolia.com/" title="本站搜索服务使用 Algolia"><img alt="Algolia" src="https://img.shields.io/badge/Search-Algolia-3095FA?logo=Algolia"></a>

        <a target="_blank" href="https://edgeone.ai/zh" title="本站部署服务使用 EdgeOne"><img alt="EdgeOne" src="https://img.shields.io/badge/EdgeOne-CDN?logo=alibabacloud&label=CDN&color=%23FF6A00"></a>
        
        <a target="_blank" href="https://busuanzi.9420.ltd/" title="本站统计服务使用 busuanzi"><img alt="busuanzi" src="https://img.shields.io/badge/busuanzi-000000?logo=element&label=Count&color=%#0DBD8B"></a>

        <a target="_blank" href="https://cloud.tencent.com/document/product/436/6222" title="本站对象存储腾讯云cos"><img alt="COS" src="https://img.shields.io/badge/COS-000000?logo=craftcms&label=对象存储&color=%#E5422B"></a>

        <a target="_blank" href="https://nginx.org/" title="本站Nginx反向代理服务 Nginx"><img alt="Nginx" src="https://img.shields.io/badge/Nginx-Proxy?logo=Nginx&label=Proxy"></a>`
    ],
    theme: {
        name: `Theme By Teek`,
        link: 'https://vp.teek.top/'
    },
    // bottomMessage: [
    //
    // ],
    copyright: {
        createYear: 2023,
        suffix: "liyao's Blog",
    },
    // icpRecord: {
    //     name: "", //ICP备案号
    //     link: "http://beian.miit.gov.cn/",
    // },
    // 网络安全备案信息配置
    // securityRecord: {
    //     name: "", //公安备案号
    //     link: "https://beian.mps.gov.cn/",
    // },
    // customerHtml: ``

}