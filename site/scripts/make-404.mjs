import { copyFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const siteRoot = path.resolve(scriptDir, '..')
const distDir = path.join(siteRoot, 'dist')

async function make404() {
  await copyFile(path.join(distDir, 'index.html'), path.join(distDir, '404.html'))
  console.log('[make-404] Copied dist/index.html to dist/404.html for SPA fallback.')
}

make404().catch((error) => {
  console.error('[make-404] Failed to create 404 fallback:', error)
  process.exitCode = 1
})
