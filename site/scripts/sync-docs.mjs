import { copyFile, mkdir, readdir, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const requiredDocs = ['overview.md', 'quickstart.md', 'api-reference.md', 'examples.md']

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const siteRoot = path.resolve(scriptDir, '..')
const sourceDir = path.resolve(siteRoot, '..', 'docs')
const destinationDir = path.resolve(siteRoot, 'src', 'content', 'docs')

async function syncDocs() {
  await stat(sourceDir)
  await mkdir(destinationDir, { recursive: true })

  const sourceFiles = (await readdir(sourceDir)).filter((file) => file.endsWith('.md'))
  const missingFiles = requiredDocs.filter((file) => !sourceFiles.includes(file))

  if (missingFiles.length > 0) {
    throw new Error(
      `Missing required docs in ${sourceDir}: ${missingFiles.join(', ')}. Add the files before building the site.`,
    )
  }

  for (const existingFile of await readdir(destinationDir)) {
    if (existingFile.endsWith('.md')) {
      await rm(path.join(destinationDir, existingFile))
    }
  }

  for (const sourceFile of sourceFiles) {
    await copyFile(path.join(sourceDir, sourceFile), path.join(destinationDir, sourceFile))
  }

  console.log(`[docs:sync] Synced ${sourceFiles.length} markdown file(s) from docs/ to site/src/content/docs/.`)
}

syncDocs().catch((error) => {
  console.error('[docs:sync] Failed to sync docs:', error)
  process.exitCode = 1
})
