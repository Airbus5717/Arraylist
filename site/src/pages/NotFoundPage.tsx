import { NavLink } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

export function NotFoundPage() {
  usePageTitle('Not found — Arraylist')

  return (
    <article className="doc-page">
      <h1 className="doc-page__title">404 — not found</h1>
      <p className="doc-page__lede">
        That route does not exist in the Arraylist documentation index.
      </p>
      <p className="index-page__actions">
        <NavLink className="text-link" to="/docs/overview">
          Open docs →
        </NavLink>
        {' · '}
        <NavLink className="text-link text-link--muted" to="/">
          Return home →
        </NavLink>
      </p>
    </article>
  )
}
