import path from 'node:path';
import process from 'process';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

// 兼容 __dirname（适用于 ESM 模块）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 解析命令行参数
const argvs = process.argv.slice(2);
const bolleanFlag = argvs.filter(item => item.startsWith('--'));
const stringFlag = argvs.filter(item => !item.startsWith('--'));

const projectName = stringFlag[stringFlag.length - 1] || 'my-blog';
const isBun = bolleanFlag.includes('--bun');

// 帮助信息
if (argvs.includes('--help') || argvs.includes('-h')) {
	console.log(`
Usage:
  create-base-teek-theme [project-name] [Options]

Options:
  --bun     Use bun instead of pnpm
  --help    Show this message
`);
	process.exit(0);
}

console.log('🚧 Creating vitepress-theme-base-teek project...');
console.log();

async function createThemeProject(destination: string) {
	const templatePath = path.join(__dirname, 'template');

	if (fs.existsSync(destination)) {
		console.log(`❌ The folder "${projectName}" already exists.`);
		console.log();
		return;
	}

	try {
		await fs.copy(templatePath, destination);

		// 复制配置文件
		await fs.copy(path.join(__dirname, 'move/gitignore'), path.join(destination, '.gitignore'));
		await fs.copy(path.join(__dirname, 'move/package'), path.join(destination, 'package.json'));

		const sourceRc = isBun ? 'bunfig.toml' : 'npmrc';
		const targetFile = isBun ? 'bunfig.toml' : '.npmrc';
		await fs.copy(path.join(__dirname, `move/${sourceRc}`), path.join(destination, targetFile));

		// Bun 的特殊处理
		if (isBun) {
			const pkgPath = path.join(destination, 'package.json');
			const pkg = await fs.readJSON(pkgPath);
			pkg.scripts.build = `NODE_ENV=production ${pkg.scripts.build}`;
			await fs.writeJSON(pkgPath, pkg, { spaces: 2 });
		}

		console.log('🎉 项目创建成功!');
		console.log(`📁 项目路径: ${destination}`);
		console.log();

		const command = isBun ? 'bun' : 'pnpm';
		console.log(`👉 下一步操作:

  ①  cd ${path.parse(destination).name}
  ②  ${command} install
  ③  ${command} run ${isBun ? '--bun ' : ''}dev
  ④  ${command} run ${isBun ? '--bun ' : ''}build
  ⑤  ${command} run ${isBun ? '--bun ' : ''}serve
`);
	} catch (err) {
		console.error('❌ 项目创建失败:', err);
	}
}

createThemeProject(path.join(process.cwd(), projectName));
