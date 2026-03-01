const docDefinitions = [
  {
    slug: 'overview',
    title: 'Overview',
    description: 'Ownership, layout, growth behavior, and complexity.',
  },
  {
    slug: 'quickstart',
    title: 'Quickstart',
    description: 'Safe, compile-ready setup with core failure-handling patterns.',
  },
  {
    slug: 'api-reference',
    title: 'API Reference',
    description: 'Contracts for preconditions, failure behavior, and complexity.',
  },
  {
    slug: 'examples',
    title: 'Examples',
    description: 'Scenario snippets for safe and predictable usage.',
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
