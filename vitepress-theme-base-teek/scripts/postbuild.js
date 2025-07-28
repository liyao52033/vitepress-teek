import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dtsPath = path.resolve(__dirname, '../dist/index.d.ts')
const appendContent = `
export { gitee, email, WhatsApp, telegram, github, bilibili, moblieQQ, music, arrow };
`

if (fs.existsSync(dtsPath)) {
    fs.appendFileSync(dtsPath, appendContent)
}
