import DefaultTheme from 'vitepress/theme'
import { inBrowser, Theme } from "vitepress";
import MyLayout from "./layout/index.vue"
import Login from "./components/Login/Login.vue";
import { checkAuth } from "./components/Login/helper.js";
import Busuanzi from "./helper/busuanzi";
import { NProgress } from 'nprogress-v2/dist/index.js' // 进度条组件
import 'nprogress-v2/dist/index.css' // 进度条样式
import 'element-plus/dist/index.css'
import './styles/index.scss'
import baseConfig from "./config";
import { ThemeConfig } from "./config/types"

export {
    createContainerThenUse,
    createContainerThenGet,
    createContainersThenUse,
    createContainersThenGet,
} from "./markdown/plugins/container";

export { baseConfig, type ThemeConfig }

export default {
    extends: DefaultTheme,
    Layout: MyLayout,
    enhanceApp({ app, router, siteData }) {

        app.component('Login', Login)

        if(inBrowser){
            NProgress.configure({ showSpinner: false })
            router.onBeforeRouteChange = () => {
                NProgress.start() // 开始进度条
            }
        }


        // 获取可能已有的 onAfterRouteChange
        const selfOnAfterRouteChange = router.onAfterRouteChange;
        router.onAfterRouteChange = (href: string) => {
            // 调用可能已有的 onAfterRouteChange
            selfOnAfterRouteChange?.(href);
            // 调用自己的函数
            login();
            Busuanzi()
            if(inBrowser){
                NProgress.done() // 停止进度条
            }


        };
        const login = () => {
            if (router.route.path !== '/') {
                let { isLogin, List } = siteData.value.themeConfig.loginInfo
                if (List.includes(router.route.path) && !checkAuth() && isLogin) {
                    router.go(`/login?redirect=${router.route.path}` || '/')
                }
            }
        }
    }
} satisfies Theme