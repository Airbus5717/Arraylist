import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { resolveDocHref } from '../utils/resolveDocHref'

type MarkdownLinkProps = {
  href?: string
  children?: ReactNode
}

export function MarkdownLink({ href, children }: MarkdownLinkProps) {
  const docHref = resolveDocHref(href)

  if (docHref) {
    return <Link to={docHref}>{children}</Link>
  }

  const isExternal = href?.startsWith('http')

  return (
    <a href={href} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noreferrer' : undefined}>
      {children}
    </a>
  )
}
