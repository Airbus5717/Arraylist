import GithubSlugger from 'github-slugger'

export type TocHeading = {
  id: string
  text: string
  level: 2 | 3
}

export function extractHeadings(markdown: string): TocHeading[] {
  const slugger = new GithubSlugger()
  const headings: TocHeading[] = []

  for (const line of markdown.split('\n')) {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (!match) {
      continue
    }

    const level = match[1].length as 2 | 3
    const text = match[2].replace(/\s+#+\s*$/, '').trim()
    const id = slugger.slug(text)

    headings.push({ id, text, level })
  }

  return headings
}
