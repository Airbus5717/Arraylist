import { isDocSlug } from '../content/docRegistry'

export function resolveDocHref(href: string | undefined): string | null {
  if (!href) {
    return null
  }

  const markdownMatch = href.match(/^(?:\.\/)?([^/#?]+\.md)(?:[#?].*)?$/)
  if (markdownMatch) {
    const slug = markdownMatch[1].replace(/\.md$/, '')
    if (isDocSlug(slug)) {
      return `/docs/${slug}`
    }
  }

  const docsMatch = href.match(/^\/docs\/([^/#?]+)(?:[#?].*)?$/)
  if (docsMatch && isDocSlug(docsMatch[1])) {
    return `/docs/${docsMatch[1]}`
  }

  return null
}
