<script lang="ts" setup>
import { useClipboard } from "@vueuse/core";
import { ElMessage, ElTooltip } from "element-plus";
import { useRoute } from "vitepress";
import { computed } from "vue";

const route = useRoute();
const pageUrl = computed(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin + route.path;
});

const { copy } = useClipboard();

const handleCopy = async () => {
    try {
        await copy(pageUrl.value);
        ElMessage.success("复制成功");
    }
    catch (err) {
        ElMessage.error("复制失败");
    }
};

</script>

<template>
  <div class="custom-block tip article-bottom-tip">
    <p class="custom-block-title">声明</p>
    <p>
      作者：
      <a href="https://xiaoying.org.cn" rel="noopener noreferrer" target="_blank">liyao</a>
    </p>
    <p>
      版权：本博客所有文章除特别声明外，均采用<a href="http://www.suncai.net/PubLicense/CCBY40.html" target="_blank">CCBY-NC-SA4.O</a>许可协议。转载请注明!
    </p>
    <p class="link-row" style="margin-bottom: 0">
      链接：
      <a :href="pageUrl" class="page-url" rel="noopener noreferrer" target="_blank">
        {{ pageUrl }}
      </a>
      <el-tooltip content="点击复制" placement="top">
        <span class="copy-icon" @click="handleCopy">📋</span>
      </el-tooltip>
    </p>
  </div>
</template>

<style scoped>
.article-bottom-tip {
    margin-top: 2rem;
    margin-bottom: 1rem;
    padding: 1rem 1.25rem;
    border-radius: 8px;
    font-size: 0.85rem;
    line-height: 1.6;
}

.article-bottom-tip a {
    color: var(--vp-c-brand-1);
    text-decoration: none;
}

.article-bottom-tip a:hover {
    text-decoration: underline;
}

/* 复制图标 */
.copy-icon {
    cursor: pointer;
    font-size: 1rem;
    margin-left: 0.3rem;
    user-select: none;
    color: var(--vp-c-text-2);
    transition: color 0.2s;
}

.copy-icon:hover {
    color: var(--vp-c-brand-1);
}
</style>
