import { useRef, useState } from 'react'
import { gsap, useAmbientCycle, useAmbientPause, useGSAP, usePrefersReducedMotion, visualDuration, visualEase } from './animation'

export function NullableHelpersVisualizer() {
  const rootRef = useRef<HTMLElement>(null)
  const phaseRef = useRef(0)
  const [isNull, setIsNull] = useState(true)
  const [count, setCount] = useState(0)
  const reduceMotion = usePrefersReducedMotion()
  const { ambientEnabled, pauseAmbient } = useAmbientPause(reduceMotion)

  const safeLength = isNull ? 0 : count
  const safeIsEmpty = isNull ? true : count === 0

  function toggleNull() {
    setIsNull((value) => !value)
  }

  function push() {
    if (isNull) {
      setIsNull(false)
      setCount(1)
    } else {
      setCount((c) => Math.min(c + 1, 5))
    }
  }

  function reset() {
    setIsNull(true)
    setCount(0)
  }

  function runManual(action: () => void) {
    pauseAmbient()
    action()
  }

  function ambientStep() {
    phaseRef.current = (phaseRef.current + 1) % 5

    if (phaseRef.current === 0) reset()
    if (phaseRef.current === 1) push()
    if (phaseRef.current === 2) push()
    if (phaseRef.current === 3) push()
    if (phaseRef.current === 4) {
      setIsNull(true)
      setCount(0)
    }
  }

  useAmbientCycle(ambientEnabled, 1500, ambientStep)

  useGSAP(
    () => {
      if (reduceMotion) return undefined

      gsap.fromTo(
        '.visual-prototype__slot',
        { scale: 0.96, autoAlpha: 0.55 },
        { scale: 1, autoAlpha: 1, duration: visualDuration, ease: visualEase, stagger: 0.025 },
      )
      gsap.fromTo(
        '.visual-prototype__result strong',
        { y: -3, autoAlpha: 0.55 },
        { y: 0, autoAlpha: 1, duration: visualDuration, ease: visualEase, stagger: 0.04 },
      )

      return undefined
    },
    { scope: rootRef, dependencies: [isNull, count, reduceMotion], revertOnUpdate: true },
  )

  return (
    <figure ref={rootRef} className="visual-prototype" aria-labelledby="nullable-vis-title">
      <figcaption id="nullable-vis-title" className="visual-prototype__caption">
        NullableHelpersVisualizer — looped safe length / empty on NULL
      </figcaption>

      <div className="visual-prototype__memory">
        <div className="visual-prototype__label-row">
          <span>Array state</span>
          <span className={`visual-prototype__status ${isNull ? 'visual-prototype__status--freed' : 'visual-prototype__status--alive'}`}>
            {isNull ? 'NULL' : `alive (count=${count})`}
          </span>
        </div>

        <div className="visual-prototype__slots" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`visual-prototype__slot ${!isNull && i < count ? 'visual-prototype__slot--filled' : ''}`}>
              {!isNull && i < count ? i + 1 : ''}
            </div>
          ))}
        </div>

        <div className="visual-prototype__result">
          array_length_or0 → <strong>{safeLength}</strong> &nbsp;&nbsp;
          array_is_empty_or_true → <strong>{safeIsEmpty ? 'true' : 'false'}</strong>
        </div>
      </div>

      <div className="visual-prototype__controls">
        <button type="button" onClick={() => runManual(toggleNull)} className="visual-prototype__btn">
          {isNull ? 'Make array' : 'Set to NULL'}
        </button>
        <button type="button" onClick={() => runManual(push)} className="visual-prototype__btn">Push</button>
        <button type="button" onClick={() => runManual(reset)} className="visual-prototype__btn visual-prototype__btn--ghost">Reset</button>
      </div>

      <p className="visual-prototype__note">
        Demonstrates the nullable safety helpers from api-reference.md. These macros let you write defensive code without explicit NULL checks in many read-only paths.
      </p>
    </figure>
  )
}
