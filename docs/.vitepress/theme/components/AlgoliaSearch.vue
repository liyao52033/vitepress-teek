<template>
    <div id="docsearch" v-if="search"></div>
</template>

<script setup>
import docsearch from '@docsearch/js';
import "@docsearch/css";
import { useData } from 'vitepress';
import { computed, onMounted } from 'vue';

const { theme } = useData();
const search = computed(() => theme.value.algoliaSearch || {});

onMounted(() => {
    if (!search.value.apiKey) return;
    docsearch({
        container: '#docsearch',
        appId: search.value.appId,
        indexName: search.value.indexName,
        apiKey: search.value.apiKey,
        askAi: {
            indexName: 'bog-md', 
            assistantId: search.value.assistantId
       },
    })
})
</script>


<style>  
    #docsearch {
        margin-left: 1rem;
    }

     .DocSearch-Hit[aria-selected=true] a ,
    .DocSearch-Hit[aria-selected=true] .DocSearch-Hit--AskAI {
        background: #17b279 !important;
    }

</style>