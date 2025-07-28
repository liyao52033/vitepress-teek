import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],      // 入口文件
	outDir: 'dist',               // 输出目录
	target: "ES2020",
	format: ['esm'],              // 保留为 ESM 模块（重要）
	splitting: false,             // 禁用代码拆分
	clean: true,                  // 每次构建前清空输出目录
	sourcemap: false,             // 不生成 sourcemap
	dts: false,                   // 不生成 .d.ts
	banner: {
		js: '#!/usr/bin/env node',  // 添加 CLI shebang 头
	},
	shims: false,                 // 不注入 Node.js polyfill
	minify: false,                // CLI 工具不建议压缩
});
