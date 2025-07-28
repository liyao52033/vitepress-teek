import Theme from "vitepress-theme-base-teek"
import { autoRegisterComponents } from "./utils/autoRegisterComponents"
import MyLayout from './MyLayout.vue'

export default {
    extends: Theme,
    Layout: MyLayout,
    async enhanceApp({ app, router, siteData }) {
        await autoRegisterComponents(app)
    }
}