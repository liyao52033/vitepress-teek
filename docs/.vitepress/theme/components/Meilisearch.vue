<template>
    <div>
        <!-- 搜索触发按钮 -->
        <button aria-label="Search" class="DocSearch DocSearch-Button" type="button" @click="toggleSearch">
            <span class="DocSearch-Button-Container">
                <span class="vp-icon DocSearch-Search-Icon"></span>
                <span class="DocSearch-Button-Placeholder">Search</span>
            </span>
            <span class="DocSearch-Button-Keys">
                <kbd class="DocSearch-Button-Key"></kbd>
                <kbd class="DocSearch-Button-Key">K</kbd>
            </span>
        </button>

        <!-- 搜索弹窗 -->
        <div v-if="isSearchOpen" aria-labelledby="docsearch-label" aria-modal="true"
             class="DocSearch DocSearch-Container"
             role="dialog" @click="closeSearch">
            <div class="DocSearch-Modal" @click.stop>
                <header class="DocSearch-SearchBar">
                    <form class="DocSearch-Form" @submit.prevent>
                        <label id="docsearch-label" class="DocSearch-MagnifierLabel" for="docsearch-input">
                            <span class="DocSearch-VisuallyHiddenForAccessibility">Search</span>
                        </label>
                        <input id="docsearch-input" ref="searchInput" v-model="searchQuery"
                               :placeholder="meiliConfig.placeholder || '搜索文档...'"
                               autocapitalize="off" autocomplete="off"
                               autocorrect="off"
                               autofocus class="DocSearch-Input" spellcheck="false" type="search" @input="handleInput"
                               @keydown.down.prevent="moveDown" @keydown.up.prevent="moveUp"
                               @keydown.esc.prevent="closeSearch" @keydown.enter.prevent="goToHit" />
                        <button v-if="searchQuery" class="DocSearch-Reset" type="reset" @click="clearSearch">✕</button>
                    </form>
                    <button class="DocSearch-Cancel" type="button" @click="closeSearch">Cancel</button>
                </header>

                <!-- 搜索结果区域 -->
                <div class="DocSearch-Dropdown">
                    <div ref="hitsContainer" class="DocSearch-Dropdown-Container">
                        <!-- 分组渲染搜索结果 -->
                        <section v-for="(group, groupIdx) in groupedHits" v-if="searchQuery" :key="groupIdx"
                                 class="DocSearch-Hits">
                            <div class="DocSearch-Hit-source">{{ group.title }}</div>
                            <ul :id="'docsearch-hits' + groupIdx + '-list'" role="listbox">
                                <!-- 列表项：添加active类模拟默认hover，使用highlightKeyword处理关键词高亮 -->
                                <li v-for="(hit, itemIdx) in group.items" :key="itemIdx"
                                    :class="{ 'active': currentGroupIndex === groupIdx && currentItemIndex === itemIdx }"
                                    class="DocSearch-Hit"
                                    role="option" @mouseenter="handleMouseEnter(groupIdx, itemIdx)">
                                    <a :href="hit.url" @click="closeSearch">
                                        <div class="DocSearch-Hit-Container">
                                            <div class="DocSearch-Hit-content-wrapper">
                                                <!-- 主标题：关键词高亮 -->
                                                <span class="DocSearch-Hit-title"
                                                      v-html="highlightKeyword(hit.hierarchy_lvl2, searchQuery)"></span>
                                                <!-- 副标题：仅匹配关键词时展示 + 高亮 -->
                                                <span v-if="hit.hierarchy_lvl3 && isMatch(hit.hierarchy_lvl3, searchQuery)"
                                                      class="DocSearch-Hit-path"
                                                      v-html="highlightKeyword(hit.hierarchy_lvl3, searchQuery)"></span>
                                                <!-- 内容：仅匹配关键词时展示 + 高亮 -->
                                                <span v-if="hit.content && isMatch(hit.content, searchQuery)"
                                                      class="DocSearch-Hit-path"
                                                      v-html="highlightKeyword(hit.content, searchQuery)"></span>
                                            </div>
                                            <div class="DocSearch-Hit-action">
                                                <svg height="20" viewBox="0 0 20 20" width="20">
                                                    <g fill="none" fill-rule="evenodd" stroke="currentColor"
                                                       stroke-linecap="round" stroke-linejoin="round">
                                                        <path d="M18 3v4c0 2-2 4-4 4H2"></path>
                                                        <path d="M8 17l-6-6 6-6"></path>
                                                    </g>
                                                </svg>
                                            </div>
                                        </div>
                                    </a>
                                </li>
                            </ul>
                        </section>
                        <!-- 无结果提示 -->
                        <div v-if="searchQuery && hits.length === 0" class="DocSearch-NoResults">
                            No results for "{{ searchQuery }}"
                        </div>
                    </div>
                </div>

                <!-- Footer 布局 -->
                <footer class="DocSearch-Footer"
                        style="display: flex; justify-content: space-between; align-items: center; padding: 8px;">
                    <div class="DocSearch-Logo" style="display: flex; align-items: center;">
                        <span class="DocSearch-Label" style="margin-right: 4px;">Search by</span>
                        <a href="https://www.meilisearch.com" rel="noopener noreferrer" target="_blank">
                            <img alt="Meilisearch's logo" data-nimg="1" decoding="async" fetchpriority="high"
                                 height="25"
                                 src="https://raw.githubusercontent.com/liyao52033/picx-images-hosting/master/img/20250906155313864.png"
                                 width="162">
                        </a>
                    </div>
                    <ul class="DocSearch-Commands">
                        <li><kbd class="DocSearch-Commands-Key">
                                <svg aria-label="Enter key" height="15" role="img" width="15">
                                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                       stroke-width="1.2">
                                        <path d="M12 3.53088v3c0 1-1 2-2 2H4M7 11.53088l-3-3 3-3"></path>
                                    </g>
                                </svg></kbd><span class="DocSearch-Label">选择</span></li>
                        <li>
                            <kbd class="DocSearch-Commands-Key">
                                <svg aria-label="Arrow down" height="15" role="img" width="15">
                                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                       stroke-width="1.2">
                                        <path d="M7.5 3.5v8M10.5 8.5l-3 3-3-3"></path>
                                    </g>
                                </svg>
                            </kbd><kbd class="DocSearch-Commands-Key"><svg aria-label="Arrow up" height="15" role="img"
                                                                           width="15">
                                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                       stroke-width="1.2">
                                        <path d="M7.5 11.5v-8M10.5 6.5l-3-3-3 3"></path>
                                    </g>
                                </svg></kbd><span class="DocSearch-Label">切换</span>
                        </li>
                        <li><kbd class="DocSearch-Commands-Key"><svg aria-label="Escape key" height="15" role="img"
                                                                     width="15">
                                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                       stroke-width="1.2">
                                        <path
                                                d="M13.6167 8.936c-.1065.3583-.6883.962-1.4875.962-.7993 0-1.653-.9165-1.653-2.1258v-.5678c0-1.2548.7896-2.1016 1.653-2.1016.8634 0 1.3601.4778 1.4875 1.0724M9 6c-.1352-.4735-.7506-.9219-1.46-.8972-.7092.0246-1.344.57-1.344 1.2166s.4198.8812 1.3445.9805C8.465 7.3992 8.968 7.9337 9 8.5c.032.5663-.454 1.398-1.4595 1.398C6.6593 9.898 6 9 5.963 8.4851m-1.4748.5368c-.2635.5941-.8099.876-1.5443.876s-1.7073-.6248-1.7073-2.204v-.4603c0-1.0416.721-2.131 1.7073-2.131.9864 0 1.6425 1.031 1.5443 2.2492h-2.956">
                                        </path>
                                    </g>
                                </svg></kbd><span class="DocSearch-Label">关闭</span></li>
                    </ul>
                </footer>
            </div>
        </div>
    </div>
</template>

<script setup>
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import instantsearch from 'instantsearch.js';
import { hits as hitsWidget } from 'instantsearch.js/es/widgets';
import { useData } from 'vitepress';
import { computed, nextTick, onUnmounted, ref } from 'vue';

const { theme } = useData();
const meiliConfig = computed(() => theme.value.meilisearch || {});

const isSearchOpen = ref(false);
const searchQuery = ref('');
const hits = ref([]);
const searchInput = ref(null);
const hitsContainer = ref(null);
let searchInstance = null;
let searchClient = null;
let selectedIndex = ref(-1);
const currentGroupIndex = ref(-1);
const currentItemIndex = ref(-1);

// 按 hierarchy_lvl1 分组展示搜索结果
const groupedHits = computed(() => {
    const groupMap = new Map();
    hits.value.forEach(hit => {
        const groupKey = hit.hierarchy_lvl1 || 'Documentation';
        if (!groupMap.has(groupKey)) {
            groupMap.set(groupKey, { title: groupKey, items: [] });
        }
        groupMap.get(groupKey).items.push(hit);
    });
    return Array.from(groupMap.values()).sort((a, b) => a.title.localeCompare(b.title));
});

// 切换搜索弹窗显示
const toggleSearch = async () => {
    isSearchOpen.value = !isSearchOpen.value;
    if (isSearchOpen.value) {
        await nextTick();
        searchInput.value?.focus();
        initMeiliSearch();
    } else {
        clearSearch();
    }
};

// 初始化 MeiliSearch 搜索实例
const initMeiliSearch = () => {
    if (searchInstance || !meiliConfig.value.host || !meiliConfig.value.apiKey || !meiliConfig.value.indexName) return;
    searchClient = instantMeiliSearch(meiliConfig.value.host, meiliConfig.value.apiKey).searchClient;

    searchInstance = instantsearch({
        indexName: meiliConfig.value.indexName,
        searchClient,
        routing: false
    });

    searchInstance.addWidgets([
        hitsWidget({
            container: hitsContainer.value,
            transformItems: items => {
                const validItems = items.filter(item => item.url && item.anchor);
                hits.value = validItems;
                // 默认选中第一个项（模拟hover）
                if (validItems.length > 0) {
                    currentGroupIndex.value = 0; // 第一个分组
                    currentItemIndex.value = 0;  // 分组第一个项
                    updateSelectedIndex();        // 同步全局索引
                    // 等待DOM渲染后执行滚动（确保元素存在）
                    nextTick(() => scrollToActiveItem());
                } else {
                    // 无结果时重置状态
                    currentGroupIndex.value = -1;
                    currentItemIndex.value = -1;
                    selectedIndex.value = -1;
                }
                return validItems;
            },
            templates: {
                item: () => ''
            }
        })
    ]);

    searchInstance.start();
};

// 处理输入：为空时清空结果，不为空时执行搜索
const handleInput = () => {
    if (searchInstance?.helper) {
        if (searchQuery.value) {
            searchInstance.helper.setQuery(searchQuery.value).search();
        } else {
            clearSearch();
        }
    }
};

// 清空搜索（输入、结果、选中状态）
const clearSearch = () => {
    searchQuery.value = '';
    hits.value = [];
    selectedIndex.value = -1;
    currentGroupIndex.value = -1;
    currentItemIndex.value = -1;
};

// 关闭搜索弹窗
const closeSearch = () => {
    isSearchOpen.value = false;
    clearSearch();
};

const handleMouseEnter = (groupIdx, itemIdx) => {
    currentGroupIndex.value = groupIdx; // 更新分组索引
    currentItemIndex.value = itemIdx;   // 更新项索引
    updateSelectedIndex();              // 同步全局索引
};

// 向下切换逻辑
const moveDown = () => {
    const groups = groupedHits.value;
    if (groups.length === 0) return;

    if (currentGroupIndex.value === -1) {
        for (let i = 0; i < groups.length; i++) {
            if (groups[i].items.length > 0) {
                currentGroupIndex.value = i;
                currentItemIndex.value = 0;
                updateSelectedIndex();
                scrollToActiveItem(); // 切换时滚动
                return;
            }
        }
        return;
    }

    const currentGroup = groups[currentGroupIndex.value];
    if (currentItemIndex.value < currentGroup.items.length - 1) {
        currentItemIndex.value++;
        updateSelectedIndex();
        scrollToActiveItem(); // 切换时滚动
        return;
    }

    let nextGroupIndex = currentGroupIndex.value + 1;
    while (nextGroupIndex < groups.length) {
        if (groups[nextGroupIndex].items.length > 0) {
            currentGroupIndex.value = nextGroupIndex;
            currentItemIndex.value = 0;
            updateSelectedIndex();
            scrollToActiveItem(); // 切换时滚动
            return;
        }
        nextGroupIndex++;
    }

    for (let i = 0; i < groups.length; i++) {
        if (groups[i].items.length > 0) {
            currentGroupIndex.value = i;
            currentItemIndex.value = 0;
            updateSelectedIndex();
            scrollToActiveItem(); // 切换时滚动
            return;
        }
    }
};

// 向上切换逻辑
const moveUp = () => {
    const groups = groupedHits.value;
    if (groups.length === 0) return;

    if (currentGroupIndex.value === -1) {
        for (let i = groups.length - 1; i >= 0; i--) {
            if (groups[i].items.length > 0) {
                currentGroupIndex.value = i;
                currentItemIndex.value = groups[i].items.length - 1;
                updateSelectedIndex();
                scrollToActiveItem(); // 切换时滚动
                return;
            }
        }
        return;
    }

    const currentGroup = groups[currentGroupIndex.value];
    if (currentItemIndex.value > 0) {
        currentItemIndex.value--;
        updateSelectedIndex();
        scrollToActiveItem(); // 切换时滚动
        return;
    }

    let prevGroupIndex = currentGroupIndex.value - 1;
    while (prevGroupIndex >= 0) {
        if (groups[prevGroupIndex].items.length > 0) {
            currentGroupIndex.value = prevGroupIndex;
            currentItemIndex.value = groups[prevGroupIndex].items.length - 1;
            updateSelectedIndex();
            scrollToActiveItem(); // 切换时滚动
            return;
        }
        prevGroupIndex--;
    }

    for (let i = groups.length - 1; i >= 0; i--) {
        if (groups[i].items.length > 0) {
            currentGroupIndex.value = i;
            currentItemIndex.value = groups[i].items.length - 1;
            updateSelectedIndex();
            scrollToActiveItem(); // 切换时滚动
            return;
        }
    }
};

// 同步选中状态（currentGroupIndex/currentItemIndex → selectedIndex）
const updateSelectedIndex = () => {
    const groups = groupedHits.value;
    if (currentGroupIndex.value === -1 || currentItemIndex.value === -1) {
        selectedIndex.value = -1;
        return;
    }

    let prevItemsCount = 0;
    for (let i = 0; i < currentGroupIndex.value; i++) {
        prevItemsCount += groups[i].items.length;
    }

    selectedIndex.value = prevItemsCount + currentItemIndex.value;
};

// 滚动到当前选中项
const scrollToActiveItem = () => {
    const groups = groupedHits.value;
    if (currentGroupIndex.value === -1 || currentItemIndex.value === -1 || !groups.length) return;

    // 找到当前选中项的DOM元素（分组列表下的第N个li）
    const groupUl = document.getElementById(`docsearch-hits${ currentGroupIndex.value }-list`);
    if (!groupUl) return;

    const activeLi = groupUl.children[currentItemIndex.value];
    if (activeLi) {
        // 平滑滚动，让选中项在视口内（顶部对齐，避免被遮挡）
        activeLi.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
        });
    }
};

// 判断文本是否包含关键词（大小写不敏感）
const isMatch = (text, keyword) => {
    if (!text || !keyword) return false;
    // 转义正则特殊字符，避免报错（如. * + ?等）
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // 大小写不敏感匹配
    return new RegExp(escapedKeyword, 'i').test(text);
};

// 高亮文本中的关键词
const highlightKeyword = (text, keyword) => {
    if (!text || !keyword) return text; // 无关键词时直接返回原文本
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // 用<span>包裹匹配的关键词，添加高亮样式
    return text.replace(
        new RegExp(`(${ escapedKeyword })`, 'gi'), // g=全局匹配，i=大小写不敏感
        '<span class="docsearch-highlight">$1</span>'
    );
};

// 跳转到选中的搜索结果
const goToHit = () => {
    if (selectedIndex.value >= 0 && selectedIndex.value < hits.value.length) {
        window.location.href = hits.value[selectedIndex.value].url;
        closeSearch();
    }
};

// 注册 Ctrl+K 快捷键
document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
    }
});

// 组件卸载时销毁搜索实例
onUnmounted(() => {
    if (searchInstance) {
        searchInstance.removeWidgets();
        searchInstance.destroy();
        searchInstance = null;
    }
});
</script>

<style scoped>
.DocSearch-Button {
    background-color: transparent;
    margin-left: 1rem;
}

/* hover样式（与active类保持一致，模拟默认hover） */
.DocSearch-Hit a:hover,
.DocSearch-Hit.active a {
    background-color: var(--docsearch-primary-color);
}

/* hover/active时子元素颜色同步 */
.DocSearch-Hit a:hover *,
.DocSearch-Hit.active a * {
    color: var(--docsearch-hit-active-color);
}

.DocSearch-Hit-action {
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease, visibility 0.2s ease;
}

.DocSearch-Hit a:hover .DocSearch-Hit-action,
.DocSearch-Hit.active .DocSearch-Hit-action {
    opacity: 1;
    visibility: visible;
}

.DocSearch-Logo img {
    display: block;
    height: 44px;

}

/* 关键词高亮样式（可根据主题调整颜色） */
:deep(.docsearch-highlight) {
    background-color: rgba(255, 235, 59, 0.8);
    color: var(--docsearch-text-color) !important;
    /* 避免被父级hover样式覆盖 */
    padding: 0 2px;
    border-radius: 2px;
    box-shadow: 0 0 2px rgba(255, 235, 59, 0.5);
    /* 强化视觉，确保可见 */
}
</style>