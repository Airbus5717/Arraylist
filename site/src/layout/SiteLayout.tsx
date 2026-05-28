import type { ReactNode } from 'react'
import { SiteFooter } from './SiteFooter'
import { SiteNav } from './SiteNav'

type SiteLayoutProps = {
  children: ReactNode
}

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="site-shell">
      <SiteNav />
      <main className="site-main">{children}</main>
      <SiteFooter />
    </div>
  )
}
