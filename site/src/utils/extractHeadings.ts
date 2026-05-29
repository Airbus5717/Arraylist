import GithubSlugger from 'github-slugger'

export type TocHeading = {
  id: string
  text: string
  level: 2 | 3
}

// Reduce inline markdown to the plain text content rehype-slug sees, so the
// IDs generated here match the anchors rendered on the page.
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/\*([^*]+)\*/g, '$1')
    .trim()
}

export function extractHeadings(markdown: string): TocHeading[] {
  const slugger = new GithubSlugger()
  const headings: TocHeading[] = []
  let fenceMarker: string | null = null

  for (const line of markdown.split('\n')) {
    const fence = line.match(/^\s*(```+|~~~+)/)
    if (fence) {
      if (fenceMarker === null) {
        fenceMarker = fence[1]
      } else if (line.trimStart().startsWith(fenceMarker)) {
        fenceMarker = null
      }
      continue
    }

    if (fenceMarker !== null) {
      continue
    }

    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (!match) {
      continue
    }

    const level = match[1].length as 2 | 3
    const text = stripInlineMarkdown(match[2].replace(/\s+#+\s*$/, '').trim())
    const id = slugger.slug(text)

    headings.push({ id, text, level })
  }

  return headings
}
