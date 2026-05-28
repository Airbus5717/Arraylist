import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

type CodeBlockProps = {
  children: ReactNode
}

export function CodeBlock({ children }: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<number | null>(null)
  const canCopy = typeof navigator !== 'undefined' && Boolean(navigator.clipboard)

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  async function handleCopy() {
    const text = preRef.current?.textContent ?? ''

    if (!text || !navigator.clipboard) {
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
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
