import fs from 'fs-extra';
import path from 'path';

const targetPaths = [
    path.join(process.cwd(), 'dist', 'template', 'node_modules'),
    path.join(process.cwd(), 'dist', 'template', 'dist'),
];

async function cleanPaths() {
    try {
        let cleanedAny = false;
        for (const p of targetPaths) {
            if (await fs.pathExists(p)) {
                await fs.remove(p);
                console.log(`🧹 已删除 ${p}`);
                cleanedAny = true;
            }
        }
        if (!cleanedAny) {
            console.log('ℹ️ 未找到需要清理的路径，无需操作');
        }
    } catch (error) {
        console.error('❌ 清理失败:', error);
        process.exit(1);
    }
}

cleanPaths();
