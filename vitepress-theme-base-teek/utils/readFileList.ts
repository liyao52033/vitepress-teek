import fs from 'fs';
import path from 'path';

export interface FileItem {
    name: string | null;
    filePath: string;
}

// docs 根目录路径
let docsRoot = '';
if (typeof window === 'undefined'){
    docsRoot = path.join(process.cwd(), 'docs')
}

/**
 * 递归读取指定目录下的所有 md 文件
 * @param dir 要读取的目录，默认为 docsRoot
 * @param filesList 用于递归收集文件的数组
 * @returns 返回 md 文件列表
 */
export default function readFileList(dir: string = docsRoot, filesList: FileItem[] = []): FileItem[] {

    // 只在 VitePress 构建（SSR）时执行
    if (typeof window !== 'undefined') return []; // 浏览器端不执行

    const files = fs.readdirSync(dir);

    files.forEach(item => {
        const filePath = path.join(dir, item);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && item !== '.vitepress') {
            // 递归读取目录
            readFileList(filePath, filesList);
        } else {
            // 过滤 docs 目录根下的文件
            if (path.basename(dir) !== 'docs') {
                const filename = path.basename(filePath);
                const fileNameArr = filename.split('.');
                const firstDotIndex = filename.indexOf('.');
                const lastDotIndex = filename.lastIndexOf('.');

                let name: string | null = null;
                let type: string | null = null;

                if (fileNameArr.length === 2) {
                    // 文件名中没有额外的点
                    name = fileNameArr[0];
                    type = fileNameArr[1];
                } else if (fileNameArr.length >= 3) {
                    // 文件名中有序号或中间有点
                    name = filename.substring(firstDotIndex + 1, lastDotIndex);
                    type = filename.substring(lastDotIndex + 1);
                }

                // 只收集 md 文件
                if (type === 'md') {
                    filesList.push({ name, filePath });
                }
            }
        }
    });

    return filesList;
}