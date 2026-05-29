import { useEffect } from 'react'
import { SITE_URL } from '../siteConfig'

export type PageMeta = {
  title: string
  description: string
  path?: string
}

type MetaSnapshot = {
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  ogUrl: string
}

function readMetaContent(selector: string): string {
  return document.querySelector<HTMLMetaElement>(selector)?.content ?? ''
}

function setMetaContent(selector: string, content: string) {
  const element = document.querySelector<HTMLMetaElement>(selector)
  if (element) {
    element.content = content
  }
}

function snapshotMeta(): MetaSnapshot {
  return {
    title: document.title,
    description: readMetaContent('meta[name="description"]'),
    ogTitle: readMetaContent('meta[property="og:title"]'),
    ogDescription: readMetaContent('meta[property="og:description"]'),
    ogUrl: readMetaContent('meta[property="og:url"]'),
  }
}

function applyMeta({ title, description, path }: PageMeta) {
  document.title = title
  setMetaContent('meta[name="description"]', description)
  setMetaContent('meta[property="og:title"]', title)
  setMetaContent('meta[property="og:description"]', description)

  const url = path ? new URL(path, SITE_URL).href : SITE_URL
  setMetaContent('meta[property="og:url"]', url)
}

export function usePageMeta(meta: PageMeta) {
  const { title, description, path } = meta

  useEffect(() => {
    const previous = snapshotMeta()
    applyMeta({ title, description, path })

    return () => {
      document.title = previous.title
      setMetaContent('meta[name="description"]', previous.description)
      setMetaContent('meta[property="og:title"]', previous.ogTitle)
      setMetaContent('meta[property="og:description"]', previous.ogDescription)
      setMetaContent('meta[property="og:url"]', previous.ogUrl)
    }
  }, [title, description, path])
}
