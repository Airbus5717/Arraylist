import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { GITHUB_URL } from '../siteConfig'

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const docsActive = pathname.startsWith('/docs')

  return (
    <header className="site-nav">
      <div className="site-nav__inner">
        <button
          type="button"
          className="site-nav__menu-toggle lg:hidden"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="site-nav__prompt">&gt;</span> menu
        </button>

        <nav className={`site-nav__commands ${menuOpen ? 'site-nav__commands--open' : ''}`} aria-label="Site">
          <span className="site-nav__prompt site-nav__prompt--desktop hidden lg:inline">&gt;</span>
          <span className="site-nav__cmd hidden lg:inline">arraylist</span>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `site-nav__flag ${isActive ? 'site-nav__flag--active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            --home
          </NavLink>
          <NavLink
            to="/docs/overview"
            className={() => `site-nav__flag ${docsActive ? 'site-nav__flag--active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            --docs
          </NavLink>
          <a
            className="site-nav__flag"
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => setMenuOpen(false)}
          >
            --github
          </a>
          <span className="site-nav__cursor hidden lg:inline" aria-hidden="true">
            ▮
          </span>
        </nav>
      </div>
    </header>
  )
}
