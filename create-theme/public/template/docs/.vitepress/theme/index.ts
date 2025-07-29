import Theme from "vitepress-theme-base-teek"
import { autoRegisterComponents } from "./utils/autoRegisterComponents"
import { h } from "vue";

export default {
    extends: Theme,
    Layout() {
        return h(Theme.Layout, null, {
            'home-card-after': () => h('div', "自定义首页右侧卡片组件")
        })
    },
    async enhanceApp({app, router, siteData}) {
         // 自动注册项目中的组件
        await autoRegisterComponents(app);
    }
}
