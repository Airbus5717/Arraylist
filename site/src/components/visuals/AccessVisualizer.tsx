import { useRef, useState } from 'react'
import { gsap, useAmbientCycle, useAmbientPause, useGSAP, usePrefersReducedMotion, visualDuration, visualEase } from './animation'

const VALUES = [10, 20, 30, 40]
const AMBIENT_TARGETS = [1, 3, -1, 9, 0]

export function AccessVisualizer() {
  const rootRef = useRef<HTMLElement>(null)
  const targetRef = useRef(0)
  const [idx, setIdx] = useState(1)
  const [result, setResult] = useState<string | null>(null)
  const reduceMotion = usePrefersReducedMotion()
  const { ambientEnabled, pauseAmbient } = useAmbientPause(reduceMotion)

  function applyAccess(target: number) {
    setIdx(target)
    if (target >= 0 && target < VALUES.length) {
      setResult(`Success: &arr->elements[${target}] = ${VALUES[target]}`)
    } else {
      setResult('Failure: returns false, out_ptr unchanged (bounds check)')
    }
  }

  function tryAccess(target: number) {
    pauseAmbient()
    applyAccess(target)
  }

  function ambientStep() {
    targetRef.current = (targetRef.current + 1) % AMBIENT_TARGETS.length
    applyAccess(AMBIENT_TARGETS[targetRef.current])
  }

  useAmbientCycle(ambientEnabled, 1700, ambientStep)

  useGSAP(
    () => {
      if (reduceMotion) return undefined

      gsap.fromTo(
        '.visual-prototype__slot--highlight',
        { scale: 0.94 },
        { scale: 1.08, duration: visualDuration, ease: visualEase, yoyo: true, repeat: 1 },
      )
      gsap.fromTo(
        '.visual-prototype__result',
        { y: 5, autoAlpha: 0.65 },
        { y: 0, autoAlpha: 1, duration: visualDuration, ease: visualEase },
      )

      return undefined
    },
    { scope: rootRef, dependencies: [idx, result, reduceMotion], revertOnUpdate: true },
  )

  return (
    <figure ref={rootRef} className="visual-prototype" aria-labelledby="access-vis-title">
      <figcaption id="access-vis-title" className="visual-prototype__caption">
        AccessVisualizer — looped array_try_at bounds checking
      </figcaption>

      <div className="visual-prototype__memory">
        <div className="visual-prototype__slots" style={{ gridTemplateColumns: `repeat(${VALUES.length}, 1fr)` }}>
          {VALUES.map((v, i) => (
            <div
              key={i}
              className={`visual-prototype__slot ${i === idx ? 'visual-prototype__slot--highlight' : ''} visual-prototype__slot--filled`}
            >
              {v}
            </div>
          ))}
        </div>
      </div>

      <div className="visual-prototype__controls">
        {VALUES.map((_, i) => (
          <button key={i} type="button" onClick={() => tryAccess(i)} className="visual-prototype__btn">
            try_at({i})
          </button>
        ))}
        <button type="button" onClick={() => tryAccess(-1)} className="visual-prototype__btn visual-prototype__btn--danger">try_at(-1)</button>
        <button type="button" onClick={() => tryAccess(9)} className="visual-prototype__btn visual-prototype__btn--danger">try_at(9)</button>
      </div>

      <div className="visual-prototype__result" aria-live="polite">
        {result || 'Click a try_at button to simulate the checked access contract'}
      </div>

      <p className="visual-prototype__note">
        Directly illustrates the contract in api-reference.md: array_try_at returns bool, only writes out_ptr on success, never causes UB on bad index.
      </p>
    </figure>
  )
}
