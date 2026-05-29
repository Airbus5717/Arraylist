import { useEffect, useId, useRef, useState } from 'react'
import { NavLink, useLocation, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import { CodeBlock } from '../components/CodeBlock'
import { DocToc } from '../components/DocToc'
import { MarkdownLink } from '../components/MarkdownLink'
import { LazyDocVisuals } from '../components/visuals/LazyDocVisuals'
import { docs, getDocBySlug, getDocContent, getDocNeighbors, isDocSlug, type DocSlug } from '../content/docRegistry'
import { usePageMeta } from '../hooks/usePageMeta'
import { extractHeadings } from '../utils/extractHeadings'
import { remarkDocLinks } from '../utils/remarkDocLinks'
import { scrollToHashWithRetry } from '../utils/scrollToHash'
import { stripLeadingH1 } from '../utils/stripLeadingH1'
import { NotFoundPage } from './NotFoundPage'

export function DocsPage() {
  const { slug: slugParam } = useParams()
  const { hash } = useLocation()
  const [navOpen, setNavOpen] = useState(false)
  const railPanelId = useId()
  const railToggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!navOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setNavOpen(false)
        railToggleRef.current?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [navOpen])

  const slug: DocSlug | null = slugParam && isDocSlug(slugParam) ? slugParam : null
  const currentDoc = slug ? getDocBySlug(slug) : null
  const markdown = slug ? getDocContent(slug) : null
  const bodyMarkdown = markdown ? stripLeadingH1(markdown) : null
  const neighbors = slug ? getDocNeighbors(slug) : { previous: null, next: null }
  const headings = bodyMarkdown ? extractHeadings(bodyMarkdown) : []

  usePageMeta(
    currentDoc
      ? {
          title: `${currentDoc.title} — Arraylist Docs`,
          description: currentDoc.description,
          path: `/docs/${currentDoc.slug}`,
        }
      : {
          title: 'Not found — Arraylist',
          description: 'That route does not exist in the Arraylist documentation index.',
        },
  )

  useEffect(() => {
    if (!hash || !bodyMarkdown) {
      return
    }

    return scrollToHashWithRetry(hash)
  }, [slug, hash, bodyMarkdown])

  if (!slug || !currentDoc) {
    return <NotFoundPage />
  }

  const { previous, next } = neighbors

  if (!markdown) {
    return (
      <article className="doc-page">
        <h1 className="doc-page__title">Missing content</h1>
        <p className="doc-page__lede">
          The source file for <code>{currentDoc.slug}.md</code> was not found in the synced docs set.
        </p>
      </article>
    )
  }

  return (
    <div className="doc-layout">
      <aside className="doc-rail">
        <button
          ref={railToggleRef}
          type="button"
          className="doc-rail__toggle lg:hidden"
          aria-expanded={navOpen}
          aria-controls={railPanelId}
          aria-label="Toggle documentation navigation"
          onClick={() => setNavOpen((open) => !open)}
        >
          <span aria-hidden="true">docs</span>
          <span aria-hidden="true">{navOpen ? '−' : '+'}</span>
        </button>

        <div
          id={railPanelId}
          className={navOpen ? 'doc-rail__panel doc-rail__panel--open' : 'doc-rail__panel'}
        >
          <p className="doc-rail__label hidden lg:block">docs/</p>
          <nav className="doc-rail__nav" aria-label="Documentation">
            {docs.map((doc) => (
              <NavLink
                key={doc.slug}
                to={`/docs/${doc.slug}`}
                className={({ isActive }) => `doc-rail__link ${isActive ? 'doc-rail__link--active' : ''}`}
                onClick={() => setNavOpen(false)}
              >
                {doc.slug}.md
              </NavLink>
            ))}
          </nav>

          {headings.length > 0 ? (
            <div className="doc-rail__toc hidden lg:block">
              <DocToc headings={headings} />
            </div>
          ) : null}
        </div>
      </aside>

      <article className="doc-page">
        <header className="doc-page__header">
          <p className="doc-page__path">docs/{currentDoc.slug}.md</p>
          <h1 className="doc-page__title">{currentDoc.title}</h1>
          <p className="doc-page__lede">{currentDoc.description}</p>
        </header>

        {/* Lazy-loaded contextual visuals — motion code only loads for pages that actually render them */}
        <LazyDocVisuals slug={slug} />

        {headings.length > 0 ? (
          <div className="doc-page__toc-mobile lg:hidden">
            <DocToc headings={headings} />
          </div>
        ) : null}

        <div className="doc-markdown">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkDocLinks]}
            rehypePlugins={[rehypeSlug, rehypeHighlight]}
            components={{
              a: MarkdownLink,
              pre({ children }) {
                return <CodeBlock>{children}</CodeBlock>
              },
            }}
          >
            {bodyMarkdown}
          </ReactMarkdown>
        </div>

        <nav className="doc-page__pager" aria-label="Documentation pagination">
          {previous ? (
            <NavLink className="doc-pager-link" to={`/docs/${previous.slug}`}>
              <span className="doc-pager-link__label">← previous</span>
              <span className="doc-pager-link__title">{previous.title}</span>
            </NavLink>
          ) : (
            <span />
          )}
          {next ? (
            <NavLink className="doc-pager-link doc-pager-link--next" to={`/docs/${next.slug}`}>
              <span className="doc-pager-link__label">next →</span>
              <span className="doc-pager-link__title">{next.title}</span>
            </NavLink>
          ) : null}
        </nav>
      </article>
    </div>
  )
}
