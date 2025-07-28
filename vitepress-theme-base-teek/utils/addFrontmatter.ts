import { FileInfo } from "vitepress-plugin-setfrontmatter";
import { SiteConfig } from "vitepress";

/**
 * 创建 permalink 永久链接
 *
 * @param permalinkPrefix permalink 前缀
 */
export const createPermalink = (permalinkPrefix = "") => {
  let finalPermalinkPrefix = permalinkPrefix;
  if (!finalPermalinkPrefix.startsWith("/")) finalPermalinkPrefix = "/" + finalPermalinkPrefix;
  if(!finalPermalinkPrefix.endsWith("/")){finalPermalinkPrefix = finalPermalinkPrefix + "/"}

  return {
    permalink: `${finalPermalinkPrefix}${(Math.random() + Math.random()).toString(16).slice(2, 8)}`
  };
};

/**
 * 创建并返回一个包含常量信息的对象
 *
 * 此函数无需任何参数，它负责生成一个具有固定结构和值的对象
 * 主要用于提供配置信息，如作者信息和封面图片链接
 *
 * @returns 包含常量信息的对象，包括作者信息和封面图片链接
 */
export const createCoverImg = () => {
  return {
    // 封面图片链接，指向一个随机图片生成网址
    coverImg: "https://www.dmoe.cc/random.php",
  };
}

/**
 * 返回作者信息
 *
 * @returns 作者对象，包含名称和链接
 */
export const createAuthor = () => {
  return {
    author:{ name: "华总", link: "'https://xiaoying.org.cn'" }
  };
}


/**
 * 创建 categories 分类列表
 *
 * @param fileInfo 文件信息
 * @param ignore 需要忽略的文件名或目录名
 */
export const createCategory = (fileInfo: FileInfo, ignore: string[] = []) => {
  const siteConfig: SiteConfig = (globalThis as any).VITEPRESS_CONFIG;
  const { locales = {} } = siteConfig.userConfig;

  const relativePathArr = fileInfo.relativePath.split("/");

  const categories: string[] = [];
  relativePathArr.forEach((item, index) => {
    // 去除「序号.」的前缀，并获取文件名
    const filename = item.replace(/^\d+\./, "").split(".")?.[0] || "";

    // 兼容国际化功能，如果配置多语言，则不添加多语言根目录名
    if (index !== relativePathArr.length - 1 && !locales[filename] && !ignore.includes(filename))
      categories.push(filename);
  });

  // [""] 表示添加一个为空的 categories
 return { categories: categories.length ? categories : [""] };
};
