# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-01
**Project:** vitepress-theme-base-teek (VitePress Theme)

## OVERVIEW

VitePress 博客主题库 + CLI脚手架工具。使用 pnpm workspace 管理三个包：
- `vitepress-theme-base-teek/` - 主题核心包
- `create-theme/` - CLI脚手架工具  
- `apps/` - 示例文档站点

## STRUCTURE

```
./
├── vitepress-theme-base-teek/   # 主题核心 (60+ TS文件)
│   ├── components/              # Vue组件
│   ├── hooks/                   # Composition API hooks
│   ├── utils/                   # 工具函数
│   ├── styles/                  # 样式文件
│   ├── markdown/                # Markdown插件
│   ├── layout/                  # 布局组件
│   ├── config/                  # 配置生成
│   ├── types/                   # 类型定义
│   └── helper/                  # 辅助函数
├── create-theme/                # CLI脚手架
│   └── public/template/         # 项目模板
├── apps/                        # 示例文档
│   └── docs/                    # VitePress配置
├── package.json                 # workspace根配置
└── tsconfig.json                # TypeScript配置
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| 主题入口 | `vitepress-theme-base-teek/index.ts` | 主题主入口 |
| 配置生成 | `vitepress-theme-base-teek/config/index.ts` | baseConfig() |
| 组件目录 | `vitepress-theme-base-teek/components/` | 登录、归档、目录等 |
| CLI入口 | `create-theme/src/index.ts` | 脚手架源码 |
| 文档配置 | `apps/docs/config.mts` | VitePress配置示例 |

## CODE CONVENTIONS

| Aspect | Rule |
|--------|------|
| TypeScript | `strict: false` |
| 模块解析 | bundler |
| 目标版本 | ESNext |
| 包管理器 | pnpm (workspace) |
| 构建工具 | tsup |

## ANTI-PATTERNS (THIS PROJECT)

- **无测试** - 项目缺少测试基础设施 (vitest/jest)
- **无ESLint** - 未配置代码检查
- **main入口指向.ts** - `"main": "./index.ts"` 应指向 `dist/`

## COMMANDS

```bash
pnpm config:dev      # 开发主题配置
pnpm config:build    # 构建主题
pnpm docs:dev        # 启动文档站点
pnpm docs:build      # 构建文档
```

## NOTES

- 主题包exports配置不一致: `"."` 指向源文件，`"./config"` 指向编译文件
- create-theme/dist 可能被提交到git (非标准)
- 无CI/CD配置
