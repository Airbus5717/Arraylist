import { NavLink } from 'react-router-dom'
import { docs } from '../content/docRegistry'

const docGroups = [
  {
    label: 'Getting started',
    slugs: ['overview', 'quickstart'] as const,
  },
  {
    label: 'Reference',
    slugs: ['api-reference'] as const,
  },
  {
    label: 'Examples',
    slugs: ['examples'] as const,
  },
]

export function HomePage() {
  return (
    <article className="index-page">
      <p className="index-page__lede">
        Header-only dynamic array macros for C with checked APIs, explicit ownership, and strict-C portability.
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
        <a
          className="text-link text-link--muted"
          href="https://github.com/Airbus5717/Arraylist/blob/main/array.h"
          target="_blank"
          rel="noreferrer"
        >
          View array.h →
        </a>
      </p>

      {docGroups.map((group) => (
        <section key={group.label} className="index-group">
          <h2 className="index-group__label">{group.label}</h2>
          <ul className="index-group__list">
            {group.slugs.map((slug) => {
              const doc = docs.find((item) => item.slug === slug)
              if (!doc) {
                return null
              }

              return (
                <li key={doc.slug} className="index-group__item">
                  <NavLink to={`/docs/${doc.slug}`} className="index-link">
                    <span className="index-link__title">{doc.title}</span>
                    <span className="index-link__desc">{doc.description}</span>
                    <span className="index-link__path">/{doc.slug}</span>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </article>
  )
}
