# Copilot Instructions for VitePress Component Documentation Site

## Project Overview
This is a VitePress-based documentation site for Vue.js components, hooks, and backend utilities. It uses a custom theme (`vitepress-theme-base-teek`) with extended functionality for search, AI summaries, and component auto-registration.

## Architecture
- **Core Framework**: VitePress 1.x with Vue 3
- **Theme**: Extends `vitepress-theme-base-teek` with custom components and slots
- **Content Structure**: Articles in `articles/` are rewritten to SEO-friendly permalinks in `pages/` via `docs/rewrites.json`
- **UI Library**: Element Plus for components
- **Search**: Dual support for Algolia DocSearch and Meilisearch

## Key Directories
- `docs/.vitepress/theme/components/`: Custom Vue components (e.g., `AlgoliaSearch.vue`, `Coze/AiSummary.vue`)
- `articles/`: Source markdown content organized by category (components, tools, backend)
- `docs/@pages/`: Special pages like About, archives, categories
- `public/`: Static assets with organized subdirectories

## Development Workflow
- **Install**: `pnpm ins` (installs with peer deps fix and dedupes)
- **Dev Server**: `pnpm run docs:dev`
- **Build**: `pnpm run docs:build`
- **Preview**: `pnpm run docs:preview`
- **Deploy**: `pnpm run deploy` (builds and deploys to EdgeOne Pages as "vitepress-teek")

## Component Patterns
- **Auto-Registration**: Components in `theme/components/` are auto-registered via `utils/autoRegisterComponents.ts`
- **Layout Slots**: Custom slots like `liyao-layout-bottom`, `liyao-doc-before` extend the base theme
- **Theme Extension**: Use `extends: Theme` in `theme/index.ts` to inherit base functionality

## Content Management
- **Frontmatter Auto-Generation**: Plugin adds default author info if missing (see `config.mts` `autoFrontmatterOption`)
- **Sidebar Generation**: Uses `vitepress-plugin-sidebar-permalink` with rewrites from `rewrites.json`
- **Permalink Rewrites**: Articles map to hashed URLs (e.g., `articles/05.组件/...` → `pages/fe4521.md`)

## Integration Points
- **Search APIs**: Algolia and Meilisearch configured in components
- **AI Features**: Coze integration for article summaries
- **External Scripts**: Icon fonts loaded via CDN in `config.mts` head
- **Environment**: Uses `dotenv` for configuration

## Conventions
- **File Naming**: Articles use numbered prefixes (e.g., `01.组件安装.md`) for ordering
- **Language**: Primarily Chinese (zh-CN) content
- **Build Limits**: Chunk size warning limit set to 2000kb in Vite config
- **Meta Tags**: Includes Algolia verification and no-translate for Google

## Example Patterns
- Adding a new component: Place in `theme/components/`, it auto-registers
- New article: Add to `articles/` with frontmatter, rewrite in `rewrites.json`
- Custom layout: Use slot names like `liyao-doc-footer-before` in `theme/index.ts`