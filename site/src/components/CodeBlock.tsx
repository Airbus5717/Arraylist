import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

type CodeBlockProps = {
  children: ReactNode
}

export function CodeBlock({ children }: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)
  const canCopy = typeof navigator !== 'undefined' && Boolean(navigator.clipboard)

  async function handleCopy() {
    const text = preRef.current?.textContent ?? ''

    if (!text || !navigator.clipboard) {
      return
    }

    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="code-block">
      {canCopy ? (
        <button type="button" className="code-copy-btn" onClick={handleCopy} aria-label="Copy code">
          {copied ? 'Copied' : 'Copy'}
        </button>
      ) : null}
      <pre ref={preRef}>{children}</pre>
    </div>
  )
}
