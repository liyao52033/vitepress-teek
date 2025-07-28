import Theme from "vitepress-theme-base-teek"
import { autoRegisterComponents } from "./utils/autoRegisterComponents"

export default {
    extends: Theme,
    async enhanceApp({ app, router, siteData }) {
        await autoRegisterComponents(app)
    }
}