import { computed } from 'vue'
import { useUnrefData } from '../components/configProvider'
import { ArticleTip } from "../config/types";


export const useArticleTips = () => {
  const { frontmatter, localeIndex, page, theme } = useUnrefData()

  const { articleTopTip, articleBottomTip }: ArticleTip = { ...theme.articleTip , ...frontmatter.articleTip }

  const topTipConfig = computed(() => {
    return articleTopTip?.(frontmatter, localeIndex, page)
  })
  
  const bottomTipConfig = computed(() => {
    return articleBottomTip?.(frontmatter, localeIndex, page)
  })

  return {
    topTipConfig,
    bottomTipConfig
  }
}