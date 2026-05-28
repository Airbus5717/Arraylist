import type { ReactNode } from 'react'
import { useScrollToTop } from '../hooks/useScrollToTop'
import { SiteFooter } from './SiteFooter'
import { SiteNav } from './SiteNav'

type SiteLayoutProps = {
  children: ReactNode
}

export function SiteLayout({ children }: SiteLayoutProps) {
  useScrollToTop()

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteNav />
      <main id="main-content" className="site-main">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
