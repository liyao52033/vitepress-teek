import Theme from "vitepress-theme-base-teek"
import { autoRegisterComponents } from "./utils/autoRegisterComponents"

export default {
    extends: Theme,
    async enhanceApp({app, router, siteData}) {
         // 自动注册项目中的组件
        await autoRegisterComponents(app);
    }
}
