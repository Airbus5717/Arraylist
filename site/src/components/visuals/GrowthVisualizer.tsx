import { useRef, useState } from 'react'
import { gsap, useAmbientCycle, useAmbientPause, useGSAP, usePrefersReducedMotion, visualDuration, visualEase } from './animation'

type GrowthStep = {
  count: number
  capacity: number
  note: string
}

const INITIAL: GrowthStep = { count: 0, capacity: 0, note: 'array_make(int, 0) — zero capacity' }

export function GrowthVisualizer() {
  const rootRef = useRef<HTMLElement>(null)
  const [steps, setSteps] = useState<GrowthStep[]>([INITIAL])
  const reduceMotion = usePrefersReducedMotion()
  const { ambientEnabled, pauseAmbient } = useAmbientPause(reduceMotion)
  const current = steps[steps.length - 1]

  function pushStep() {
    setSteps((prev) => {
      const last = prev[prev.length - 1]
      const nextCount = last.count >= 8 ? 1 : last.count + 1
      const baseline = last.count >= 8 ? INITIAL : last

      let nextCapacity = baseline.capacity
      let note = `array_try_push → count=${nextCount}`

      if (nextCount > baseline.capacity) {
        if (baseline.capacity === 0) {
          nextCapacity = 1
        } else {
          let c = baseline.capacity
          while (c < nextCount) {
            c *= 2
          }
          nextCapacity = c
        }
        note = `growth: capacity ${baseline.capacity} → ${nextCapacity} (geometric)`
      }

      const nextStep: GrowthStep = { count: nextCount, capacity: nextCapacity, note }
      return baseline === INITIAL ? [INITIAL, nextStep] : [...prev, nextStep].slice(-6)
    })
  }

  function simulatePush() {
    pauseAmbient()
    pushStep()
  }

  function reset() {
    pauseAmbient()
    setSteps([INITIAL])
  }

  useAmbientCycle(ambientEnabled, 1450, pushStep)

  useGSAP(
    () => {
      if (reduceMotion) return undefined

      const root = rootRef.current
      const values = root ? Array.from(root.querySelectorAll('.visual-prototype__value')) : []
      const slots = root ? Array.from(root.querySelectorAll('.visual-prototype__slot')) : []

      if (values.length > 0) {
        gsap.fromTo(
          values,
          { y: -4, autoAlpha: 0.55 },
          { y: 0, autoAlpha: 1, duration: visualDuration, ease: visualEase, stagger: 0.04 },
        )
      }
      if (slots.length > 0) {
        gsap.fromTo(
          slots,
          { y: 6, scale: 0.94, autoAlpha: 0.55 },
          { y: 0, scale: 1, autoAlpha: 1, duration: 0.34, ease: visualEase, stagger: 0.025 },
        )
      }

      return undefined
    },
    { scope: rootRef, dependencies: [current.count, current.capacity, reduceMotion], revertOnUpdate: true },
  )

  useGSAP(
    () => {
      if (reduceMotion || !ambientEnabled) return undefined

      const tl = gsap.timeline({ repeat: -1, defaults: { duration: 0.7, ease: 'sine.inOut' } })
      tl.to('.visual-prototype__memory', { y: -2 }).to('.visual-prototype__memory', { y: 0 })
      return () => tl.kill()
    },
    { scope: rootRef, dependencies: [ambientEnabled, reduceMotion], revertOnUpdate: true },
  )

  const allocatedSlots = Array.from({ length: current.capacity }, (_, i) => i < current.count)

  return (
    <figure ref={rootRef} className="visual-prototype" aria-labelledby="growth-vis-title">
      <figcaption id="growth-vis-title" className="visual-prototype__caption">
        GrowthVisualizer — looped geometric capacity on push
      </figcaption>

      <div className="visual-prototype__memory" aria-live="polite" aria-label={`Current state: count ${current.count} capacity ${current.capacity}`}>
        <div className="visual-prototype__meta">
          <div>
            <span className="visual-prototype__label">count</span>
            <span className="visual-prototype__value">{current.count}</span>
          </div>
          <div>
            <span className="visual-prototype__label">capacity</span>
            <span className="visual-prototype__value">{current.capacity}</span>
          </div>
        </div>

        <div className="visual-prototype__slots" role="img" aria-label="Array element slots">
          {allocatedSlots.map((isFilled, idx) => (
            <div
              key={`slot-${idx}`}
              className={`visual-prototype__slot ${isFilled ? 'visual-prototype__slot--filled' : 'visual-prototype__slot--allocated'}`}
              aria-label={isFilled ? `initialized element ${idx + 1}` : `allocated empty slot ${idx + 1}`}
            >
              {isFilled ? idx + 1 : ''}
            </div>
          ))}
        </div>
        {current.capacity === 0 && <div className="visual-prototype__empty-state">no allocated slots yet</div>}
        <div className="visual-prototype__iter-label">
          green boxes = count ({current.count}); total allocated boxes = capacity ({current.capacity})
        </div>
      </div>

      <div className="visual-prototype__controls">
        <button type="button" onClick={simulatePush} className="visual-prototype__btn">
          Push next value
        </button>
        <button type="button" onClick={reset} className="visual-prototype__btn visual-prototype__btn--ghost">
          Reset
        </button>
      </div>

      <div className="visual-prototype__log" aria-label="Operation history">
        {steps.slice().reverse().map((s, i) => (
          <div key={`${s.count}-${s.capacity}-${i}`} className="visual-prototype__log-line">
            <span className="visual-prototype__log-count">c={s.count}</span> cap={s.capacity} — {s.note}
          </div>
        ))}
      </div>

      <p className="visual-prototype__note">
        Mirrors documented behavior in overview.md and api-reference.md: zero-capacity start, geometric doubling, overflow-safe growth, existing data preserved on realloc failure.
      </p>
    </figure>
  )
}
