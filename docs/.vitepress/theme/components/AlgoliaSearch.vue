<script lang="ts" setup>
import docsearch from "@docsearch/js";
import { useData, useRouter } from "vitepress";
import { DocSearchTranslations, SearchOptions } from "vitepress/types/docsearch";
import { nextTick, onMounted, watch } from "vue";

export interface AlgoliaSearchOptions extends DocSearchProps {
    locales?: Record<string, Partial<DocSearchProps>>;
}

export interface DocSearchProps {
    appId: string;
    apiKey: string;
    indexName: string;
    placeholder?: string;
    searchParameters?: SearchOptions;
    disableUserPersonalization?: boolean;
    initialQuery?: string;
    insights?: boolean;
    translations?: DocSearchTranslations;
    askAi?: DocSearchAskAi | string;
}

export interface DocSearchAskAi {
    indexName?: string;
    apiKey?: string;
    appId?: string;
    assistantId: string | null;
    searchParameters?: {
        facetFilters?: SearchOptions["facetFilters"];
    };
}

const props = defineProps<{
    algolia: AlgoliaSearchOptions
}>();
const router = useRouter();
const { site, localeIndex, lang } = useData();

onMounted(() => update());
watch(localeIndex, () => update());

async function update() {
    await nextTick();
    const options = {
        ...props.algolia,
        ...props.algolia.locales?.[localeIndex.value]
    };

    const rawFacetFilters = options.searchParameters?.facetFilters ?? [];
    const facetFilters = [
        ...(Array.isArray(rawFacetFilters)
                ? rawFacetFilters
                : [rawFacetFilters]
        ).filter(f => !f.startsWith("lang:")),
        `lang:${ lang.value }`
    ];

    const askAiProp = options.askAi;
    const isAskAiString = typeof askAiProp === "string";

    const askAi = askAiProp
        ? {
            indexName: isAskAiString
                ? options.indexName
                : askAiProp.indexName,
            apiKey: isAskAiString
                ? options.apiKey
                : askAiProp.apiKey,
            appId: isAskAiString
                ? options.appId
                : askAiProp.appId,
            assistantId: isAskAiString
                ? askAiProp
                : askAiProp.assistantId,
            searchParameters: facetFilters.length
                ? { facetFilters }
                : undefined
        }
        : undefined;

    initialize({
        ...options,
        searchParameters: { ...options.searchParameters, facetFilters },
        askAi
    });
}

function initialize(userOptions: AlgoliaSearchOptions) {
    const options = Object.assign({}, userOptions, {
        container: '#docsearch',
        navigator: {
            navigate(item: { itemUrl: string }) {
                router.go(item.itemUrl)
            }
        },

        transformItems(items: { url: string }[]) {
            return items.map((item) => {
                return Object.assign({}, item, {
                    url: getRelativePath(item.url)
                })
            })
        }
    })

    docsearch(options as any)
}


function getRelativePath(url: string) {
    const { pathname, hash } = new URL(url, window.location.origin);
    return pathname.replace(/\.html$/, site.value.cleanUrls ? "" : ".html") + hash;
}
</script>

<template>
  <div id="docsearch" />
</template>

<style>
</style>