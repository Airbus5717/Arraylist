import { useRef, useState } from 'react'
import { gsap, useAmbientCycle, useAmbientPause, useGSAP, usePrefersReducedMotion, visualDuration, visualEase } from './animation'

export function OwnershipVisualizer() {
  const rootRef = useRef<HTMLElement>(null)
  const phaseRef = useRef(0)
  const [arrayAlive, setArrayAlive] = useState(true)
  const [sliceActive, setSliceActive] = useState(false)
  const [spanActive, setSpanActive] = useState(false)
  const [count, setCount] = useState(3)
  const reduceMotion = usePrefersReducedMotion()
  const { ambientEnabled, pauseAmbient } = useAmbientPause(reduceMotion)

  function push() {
    if (!arrayAlive) return
    setCount((c) => Math.min(c + 1, 8))
  }

  function createSlice() {
    if (!arrayAlive) return
    setSliceActive(true)
  }

  function materializeSpan() {
    if (!arrayAlive || !sliceActive) return
    setSpanActive(true)
  }

  function freeArray() {
    setArrayAlive(false)
    setSliceActive(false)
    setSpanActive(false)
  }

  function resetState() {
    setArrayAlive(true)
    setSliceActive(false)
    setSpanActive(false)
    setCount(3)
  }

  function runManual(action: () => void) {
    pauseAmbient()
    action()
  }

  function ambientStep() {
    phaseRef.current = (phaseRef.current + 1) % 5

    if (phaseRef.current === 0) resetState()
    if (phaseRef.current === 1) createSlice()
    if (phaseRef.current === 2) materializeSpan()
    if (phaseRef.current === 3) push()
    if (phaseRef.current === 4) freeArray()
  }

  useAmbientCycle(ambientEnabled, 1650, ambientStep)

  useGSAP(
    () => {
      if (reduceMotion) return undefined

      gsap.fromTo(
        '.visual-prototype__slot',
        { y: 4, autoAlpha: 0.55 },
        { y: 0, autoAlpha: arrayAlive ? 1 : 0.35, duration: visualDuration, ease: visualEase, stagger: 0.025 },
      )
      gsap.fromTo(
        '.visual-prototype__slice',
        { x: -8, autoAlpha: 0.45 },
        { x: 0, autoAlpha: 1, duration: 0.32, ease: visualEase, stagger: 0.05 },
      )

      return undefined
    },
    { scope: rootRef, dependencies: [arrayAlive, sliceActive, spanActive, count, reduceMotion], revertOnUpdate: true },
  )

  const slots = Array.from({ length: 8 }, (_, i) => i < count)

  return (
    <figure ref={rootRef} className="visual-prototype" aria-labelledby="ownership-vis-title">
      <figcaption id="ownership-vis-title" className="visual-prototype__caption">
        OwnershipVisualizer — looped Array, Slice, and Span lifetime
      </figcaption>

      <div className="visual-prototype__memory" aria-live="polite">
        <div className="visual-prototype__label-row">
          <span>Array(int)</span>
          <span className={`visual-prototype__status ${arrayAlive ? 'visual-prototype__status--alive' : 'visual-prototype__status--freed'}`}>
            {arrayAlive ? 'alive (owns memory)' : 'freed (invalid)'}
          </span>
        </div>

        <div className="visual-prototype__slots">
          {slots.map((filled, i) => (
            <div
              key={i}
              className={`visual-prototype__slot ${filled ? 'visual-prototype__slot--filled' : ''} ${!arrayAlive ? 'visual-prototype__slot--dead' : ''}`}
            >
              {filled ? i + 1 : ''}
            </div>
          ))}
        </div>

        {sliceActive && arrayAlive && (
          <div className="visual-prototype__slice" aria-label="Active Slice range over elements 1..4">
            <span className="visual-prototype__slice-label">Slice [1..4) — range, no borrowed pointer</span>
          </div>
        )}

        {spanActive && arrayAlive && (
          <div className="visual-prototype__slice visual-prototype__slice--span" aria-label="Temporary Span pointer view">
            <span className="visual-prototype__slice-label">Span [1..4) — temporary borrowed pointer view</span>
          </div>
        )}

        {!arrayAlive && (
          <div className="visual-prototype__slice visual-prototype__slice--invalid" aria-label="Storage after free">
            <span className="visual-prototype__slice-label">Storage freed — ranges cannot be resolved; spans and pointers invalid</span>
          </div>
        )}
      </div>

      <div className="visual-prototype__controls">
        <button type="button" onClick={() => runManual(push)} disabled={!arrayAlive} className="visual-prototype__btn">Push</button>
        <button type="button" onClick={() => runManual(createSlice)} disabled={!arrayAlive || sliceActive} className="visual-prototype__btn">Create Slice range</button>
        <button type="button" onClick={() => runManual(materializeSpan)} disabled={!arrayAlive || !sliceActive || spanActive} className="visual-prototype__btn">Materialize Span</button>
        <button type="button" onClick={() => runManual(freeArray)} disabled={!arrayAlive} className="visual-prototype__btn visual-prototype__btn--danger">array_free</button>
        <button type="button" onClick={() => runManual(resetState)} className="visual-prototype__btn visual-prototype__btn--ghost">Reset</button>
      </div>

      <p className="visual-prototype__note">
        Demonstrates the updated ownership rule from overview.md: Array(T) owns memory; Slice(T) stores a range; Span(T) and element pointers are temporary borrowed views.
      </p>
    </figure>
  )
}
