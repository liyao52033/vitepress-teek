import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import 'vitepress-plugin-sidebar-permalink/index.css'


export default {
    extends: DefaultTheme,
    enhanceApp({ router }) {
        
    }
} satisfies Theme