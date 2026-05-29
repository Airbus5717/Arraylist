function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function scrollToHashElement(hash: string): boolean {
  const id = hash.replace(/^#/, '')
  if (!id) {
    return false
  }

  const element = document.getElementById(id)
  if (!element) {
    return false
  }

  element.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'start',
  })
  return true
}

export function scrollToHashWithRetry(hash: string, maxAttempts = 24): () => void {
  let attempts = 0
  let frameId = 0

  const tick = () => {
    if (scrollToHashElement(hash)) {
      return
    }

    if (attempts >= maxAttempts) {
      return
    }

    attempts += 1
    frameId = requestAnimationFrame(tick)
  }

  frameId = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(frameId)
  }
}
