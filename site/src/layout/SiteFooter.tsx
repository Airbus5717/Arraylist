import { GITHUB_REPO, GITHUB_URL } from '../siteConfig'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="site-footer__colophon">
        Arraylist · header-only dynamic array macros for C · checked APIs · explicit ownership · strict-C
        portability · docs synced from <code>docs/</code> · source{' '}
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">
          github.com/{GITHUB_REPO}
        </a>
      </p>
    </footer>
  )
}
