# vitepress-theme-base-teek

主题核心包目录。

## OVERVIEW

VitePress 博客主题核心库，包含组件、hooks、工具函数、Markdown插件等。

## STRUCTURE

```
vitepress-theme-base-teek/
├── components/       # Vue组件 (Login, Archives, Catalogue等)
├── hooks/           # Composition API hooks
├── utils/           # 工具函数
├── styles/          # 样式文件
├── markdown/        # Markdown插件
├── layout/          # 布局组件
├── config/          # 配置生成
├── types/           # 类型定义
├── post/            # 文章处理
└── helper/          # 辅助函数
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| 主题入口 | `./index.ts` |
| 配置生成 | `./config/index.ts` |
| Hooks | `./hooks/index.ts` |
| 组件注册 | `./components/common/index.ts` |

## CONVENTIONS

- TypeScript strict: false
- 使用 tsup 构建
- 组件使用 `defineComponent` / `<script setup>`
- 样式使用 SCSS 模块

## ANTI-PATTERNS

- **无单元测试** - 缺少测试覆盖
- **无类型检查** - strict: false 可能导致运行时错误
