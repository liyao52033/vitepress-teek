<script setup>
import DefaultTheme from 'vitepress-theme-base-teek'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
      <template #aside-top>
          这是原生插槽测试
      </template>

  </Layout>
</template>