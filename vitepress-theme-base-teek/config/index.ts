import { ThemeConfig } from "./types";
import MdH1 from "vitepress-plugin-md-h1";
import Catalogue from "vitepress-plugin-catalogue";
import DocAnalysis from "vitepress-plugin-doc-analysis";
import FileContentLoader, { FileContentLoaderOptions } from "vitepress-plugin-file-content-loader";
import AutoFrontmatter, { FileInfo } from "vitepress-plugin-setfrontmatter";
import SidebarPermalinkPlugin from 'vitepress-plugin-sidebar-permalink'
import { UserConfig } from "vitepress";
import { PluginOption } from "vite";
import { transformData, transformRaw } from "../post";
import { Post, TkContentData } from "../post/types";
import { codeArrowPlugin, imgCardPlugin, navCardPlugin, shareCardPlugin, todoPlugin } from "../markdown";
import { containerPlugins, createContainersThenUse } from "../markdown/plugins/container";
import { createAuthor, createCategory, createCoverImg, createPermalink } from "../utils/addFrontmatter";

export default function baseConfig(config: ThemeConfig ): UserConfig {
  const { vitePlugins, markdownPlugins = [], markdownContainers = [], containerLabel, ...tkThemeConfig } = config;
  const {
    permalink = true,
    mdH1 = true,
    sidebarOption = {},
    catalogueOption,
    docAnalysisOption = {},
    fileContentLoaderIgnore = [],
    autoFrontmatter = true,
    autoFrontmatterOption = {},
  } = vitePlugins || {};

  const plugins: PluginOption[] = [];

  // 定义各插件扫描时忽略的目录
  const ignoreDir = {
    autoFrontmatter: ["**/@pages/**", ".vite-cache", "**/pages/**"],
    sidebar: ["@pages", "@fragment", ".vite-cache", "pages"],
    categories: ["@fragment", "articles", ".vite-cache", "pages"],
    docAnalysis: ["@pages", /目录页/, ".vite-cache", "pages"],
    fileContentLoader: ["**/components/**", "**/.vitepress/**", "**/public/**", "**/pages/**", ".vite-cache"],
  };

  // 自动生成 frontmatter 插件
  if (autoFrontmatter) {
    const {
      pattern,
      globOptions = {},
      transform,
      permalinkPrefix = "pages",
      categories = true,
      coverImg = false
    } = autoFrontmatterOption;

    // 默认扫描全部 MD 文件
    if (!pattern) autoFrontmatterOption.pattern = "**/*.md";

    autoFrontmatterOption.globOptions = {
      ...autoFrontmatterOption.globOptions,
      ignore: [...ignoreDir.autoFrontmatter, ...(globOptions.ignore || [])],
    };

    // 自定义 frontmatter 内容，添加永久链接和分类
    autoFrontmatterOption.transform = (frontmatter: any, fileInfo: FileInfo) => {
      let transformResult = transform?.(frontmatter, fileInfo) || {};

     if ( permalink && !frontmatter.permalink ) {
        transformResult = { ...transformResult, ...createPermalink(permalinkPrefix) };
      }

      if ( !frontmatter.author ) {
        transformResult = { ...transformResult, ...createAuthor() };
      }

      if ( !frontmatter.coverImg && coverImg ) {
        transformResult = { ...transformResult, ...createCoverImg() };
      }

      if (categories && !frontmatter.categories) {
        transformResult = { ...transformResult, ...createCategory(fileInfo, ignoreDir.categories) };
      }

      return Object.keys(transformResult).length ? { ...frontmatter, ...transformResult } : undefined;
    };

    plugins.push(AutoFrontmatter(autoFrontmatterOption));
  }


  // 自动给 MD 添加一级标题插件
  if (mdH1) plugins.push(MdH1());
  // 侧边栏插件
  plugins.push(SidebarPermalinkPlugin(sidebarOption))
  // 文档内容分析插件
  docAnalysisOption.ignoreList = [...ignoreDir.docAnalysis];
  plugins.push(DocAnalysis(docAnalysisOption));

  // 目录页插件
  plugins.push(Catalogue(catalogueOption));

  const fileContentLoaderOptions: FileContentLoaderOptions<TkContentData, Post> = {
    pattern: ["**/*.md"],
    // 指定摘录格式
    excerpt: "<!-- more -->",
    includeSrc: true,
    transformData,
    transformRaw,
    themeConfigKey: "posts",
    globOptions: {
      ignore: [...ignoreDir.fileContentLoader, ...fileContentLoaderIgnore],
    },
  };

  // Post 数据处理插件
  plugins.push(FileContentLoader<TkContentData, Post>(fileContentLoaderOptions));


  return {
    // 使用永久链接插件需要忽略死链提醒
    ignoreDeadLinks: true,
    vite: {
      plugins: plugins as any,
      // 解决项目启动后终端打印 Scss 的废弃警告：The legacy JS API is deprecated and will be removed in Dart Sass 2.0.0.
      css: { preprocessorOptions: { scss: { api: "modern" } } },
      optimizeDeps: {
        include: ["element-plus"],
      },
    },
    markdown: {
      config: md => {

        md.use(containerPlugins, containerLabel);

        [imgCardPlugin, navCardPlugin, todoPlugin, shareCardPlugin, codeArrowPlugin].forEach(plugin => md.use(plugin, containerLabel));

        // 创建用户配置的自定义容器
        createContainersThenUse(md, markdownContainers);

        // 用户配置的 markdown 插件
        markdownPlugins.forEach(plugin => md.use(plugin));
      },
    },
    themeConfig: tkThemeConfig,
  };
}
