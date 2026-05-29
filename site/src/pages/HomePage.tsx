import { NavLink } from 'react-router-dom'
import { MemoryDiagram } from '../components/MemoryDiagram'
import { LazyHomeVisuals } from '../components/visuals/LazyHomeVisuals'
import { VisualGlossary } from '../components/VisualGlossary'
import { getDocsByGroup } from '../content/docRegistry'
import { usePageMeta } from '../hooks/usePageMeta'
import { ARRAY_H_URL, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '../siteConfig'

export function HomePage() {
  usePageMeta({
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    path: '/',
  })
  const docGroups = getDocsByGroup()

  return (
    <article className="index-page">
      <header className="index-hero">
        <div className="index-hero__copy">
          <h1 className="index-page__title">arraylist</h1>
          <p className="index-page__lede">
            Header-only dynamic array macros for C with checked APIs, explicit ownership, and strict-C portability.
          </p>
          <p className="index-page__hint">
            Drop in with <code>#include &quot;array.h&quot;</code>, declare types with{' '}
            <code>generate_array_type(T)</code>, and verify snippets with{' '}
            <code>tests/compile/run.sh</code>.
          </p>

          <p className="index-page__actions">
            <NavLink className="text-link" to="/docs/quickstart">
              Quickstart →
            </NavLink>
            {' / '}
            <NavLink className="text-link" to="/docs/api-reference">
              API reference →
            </NavLink>
            {' / '}
            <a className="text-link text-link--muted" href={ARRAY_H_URL} target="_blank" rel="noreferrer">
              View array.h →
            </a>
          </p>
        </div>

        <MemoryDiagram />
      </header>

      {/* Unified visual models section — lazy loaded so animation code only downloads when needed */}
      <section className="index-visual-prototypes" aria-label="Interactive visual models">
        <h2 className="index-visual-prototypes__title">Interactive models</h2>
        <p className="index-visual-prototypes__intro">
          Explore the exact memory layout, growth, access, and iteration rules described in the documentation.
          These components are the same ones embedded in the reference pages.
        </p>
        <LazyHomeVisuals />
      </section>

      <VisualGlossary />

      {docGroups.map((group) => (
        <section key={group.label} className="index-group">
          <h2 className="index-group__label">{group.label}</h2>
          <ul className="index-group__list">
            {group.docs.map((doc) => (
              <li key={doc.slug} className="index-group__item">
                <NavLink to={`/docs/${doc.slug}`} className="index-link">
                  <span className="index-link__title">{doc.title}</span>
                  <span className="index-link__desc">{doc.description}</span>
                  <span className="index-link__path">/{doc.slug}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  )
}
