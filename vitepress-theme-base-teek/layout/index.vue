<template>
 <Layout>
   <template #not-found>
     <ClientOnly>
       <NotFound />
     </ClientOnly>
   </template>

   <template #doc-top>
      <ClientOnly>
         <GlobalTip />
     </ClientOnly>
   </template>

   <template #doc-footer-before>
      <ClientOnly>
        <BackTop />
        <VpContainer v-if="bottomTipConfig" v-bind="bottomTipConfig" />
     </ClientOnly>
   </template>
   <template #home-features-after>
     <ClientOnly>
       <HomePostList :homeCardAfter="$slots['home-card-after']" />
     </ClientOnly>
   </template>

   <template #layout-bottom>
     <ClientOnly>
        <Footer></Footer>
     </ClientOnly>
   </template>

   <template #page-top>
     <template v-if="frontmatter.archivesPage">
       <ClientOnly>
          <contribute-chart/>
          <archives-page />
       </ClientOnly>
     </template>
   </template>

   <template #doc-before>
      <ClientOnly>
        <ArticleImagePreview />
        <ArticlePageStyle />
        <CodeBlockToggle />
        <pageInfo />
        <VpContainer v-if="topTipConfig" v-bind="topTipConfig" />
      </ClientOnly>
   </template>
 </Layout>
</template>


<script setup lang="ts">
import DefaultTheme from "vitepress/theme"
import { useUnrefData } from "../components/configProvider"
import { useArticleTips } from "../hooks"

import NotFound from "../components/common/NotFound.vue";
import GlobalTip from "../components/common/GlobalTip.vue";
import pageInfo from "../components/ArticleInfo/pageInfo.vue"
import BackTop from '../components/common/BackTop.vue';
import ContributeChart from "../components/common/ContributeChart.vue";
import VpContainer from "../components/Container";
import {
  Footer,
  HomePostList,
  ArchivesPage,
  ArticleImagePreview,
  ArticlePageStyle,
  CodeBlockToggle
} from "../components/index";

const { Layout } = DefaultTheme
const { frontmatter } = useUnrefData()

const { topTipConfig, bottomTipConfig } = useArticleTips()

</script>

<style scoped>

</style>