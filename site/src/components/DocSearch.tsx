import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { docs, searchDocs, type SearchResult } from '../content/docRegistry'

export function DocSearch() {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const results: SearchResult[] = useMemo(() => searchDocs(query), [query])

  function close() {
    setQuery('')
    inputRef.current?.blur()
  }

  // Global "/" hotkey (command palette style) + Escape to close
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        close()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="doc-search">
      <input
        ref={inputRef}
        type="search"
        className="doc-search__input"
        placeholder="Search docs… (press /)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search documentation"
      />

      {results.length > 0 && query.length >= 2 && (
        <div className="doc-search__results" role="listbox">
          {results.map(({ doc, matches }) => (
            <Link
              key={doc.slug}
              to={`/docs/${doc.slug}`}
              className="doc-search__result"
              onClick={close}
            >
              <div className="doc-search__result-title">{doc.title}</div>
              <div className="doc-search__result-snippet">
                {matches[0]?.snippet}
              </div>
              <div className="doc-search__result-path">docs/{doc.slug}.md</div>
            </Link>
          ))}
          <div className="doc-search__hint">Showing matches in {docs.length} documents</div>
        </div>
      )}
    </div>
  )
}
