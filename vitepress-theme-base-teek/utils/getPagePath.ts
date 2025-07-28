import { useRoute } from 'vitepress'

/**
 * 获取当前页面路径
 * @returns {string} 当前页面的路径部分（例如：/pages/fe4521）
 */
export function getPagePath(): string {
  const route = useRoute()
  return route.path
}
