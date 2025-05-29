import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface SidebarItem {
    text: string
    link?: string
    items?: SidebarItem[]
    collapsed?: boolean
    activeMatch?: string 
}

export function itemsWithStyle(dir: string, rewrites: Record<string, string>, options: { collapsed: boolean } = { collapsed: true }, sidebarKey?: string): SidebarItem[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    let items: SidebarItem[] = []

    // 分离目录和文件
    const directories: fs.Dirent[] = []
    const files: fs.Dirent[] = []

    for (const entry of entries) {
        if (entry.isDirectory()) {
            directories.push(entry)
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
            files.push(entry)
        }
    }

    // 处理目录（按名称前的数字排序）
    directories.sort((a, b) => {
        // 提取数字前缀
        const numA = parseInt(a.name.match(/^\d+/)?.[0] || '999999', 10)
        const numB = parseInt(b.name.match(/^\d+/)?.[0] || '999999', 10)
        return numA - numB
    })

    for (const entry of directories) {
        let text = entry.name.replace(/^[\d]+\.?\s*/, '')
        const children = itemsWithStyle(path.join(dir, entry.name), rewrites, options, sidebarKey)
        if (children.length) {
            // collapsed: false 时不加 collapsed 字段，collapsed: true 时加 collapsed: true
            const item: SidebarItem = { text, items: children }
            if (options.collapsed) item.collapsed = true
            items.push(item)
        }
    }

    // 处理文件（按名称前的数字排序）
    files.sort((a, b) => {
        const numA = parseInt(a.name.match(/^\d+/)?.[0] || '999999', 10)
        const numB = parseInt(b.name.match(/^\d+/)?.[0] || '999999', 10)
        return numA - numB
    })

    for (const entry of files) {
        const filePath = path.join(dir, entry.name)
        const file = fs.readFileSync(filePath, 'utf-8')
        const { data } = matter(file)
        let text = data.title || entry.name.replace(/\.md$/, '')
        text = text.replace(/^\d+\.?\s*/, '')
        const rel = path.relative(path.resolve(__dirname, '../'), filePath).replace(/\\/g, '/').replace(/\.md$/, '')
        // link 与 md 文档的 permalink 保持一致
        let link = rewrites[rel + '.md'] || rewrites[rel] || '/' + rel
        // 确保 link 以 / 开头且无 .md 后缀
        link = link.replace(/\.md$/, '')
        if (!link.startsWith('/')) link = '/' + link
        // activeMatch 也用 link
        items.push({ text, link, activeMatch: link } as SidebarItem)
    }
    return items
}

// navLinks: [{ text, link }...], sidebarKey 与 nav.link 一致，内容为 articles 下的一级目录
export function genSidebarByNavPermalink(navLinks: { text: string, link: string }[], root: string, rewrites: Record<string, string>, options = { collapsed: true }): Record<string, SidebarItem[]> {
    const sidebar: Record<string, SidebarItem[]> = {}
    for (const nav of navLinks) {
        // sidebarKey 统一为 /pages/xxx，不带结尾 /
        const sidebarKey = nav.link.endsWith('/') ? nav.link.slice(0, -1) : nav.link
        // 处理 nav.link 和 rewrites value，去掉开头/结尾的 / 和 .md
        const navPermalink = nav.link.replace(/^\//, '').replace(/\/$/, '').replace(/\.md$/, '')
        const matchedKeys = Object.entries(rewrites)
            .filter(([, v]) => v.replace(/^\//, '').replace(/\.md$/, '') === navPermalink)
            .map(([k]) => k)
        if (matchedKeys.length) {
            // 取路径最长的 key
            const mdPath = matchedKeys.reduce((a, b) => a.length > b.length ? a : b)
            // 递归到 articles 下的一级目录
            let dirPath = path.dirname(mdPath)
            dirPath = dirPath.replace(/^articles[\\\/]/, '')
            const firstLevel = dirPath.split('/')[0]
            const absDir = path.join(root, firstLevel)
            if (fs.existsSync(absDir) && fs.statSync(absDir).isDirectory()) {
                // 1. 目录本身的 key（不再显示一级目录名，直接显示子目录）
                // sidebar[sidebarKey] = [ ... ] // 注释掉，不显示一级目录
                // 2. 该一级目录下所有子目录和 md 文件都加上 sidebar key
                function addSidebarKeyForAllMd(dir) {
                    const entries = fs.readdirSync(dir, { withFileTypes: true })
                    for (const entry of entries) {
                        const fullPath = path.join(dir, entry.name)
                        if (entry.isDirectory()) {
                            addSidebarKeyForAllMd(fullPath)
                        } else if (entry.isFile() && entry.name.endsWith('.md')) {
                            const rel = path.relative(path.resolve(__dirname, '../'), fullPath).replace(/\\/g, '/').replace(/\.md$/, '')
                            const permalink = rewrites[rel + '.md'] || rewrites[rel] || '/' + rel
                            // 兼容带 / 和不带 /
                            const key1 = permalink.replace(/\/$/, '')
                            const key2 = key1.endsWith('/') ? key1 : key1 + '/'
                            // 生成 sidebar 内容时直接用 items，不包一级目录
                            // 只保留子目录，且子目录 text 去掉前数字并加粗放大
                            const items = itemsWithStyle(absDir, rewrites, options)
                            sidebar[key1] = items
                            sidebar[key2] = items
                        }
                    }
                }
                addSidebarKeyForAllMd(absDir)
            }
        }
    }
    return sidebar
}

export type { SidebarItem }
