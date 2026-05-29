const docDefinitions = [
  {
    slug: 'overview',
    title: 'Overview',
    description: 'Ownership, layout, growth behavior, and complexity.',
    group: 'Getting started',
  },
  {
    slug: 'quickstart',
    title: 'Quickstart',
    description: 'Safe, compile-ready setup with core failure-handling patterns.',
    group: 'Getting started',
  },
  {
    slug: 'api-reference',
    title: 'API Reference',
    description: 'Contracts for preconditions, failure behavior, and complexity.',
    group: 'Reference',
  },
  {
    slug: 'examples',
    title: 'Examples',
    description: 'Scenario snippets for safe and predictable usage.',
    group: 'Examples',
  },
] as const

export const docs = docDefinitions
export type DocSlug = (typeof docs)[number]['slug']
export type DocDefinition = (typeof docs)[number]

const markdownModules = import.meta.glob('./docs/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const markdownBySlug = Object.entries(markdownModules).reduce<Record<string, string>>((acc, [path, markdown]) => {
  const filename = path.split('/').pop()

  if (!filename) {
    return acc
  }

  const slug = filename.replace(/\.md$/, '')
  acc[slug] = markdown
  return acc
}, {})

export function isDocSlug(value: string): value is DocSlug {
  return docs.some((doc) => doc.slug === value)
}
export function getDocBySlug(slug: DocSlug): DocDefinition {
  const doc = docs.find((item) => item.slug === slug)

  if (!doc) {
    throw new Error(`Unknown documentation slug: ${slug}`)
  }

  return doc
}

export function getDocContent(slug: DocSlug): string | null {
  return markdownBySlug[slug] ?? null
}

export function getDocNeighbors(slug: DocSlug): { previous: DocDefinition | null; next: DocDefinition | null } {
  const index = docs.findIndex((doc) => doc.slug === slug)

  if (index < 0) {
    return { previous: null, next: null }
  }

  const previous = index > 0 ? docs[index - 1] : null
  const next = index < docs.length - 1 ? docs[index + 1] : null
  return { previous, next }
}

export function getDocsByGroup(): { label: string; docs: DocDefinition[] }[] {
  const groups = new Map<string, DocDefinition[]>()

  for (const doc of docs) {
    const existing = groups.get(doc.group) ?? []
    existing.push(doc)
    groups.set(doc.group, existing)
  }

  return Array.from(groups.entries()).map(([label, groupDocs]) => ({
    label,
    docs: groupDocs,
  }))
}

export type SearchResult = {
  doc: DocDefinition
  matches: Array<{ field: 'title' | 'description' | 'body'; snippet: string }>
}

export function searchDocs(query: string): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q || q.length < 2) return []

  const results: SearchResult[] = []

  for (const doc of docs) {
    const md = markdownBySlug[doc.slug] ?? ''
    const matches: SearchResult['matches'] = []

    if (doc.title.toLowerCase().includes(q)) {
      matches.push({ field: 'title', snippet: doc.title })
    }
    if (doc.description.toLowerCase().includes(q)) {
      matches.push({ field: 'description', snippet: doc.description })
    }

    // Simple body snippet (first match context)
    const bodyLower = md.toLowerCase()
    const idx = bodyLower.indexOf(q)
    if (idx !== -1) {
      const start = Math.max(0, idx - 40)
      const end = Math.min(md.length, idx + q.length + 60)
      let snippet = md.slice(start, end).replace(/\n/g, ' ').trim()
      if (start > 0) snippet = '…' + snippet
      if (end < md.length) snippet = snippet + '…'
      matches.push({ field: 'body', snippet })
    }

    if (matches.length > 0) {
      results.push({ doc, matches })
    }
  }

  return results
}
