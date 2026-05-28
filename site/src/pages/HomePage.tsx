import { NavLink } from 'react-router-dom'
import { getDocsByGroup } from '../content/docRegistry'
import { usePageTitle } from '../hooks/usePageTitle'
import { ARRAY_H_URL, SITE_NAME, SITE_TAGLINE } from '../siteConfig'

export function HomePage() {
  usePageTitle(`${SITE_NAME} — ${SITE_TAGLINE}`)
  const docGroups = getDocsByGroup()

  return (
    <article className="index-page">
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
        {' · '}
        <NavLink className="text-link" to="/docs/api-reference">
          API reference →
        </NavLink>
        {' · '}
        <a className="text-link text-link--muted" href={ARRAY_H_URL} target="_blank" rel="noreferrer">
          View array.h →
        </a>
      </p>

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
