import fs from 'fs';
import matter from 'gray-matter';
import jsonToYaml from 'json2yaml';
import readFileList, { FileItem } from './readFileList';
import { type, repairDate } from './fn';

export async function editFrontmatter(key: string = 'coverImg'): Promise<void> {

    // 只在 VitePress 构建（SSR）时执行
    if (typeof window !== 'undefined') return; // 浏览器端不执行

    const files: FileItem[] = readFileList();

    for (const file of files) {
        const dataStr = fs.readFileSync(file.filePath, 'utf8');
        const fileMatterObj = matter(dataStr);
        const matterData: Record<string, any> = fileMatterObj.data;
        let mark = false;

        // 删除指定 key
        if (key in matterData) {
            delete matterData[key];
            mark = true;
        }
        
        if (mark) {
            if (matterData.date && type(matterData.date) === 'date') {
                matterData.date = repairDate(matterData.date);
            }

            const newData =
                jsonToYaml.stringify(matterData).replace(/\n\s{2}/g, '\n').replace(/"/g, '') +
                '---\r\n' +
                fileMatterObj.content;

            fs.writeFileSync(file.filePath, newData, 'utf8');
        }
    }
}