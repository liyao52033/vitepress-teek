import DefaultTheme from 'vitepress/theme'
import { inBrowser, Theme } from "vitepress";
import MyLayout from "./layout"
import Login from "./components/Login";
import { checkAuth, verifyAuth } from "./components/Login/helper.js";
import Busuanzi from "./helper/busuanzi";
import { NProgress } from 'nprogress-v2/dist/index.js' // 进度条组件
import 'nprogress-v2/dist/index.css' // 进度条样式
import 'element-plus/dist/index.css'
import './styles/index.scss'

export * from "./components";
export * from "./utils"
export * from "./hooks"
export * from "./helper"

export {
    createContainerThenUse,
    createContainerThenGet,
    createContainersThenUse,
    createContainersThenGet,
} from "./markdown/plugins/container";

export default {
    extends: DefaultTheme,
    Layout: MyLayout,
    enhanceApp({ app, router, siteData }) {

        // 注册主题自带的组件
        app.component('Login', Login)

        if(inBrowser){
            NProgress.configure({ showSpinner: false })
            router.onBeforeRouteChange = () => {
                NProgress.start() // 开始进度条
            }
        }

        let { isLogin, List, type, apiUrl } = siteData.value.themeConfig.loginInfo

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
            if (router.route.path !== '/' && router.route.path !== '/login' ) {
                if (List.includes(router.route.path) || isLogin) {
                    if (type === 'supabase') {
                        verifyAuth(apiUrl).then(valid => {
                            if (!valid) {
                                router.go(`/login?redirect=${ router.route.path }` || '/').then(r  => {})
                            }
                        })
                    } else {
                        if (!checkAuth()) {
                            router.go(`/login?redirect=${ router.route.path }` || '/').then(r  => {})
                        }
                    }
                }
            }
        }
    }
} satisfies Theme
