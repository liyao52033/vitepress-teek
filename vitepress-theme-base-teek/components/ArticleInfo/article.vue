<script setup lang="ts">
import { User, Calendar, FolderOpened, CollectionTag } from "@element-plus/icons-vue";
import { useRoute } from "vitepress";
import { computed, unref, ref, watch } from "vue";
import { formatDate, isFunction } from "../../helper";
import { TkContentData } from "../../post/types";
import { useNamespace } from "../../hooks";
import { Article } from "../../config/types";
import { PostBaseInfoProps } from "./types";
import { Icon } from "../Icon";
import { usePosts, useUnrefData } from "../configProvider";

defineOptions({ name: "ArticleInfo" });

const ns = useNamespace("articleInfo");

// 接收父组件传入的参数
const { scope, split = false } = defineProps<PostBaseInfoProps>();

// 获取全局配置和主题信息
const { frontmatter, theme } = useUnrefData();
const {
  showIcon = true,
  dateFormat = "yyyy-MM-dd",
  showAuthor = true,
  showDate = true,
  showCategory = true,
  showTag = false,
}: Article = { ...theme.article, ...frontmatter.article, ...frontmatter.tk?.article };

// 获取文章列表和路由信息
const posts = usePosts();
const route = useRoute();

// 响应式存储当前文章数据
const currentPost = ref<TkContentData | null>();

// 生成链接的工具函数：替换路径中的{data}占位符
// 【修复1：确保返回值为string类型】
const getHref = (path: string | ((url: string) => string) | undefined, data: string) => {
  // 如果路径是undefined，返回空字符串
  if (!path) return "";
  // 如果路径是函数，先执行函数获取字符串路径
  const resolvedPath = typeof path === 'function' ? path(data) : path;
  return resolvedPath.replace('{data}', encodeURIComponent(data));
};

// 根据路由获取当前文章数据
const getCurrentPostByRoute = () => {
  const originPosts: TkContentData[] = unref(posts).originPosts || [];
  return originPosts.find(item => 
    [item.url, `${item.url}.md`].includes(`/${route.data.relativePath}`)
  ) || null;
};

// 计算文章创建时间
const calculateDate = () => {
  if (currentPost.value?.frontmatter?.date) {
    const date = currentPost.value.frontmatter.date;
    if (isFunction(dateFormat)) return dateFormat(date);
    return formatDate(date, dateFormat);
  }

  const fallbackDate = Date.now().toLocaleString();
  return isFunction(dateFormat) ? dateFormat(fallbackDate) : formatDate(fallbackDate, dateFormat);
};

// 响应式存储日期值
const dateValue = ref(calculateDate());

// 监听路由变化，更新当前文章和日期
watch(
  () => route.path, 
  () => {
    currentPost.value = getCurrentPostByRoute();
    dateValue.value = calculateDate();
  },
  { immediate: true }
);

// 响应式生成文章信息列表
const baseInfo = computed(() => {
  const { frontmatter = {} } = currentPost.value || {};
  const { categories, tags, author } = frontmatter;
  
  return [
    {
      title: "作者",
      icon: User,
      data: author?.name,
      href: author?.link,
      target: author?.link ? "_blank" : "_self",
      show: showAuthor,
    },
    {
      title: "创建时间",
      icon: Calendar,
      data: dateValue.value,
      href: "/archives",
      show: showDate,
    },
    {
      title: "分类",
      icon: FolderOpened,
      dataList: categories || [],
      href: "/categories?category={data}",
      class: "or",
      show: (scope as string) === "home" || showCategory,
    },
    {
      title: "标签",
      icon: CollectionTag,
      dataList: tags || [],
      href: "/tags?tag={data}",
      class: "or",
      show: (scope as string) === "home" || showTag,
    },
  ];
});
</script>

<template>
  <div :class="[ns.b(), 'flx-align-center', scope]">
    <template v-for="item in baseInfo" :key="item.title">
      <div v-if="item.show && (item.data || item.dataList?.length)" :class="['flx-center', `${scope}-item`, { split }]">
        <Icon v-if="showIcon"><component :is="item.icon" /></Icon>
        
        <!-- 单数据项展示（作者/时间） -->
        <a
          v-if="item.data"
          :title="item.title"
          :href="item.href"
          :target="item.target"
          :class="[item.class, 'hover-color']"
        >
          {{ item.data }}
        </a>

        <!-- 多数据项展示（分类/标签） -->
        <template v-else>
          <a
            v-for="(data, index) in item.dataList"
            :key="index"
            :title="item.title"
            :href="getHref(item.href, data)"
            :class="[item.class, 'hover-color']"
          >
            {{ data }}
            <span v-if="index < item.dataList.length - 1" class="mx-1"></span>
          </a>
        </template>
      </div>
    </template>
  </div>
</template>
