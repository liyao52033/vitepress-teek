import Theme from "vitepress-theme-base-teek"
import { h } from "vue";
import Coze from "./components/Coze/index.vue";
import WelcomeCard from "./components/WelcomeCard.vue";
import { autoRegisterComponents } from "./utils/autoRegisterComponents"

export default {
    extends: Theme,
    Layout() {
        return h(Theme.Layout, null, {
            'liyao-layout-bottom': () => h(Coze) ,
            'home-card-after': () => h(WelcomeCard)
        })
    },
    async enhanceApp({app, router, siteData}) {
         // 自动注册项目中的组件
        await autoRegisterComponents(app);
    }
}
