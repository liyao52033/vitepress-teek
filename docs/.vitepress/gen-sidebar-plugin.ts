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

interface RewritesJson {
    rewrites: Record<string, string>
}

function getPermalink(filePath: string, rewrites: Record<string, string>): string {
    const rel = path.relative(path.resolve(__dirname, '../'), filePath).replace(/\\/g, '/').replace(/\.md$/, '')
    // 优先使用rewrites中的permalink（去掉 .md 后缀）
    return (rewrites[rel + '.md'] || rewrites[rel] || '/' + rel)
}

// 生成所有 rewrites 的 sidebar key，全部指向对应一级目录的 sidebar
export function genFullSidebar(rewrites, root, navLinks, options = { collapsed: true }) {
    const sidebar = {}
    const dirSidebarCache = {}
    for (const nav of navLinks) {
        let navPermalink = nav.link.replace(/^\//, '').replace(/\/$/, '').replace(/\.md$/, '')
        const matchedKeys = Object.entries(rewrites)
            .filter(([, v]) => typeof v === 'string' && v.replace(/^\//, '').replace(/\.md$/, '') === navPermalink)
            .map(([k]) => k)
        if (matchedKeys.length) {
            const mdPath = matchedKeys.reduce((a, b) => a.length > b.length ? a : b)
            let dirPath = path.dirname(mdPath)
            dirPath = dirPath.replace(/^articles[\\\/]/, '')
            const firstLevel = dirPath.split('/')[0]
            const absDir = path.join(root, firstLevel)
            if (fs.existsSync(absDir) && fs.statSync(absDir).isDirectory()) {
                // 传递 nav.link 作为 sidebarKey
                dirSidebarCache[firstLevel] = itemsWithStyle(absDir, rewrites, options, nav.link)
            }
        }
    }
    // 为 rewrites 的每个 permalink 生成 sidebar key，指向对应一级目录 sidebar
    for (const [mdPath, permalink] of Object.entries(rewrites)) {
        const cleanPermalink = (typeof permalink === 'string' ? (permalink.startsWith('/') ? permalink : '/' + permalink) : '')
            .replace(/\.md$/, '')
        const firstLevel = mdPath.replace(/^articles[\\\/]/, '').split('/')[0]
        if (dirSidebarCache[firstLevel]) {
            sidebar[cleanPermalink] = dirSidebarCache[firstLevel]
            sidebar[cleanPermalink + '/'] = dirSidebarCache[firstLevel]
        }
    }
    return sidebar
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

export function genSidebarMap(navLinks: { text: string, link: string }[], root: string, rewrites: Record<string, string>): Record<string, SidebarItem[]> {
    const sidebar: Record<string, SidebarItem[]> = {}
    for (const nav of navLinks) {
        // 直接用 nav.link 作为 key
        const sidebarKey = nav.link.endsWith('/') ? nav.link : nav.link + '/'
        // 通过 rewrites 反查出 articles 下的一级目录名
        const mdEntry = Object.entries(rewrites).find(([, v]) => {
            const cleanPermalink = v.replace(/\/+$/, '').replace(/\.md$/, '')
            const cleanNav = nav.link.replace(/\/+$/, '').replace(/\.md$/, '')
            return cleanPermalink === cleanNav
        })
        if (mdEntry) {
            const mdPath = mdEntry[0]
            const match = mdPath.match(/^([^/]+)\//)
            if (match) {
                const dirName = match[1]
                const absDir = path.join(root, dirName)
                if (fs.existsSync(absDir) && fs.statSync(absDir).isDirectory()) {
                    sidebar[sidebarKey] = [
                        {
                            text: nav.text,
                            items: itemsWithStyle(absDir, rewrites)
                        }
                    ]
                }
            }
        } else {
            // fallback: 如果没找到，直接扫描 root
            sidebar[sidebarKey] = [
                {
                    text: nav.text,
                    items: itemsWithStyle(root, rewrites)
                }
            ]
        }
    }
    return sidebar
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
        // debug
        console.log('navPermalink:', navPermalink, 'matchedKeys:', matchedKeys)
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

export function genSidebarPlugin(options: { root: string; rewrites: RewritesJson; navLinks: { text: string, link: string }[]; collapsed?: boolean }) {
    const sidebarOptions = { collapsed: options.collapsed !== undefined ? options.collapsed : true }

    return {
        name: 'gen-sidebar-plugin',
        configResolved(resolvedConfig: any) {
            // resolvedConfig.themeConfig 是最终的 themeConfig
            const sidebar = genSidebarByNavPermalink(options.navLinks, options.root, options.rewrites.rewrites, sidebarOptions)
            resolvedConfig.themeConfig.sidebar = sidebar
        },
        config(userConfig: any, { command }: any) {
            if (command === 'build' || command === 'serve') {
                // 这里返回的 themeConfig 只是合并建议，实际生效要靠 configResolved
                const sidebar = genSidebarByNavPermalink(options.navLinks, options.root, options.rewrites.rewrites, sidebarOptions)
                return {
                    ...userConfig,
                    themeConfig: {
                        ...userConfig.themeConfig,
                        sidebar
                    }
                }
            }
        }
    }
}

export type { SidebarItem }
