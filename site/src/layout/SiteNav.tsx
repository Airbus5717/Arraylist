import { useEffect, useId, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { GITHUB_URL } from '../siteConfig'
import { useTheme } from '../hooks/useTheme'
import { DocSearch } from '../components/DocSearch'

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuPanelId = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const { pathname } = useLocation()
  const docsActive = pathname.startsWith('/docs')
  const { theme, toggle } = useTheme()

  useEffect(() => {
    if (!menuOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <header className="site-nav">
      <div className="site-nav__inner">
        <NavLink to="/" end className="site-nav__brand" onClick={() => setMenuOpen(false)}>
          arraylist
        </NavLink>

        <button
          ref={toggleRef}
          type="button"
          className="site-nav__menu-toggle lg:hidden"
          aria-expanded={menuOpen}
          aria-controls={menuPanelId}
          aria-label="Toggle site menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          menu
        </button>

        <nav
          id={menuPanelId}
          className={`site-nav__commands ${menuOpen ? 'site-nav__commands--open' : ''}`}
          aria-label="Site"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) => `site-nav__flag ${isActive ? 'site-nav__flag--active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            home
          </NavLink>
          <NavLink
            to="/docs/overview"
            className={() => `site-nav__flag ${docsActive ? 'site-nav__flag--active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            docs
          </NavLink>
          <NavLink
            to="/playground"
            className={({ isActive }) => `site-nav__flag ${isActive ? 'site-nav__flag--active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            playground
          </NavLink>
          <a
            className="site-nav__flag"
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => setMenuOpen(false)}
          >
            github
          </a>

          <DocSearch />

          <button
            type="button"
            className="site-nav__flag site-nav__theme-toggle"
            onClick={toggle}
            aria-label={`Switch theme (current: ${theme})`}
            title={`Theme: ${theme}`}
          >
            {theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'}
          </button>
        </nav>
      </div>
    </header>
  )
}
