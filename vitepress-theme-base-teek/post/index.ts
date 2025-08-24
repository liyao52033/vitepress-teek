import { SiteConfig } from "vitepress";
import { TkContentData, Post } from "./types";
import {
  filterPosts,
  getSortPostsByDateAndSticky,
  getSortPostsByDate,
  getGroupPosts,
  getGroupCards,
  groupByYear,
  groupByYearMonth,
} from "./helper";
import { formatDate } from "../helper/date";
import matter from "gray-matter";
import type { FileContentLoaderData } from "vitepress-plugin-file-content-loader";
import {  basename, join } from "node:path";
import fs,{ statSync, readdirSync } from "node:fs";

// ！该文件只在 node 环境运行，无法直接在浏览器环境运行，因此浏览器环境的代码不要引入该文件

/**
 * 从 md 文件中读取一级标题
 * @param mdContent md 文件内容
 */
const getTitleFromMd = (mdContent: string) => {
  // 切割换行符 \r\n 或 \n
  const lines = mdContent.trimStart().split(/\r?\n/);

  for (const line of lines) {
    if (line.startsWith("# ")) {
      return line.substring(2).trim();
    }
  }

  return undefined;
};

/**
 * 获取文章标题，获取顺序：frontmatter.title > md 文件开头的一级标题 > 文件名
 *
 * @param post 文章数据
 */
// @ts-ignore
export function getTitle(post: RequiredKeyPartialOther<TkContentData, "frontmatter" | "url">) {
  if (post.frontmatter.title) return post.frontmatter.title;

  const { content = "" } = matter(post.src || "", {});
  const splitName = basename(post.url).split(".");
  // 如果目录下有 index.md 且没有一级标题，则使用目录名作为文章标题
  const name = splitName.length > 1 ? splitName[1] : splitName[0];
  return getTitleFromMd(content) || name || "";
}

// 递归查找文件
function findRewritesJson(dir: any): string | null {
  const files = readdirSync(dir);

  // 遍历目录中的每个文件和子目录
  for (const file of files) {
    const fullPath = join(dir, file);
    const stat = statSync(fullPath);

    // 如果是文件并且是 rewrites.json
    if (stat.isFile() && file === 'rewrites.json') {
      return fullPath; // 返回找到的文件路径
    }

    // 如果是目录，则递归查找
    if (stat.isDirectory()) {
      const result = findRewritesJson(fullPath);
      if (result) return result;
    }
  }

  // 如果没有找到返回 null
  return null;
}


/**
 * 转换为文章数据
 */
export const transformData = (data: FileContentLoaderData): TkContentData => {
  const siteConfig: SiteConfig = (globalThis as any).VITEPRESS_CONFIG;
  const { themeConfig } = siteConfig.userConfig;
  const { frontmatter, url } = data;

  if (frontmatter.date) frontmatter.date = formatDate(frontmatter.date);

  return {
    url: frontmatter.permalink || url,
    frontmatter: frontmatter,
    relativePath: data.relativePath,
    author: themeConfig.author,
    title: getTitle(data),
    date: getDate(data, siteConfig.srcDir),
    capture: getCaptureText(data),
  };
};

/**
 * 转换为各个文章不同类型的数据
 */
export const transformRaw = (posts: TkContentData[]): Post => {
  const siteConfig: SiteConfig = (globalThis as any).VITEPRESS_CONFIG;
  const { locales = {} } = siteConfig.userConfig;

  const postsData = resolvePosts(posts);

  const localesKeys = Object.keys(locales);
  // 没有配置国际化，则返回所有 posts 数据
  if (!localesKeys.length) return postsData;

  // 国际化处理，计算每个语言目录下的 posts 数据
  const postsLocale: Record<string, Post> = {};
  localesKeys
    .filter(localesKey => localesKey !== "root")
    .forEach(localesKey => {
      const localePosts = posts.filter(post => post.url.startsWith(`/${localesKey}`));
      postsLocale[localesKey] = resolvePosts(localePosts);
    });

  // root 处理
  const rootPosts = posts.filter(post => !localesKeys.some(localesKey => post.url.startsWith(`/${localesKey}`)));
  postsLocale["root"] = resolvePosts(rootPosts);

  return { ...postsData, locales: postsLocale };
};

const resolvePosts = (posts: TkContentData[]): Post => {
  const originPosts = filterPosts(posts);
  const sortPostsByDateAndSticky = getSortPostsByDateAndSticky(originPosts);
  const sortPostsByDate = getSortPostsByDate(originPosts);
  const groupPostsByYear = groupByYear(sortPostsByDate);
  const groupPostsByYearMonth = groupByYearMonth(sortPostsByDate);
  const groupPosts = getGroupPosts(sortPostsByDateAndSticky);
  const groupCards = getGroupCards(groupPosts);

  return {
    originPosts,
    sortPostsByDateAndSticky,
    sortPostsByDate,
    groupPostsByYear,
    groupPostsByYearMonth,
    groupPosts,
    groupCards,
  };
};



/**
 * 获取文章时间，获取顺序：frontmatter.date > 文件创建时间 > 当前时间
 *
 * @param post 文章数据
 * @param srcDir 项目绝对路径
 */
// @ts-ignore
export function getDate(post, srcDir) {
  const { frontmatter, url } = post;

  // 如果 frontmatter.date 存在，直接返回
  if (frontmatter.date) return frontmatter.date;

  // 查找 rewrites.json 文件（递归查找）
  const rewritesPath = findRewritesJson(srcDir);
  
  let filePath;

  if (rewritesPath) {
    // 如果 rewrites.json 存在，读取并解析
    const rewrites = JSON.parse(fs.readFileSync(rewritesPath, 'utf-8')).rewrites;

    // 去掉 url 前后的 / 并加上 .md
    const urlWithMd = `${url.replace(/^\/|\/$/g, '')}.md`;

    // 根据值去查找对应的键
    let mappingKey = null;
    for (const key in rewrites) {
      if (rewrites[key] === urlWithMd) {
        mappingKey = key; 
        break;
      }
    }

    if (mappingKey) {
      filePath = join(srcDir, mappingKey);
    } 
  }


  // 如果没有在 rewrites 中找到路径，则直接拼接原路径
  if (!filePath) {
    filePath = join(srcDir, `${url.endsWith("/") ? `${url}index` : url.replace(/\.html$/, "")}.md`);
  }

  // 获取文件的创建时间或最后访问时间
  try {
    const stat = statSync(filePath);
    return formatDate(stat.birthtime || stat.atime);
  } catch (error) {
    console.error(`Error reading file stats for ${filePath}:`, error);
    return null;  // 如果文件读取失败，可以返回默认值
  }
}


/**
 * 截取 markdown 文件前 count 数的内容
 */
export const getCaptureText = (post: TkContentData, count = 200) => {
  const { content = "" } = matter(post.src || "", {});
  return (
    content
      // 首个标题
      ?.replace(/^#+\s+.*/, "")
      // 除去标题
      ?.replace(/#/g, "")
      // 除去图片
      ?.replace(/!\[.*?\]\(.*?\)/g, "")
      // 除去链接
      ?.replace(/\[(.*?)\]\(.*?\)/g, "$1")
      // 除去加粗
      ?.replace(/\*\*(.*?)\*\*/g, "$1")
      // 除去 [[TOC]]
      ?.replace(/\[\[TOC\]\]/g, "")
      // 去除 ::: 及其后面的内容
      ?.replace(/:::.*?(\n|$)/g, "")
      ?.replace(/<!-- more -->/g, "")
      ?.split("\n")
      ?.filter(v => !!v)
      ?.join("\n")
      ?.replace(/>(.*)/, "")
      ?.replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      ?.trim()
      ?.slice(0, count)
  );
};