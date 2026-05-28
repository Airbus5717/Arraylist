import { useEffect, useState } from 'react'
import type { TocHeading } from '../utils/extractHeadings'

type DocTocProps = {
  headings: TocHeading[]
}

export function DocToc({ headings }: DocTocProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (headings.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    )

    for (const heading of headings) {
      const element = document.getElementById(heading.id)
      if (element) {
        observer.observe(element)
      }
    }

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  return (
    <nav className="doc-toc" aria-label="On this page">
      <p className="doc-toc__label">on this page</p>
      <ul className="doc-toc__list">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={heading.level === 3 ? 'doc-toc__item doc-toc__item--nested' : 'doc-toc__item'}
          >
            <a
              href={`#${heading.id}`}
              className={`doc-toc__link ${activeId === heading.id ? 'doc-toc__link--active' : ''}`}
              onClick={(event) => {
                event.preventDefault()
                document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' })
                history.replaceState(null, '', `#${heading.id}`)
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
