import Theme from "vitepress-theme-base-teek";
import { h } from "vue";
import ArticleBottomTip from "./components/ArticleBottomTip.vue";
import AiSummary from "./components/Coze/AiSummary.vue";
import Coze from "./components/Coze/index.vue";
import Meilisearch from "./components/Meilisearch.vue";
import AlgoliaSearch from "./components/AlgoliaSearch.vue";
import WelcomeCard from "./components/WelcomeCard.vue";
import { autoRegisterComponents } from "./utils/autoRegisterComponents";

export default {
    extends: Theme,
    Layout() {
        return h(Theme.Layout, null, {
            'liyao-layout-bottom': () => h(Coze) ,
            'liyao-doc-before': () => h(AiSummary),
            "home-card-after": () => h(WelcomeCard),
            "nav-bar-content-before": () => h(AlgoliaSearch, Meilisearch),
            "liyao-doc-footer-before": () => h(ArticleBottomTip)
        })
    },
    async enhanceApp({app, router, siteData}: {app: any, router: any, siteData: any}) {
        app.component('AiSummary', AiSummary);
         // 自动注册项目中的组件
        await autoRegisterComponents(app);
    }
}
