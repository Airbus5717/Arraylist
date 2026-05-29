import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export { gsap, useGSAP }

export const visualEase = 'power2.out'
export const visualEaseInOut = 'power2.inOut'
export const visualDuration = 0.28

export function usePrefersReducedMotion() {
  const [reduceMotion, setReduceMotion] = useState(() =>
    typeof window === 'undefined' || !window.matchMedia ? false : window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (!window.matchMedia) return undefined

    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(query.matches)

    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return reduceMotion
}

export function useAmbientCycle(enabled: boolean, delayMs: number, step: () => void) {
  const stepRef = useRef(step)

  useEffect(() => {
    stepRef.current = step
  }, [step])

  useEffect(() => {
    if (!enabled) return undefined

    const id = window.setInterval(() => {
      stepRef.current()
    }, delayMs)

    return () => window.clearInterval(id)
  }, [delayMs, enabled])
}

export function useAmbientPause(reduceMotion: boolean) {
  const [paused, setPaused] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  function pauseAmbient(ms = 2400) {
    setPaused(true)

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
    }

    if (!reduceMotion) {
      timeoutRef.current = window.setTimeout(() => {
        setPaused(false)
        timeoutRef.current = null
      }, ms)
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    ambientEnabled: !reduceMotion && !paused,
    pauseAmbient,
  }
}
