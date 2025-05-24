import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const DOCS_ROOT = path.resolve(__dirname, '../')
const OUTPUT = path.resolve(__dirname, './rewrites.json')

function getAllMdFiles(dir: string, baseDir = dir): string[] {
    const files = fs.readdirSync(dir)
    let result: string[] = []
    for (const file of files) {
        const full = path.join(dir, file)
        const rel = path.relative(baseDir, full)
        if (fs.statSync(full).isDirectory()) {
            result = result.concat(getAllMdFiles(full, baseDir))
        } else if (file.endsWith('.md')) {
            result.push(rel.replace(/\\/g, '/'))
        }
    }
    return result
}

export function genRewritesPlugin() {
    return {
        name: 'gen-rewrites-plugin',
        async configureServer() {
            // dev 模式下，每次启动/热更新都生成 rewrites.json
            const mdFiles = getAllMdFiles(DOCS_ROOT)
            const rewrites: Record<string, string> = {}
            for (const relPath of mdFiles) {
                const absPath = path.join(DOCS_ROOT, relPath)
                const src = fs.readFileSync(absPath, 'utf-8')
                const fm = matter(src).data
                if (typeof fm.permalink === 'string' && fm.permalink.trim()) {
                    let val = fm.permalink.trim()
                    if (val.startsWith('/')) val = val.slice(1)
                    if (val.endsWith('/')) val = val.slice(0, -1)
                    val = val + '.md'
                    rewrites[relPath] = val
                }
            }
            fs.writeFileSync(OUTPUT, JSON.stringify({ rewrites }, null, 4), 'utf-8')
            console.log('rewrites.json generated (dev mode).')
        },
    }
}