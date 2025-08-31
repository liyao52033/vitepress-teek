<template>
 <Layout>
   <!-- 覆盖/扩展的插槽 -->
   <template #not-found>
     <ClientOnly>
       <NotFound />
     </ClientOnly>
   </template>

   <template #doc-top>
      <ClientOnly>
        <GlobalTip />
        <slot name="liyao-doc-top" v-if="currentLayout === 'doc'" />
     </ClientOnly>
   </template>

   <template #doc-footer-before>
      <ClientOnly>
        <BackTop />
        <VpContainer v-if="bottomTipConfig && bottomTip" v-bind="bottomTipConfig" />
        <slot name="liyao-doc-footer-before" v-if="currentLayout === 'doc'" />
     </ClientOnly>
   </template>

   <template #home-features-after>
     <ClientOnly>
       <HomePostList :homeCardAfter="$slots['home-card-after']" />
       <slot name="liyao-home-features-after" v-if="currentLayout === 'home'" />
     </ClientOnly>
   </template>

   <template #layout-bottom>
     <ClientOnly>
       <Footer v-if="isFooter"></Footer>
       <slot name="liyao-layout-bottom"  />
     </ClientOnly>
   </template>

   <template #page-top>
     <ClientOnly>
        <archives-page v-if="isArchives" />
        <slot name="liyao-page-top" v-if="currentLayout === 'page'" />
     </ClientOnly>
   </template>

   <template #doc-before>
      <ClientOnly>
        <ArticleImagePreview />
        <ArticlePageStyle />
        <CodeBlockToggle />
        <pageInfo />
        <VpContainer v-if="topTipConfig && topTip" v-bind="topTipConfig" />
        <slot name="liyao-doc-before" v-if="currentLayout === 'doc'" />
      </ClientOnly>
   </template>

    <!-- 其他 VP 插槽 -->
  <template
          v-for="name in Object.keys($slots).filter(name => !usedSlots.includes(name))"
          :key="name"
          #[name]="slotData"
  >
    <slot :name="name" v-bind="slotData"></slot>
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

// 已经覆盖的插槽（避免重复转发）
const usedSlots = [
    'not-found',
    'doc-top',
    'doc-footer-before',
    'home-features-after',
    'layout-bottom',
    'page-top',
    'doc-before',
]

const currentLayout = computed(() => unref(frontmatter).layout || 'doc')
const isFooter = computed(() => unref(frontmatter).footer !== false)
const bottomTip = computed(() => unref(frontmatter).bottomTip !== false)
const topTip = computed(() => unref(frontmatter).topTip !== false)
const isArchives = computed(() => unref(frontmatter).archivesPage)

</script>

<style scoped>

</style>