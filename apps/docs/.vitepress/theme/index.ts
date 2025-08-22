import Theme from "vitepress-theme-base-teek"
import About from "./components/About.vue"
import MyLayout from './MyLayout.vue'

export default {
    extends: Theme,
    Layout: MyLayout,
    async enhanceApp({ app, router, siteData }) {
        app.component('About', About)
    }
}