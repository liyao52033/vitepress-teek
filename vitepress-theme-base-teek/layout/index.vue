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
        <VpContainer v-if="bottomTipConfig && bottomTip" v-bind="bottomTipConfig" />
     </ClientOnly>
   </template>
   <template #home-features-after>
     <ClientOnly>
       <HomePostList :homeCardAfter="$slots['home-card-after']" />
     </ClientOnly>
   </template>

   <template #layout-bottom>
     <ClientOnly>
      <Footer v-if="isFooter"></Footer>
     </ClientOnly>
   </template>

   <template #page-top>
     <ClientOnly>
        <archives-page v-if="isArchives" />
     </ClientOnly>
   </template>

   <template #doc-before>
      <ClientOnly>
        <ArticleImagePreview />
        <ArticlePageStyle />
        <CodeBlockToggle />
        <pageInfo />
        <VpContainer v-if="topTipConfig && topTip" v-bind="topTipConfig" />
      </ClientOnly>
   </template>
 </Layout>
</template>


<script setup lang="ts">
import DefaultTheme from "vitepress/theme"
import { computed, unref } from "vue";
import { useArticleTips } from "../hooks"
import NotFound from "../components/common/NotFound.vue";
import GlobalTip from "../components/common/GlobalTip.vue";
import pageInfo from "../components/ArticleInfo/pageInfo.vue"
import BackTop from '../components/common/BackTop.vue';
import VpContainer from "../components/Container";
import {
  Footer,
  HomePostList,
  ArchivesPage,
  ArticleImagePreview,
  ArticlePageStyle,
  CodeBlockToggle
} from "../components/index";
import { useData } from "vitepress";

const { Layout } = DefaultTheme
const { frontmatter } = useData()

const { topTipConfig, bottomTipConfig } = useArticleTips()

const isFooter = computed(() => unref(frontmatter).footer !== false)
const bottomTip = computed(() => unref(frontmatter).bottomTip !== false)
const topTip = computed(() => unref(frontmatter).topTip !== false)
const isArchives = computed(() => unref(frontmatter).archivesPage)

</script>

<style scoped>

</style>