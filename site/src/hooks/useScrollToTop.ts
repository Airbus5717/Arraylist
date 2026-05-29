import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { scrollToHashWithRetry } from '../utils/scrollToHash'

export function useScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      return scrollToHashWithRetry(hash)
    }

    window.scrollTo(0, 0)
  }, [pathname, hash])
}
