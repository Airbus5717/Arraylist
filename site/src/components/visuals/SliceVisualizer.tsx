import { useRef, useState } from 'react'
import { gsap, useAmbientCycle, useAmbientPause, useGSAP, usePrefersReducedMotion, visualDuration, visualEase } from './animation'

export function SliceVisualizer() {
  const rootRef = useRef<HTMLElement>(null)
  const phaseRef = useRef(0)
  const [count, setCount] = useState(6)
  const [low, setLow] = useState(2)
  const [high, setHigh] = useState(5)
  const [reallocated, setReallocated] = useState(false)
  const [spanMaterialized, setSpanMaterialized] = useState(false)
  const [spanStale, setSpanStale] = useState(false)
  const reduceMotion = usePrefersReducedMotion()
  const { ambientEnabled, pauseAmbient } = useAmbientPause(reduceMotion)

  const capacity = Math.max(8, count)
  const slots = Array.from({ length: capacity }, (_, i) => i < count)
  const isValidSlice = low <= high && high <= count && low >= 0
  const sliceLength = isValidSlice ? high - low : 0

  function tryCreateSlice(newLow: number, newHigh: number) {
    setLow(newLow)
    setHigh(newHigh)
    setSpanMaterialized(false)
    setSpanStale(false)
  }

  function growArray() {
    setCount((value) => Math.min(value + 3, 12))
    setReallocated(true)
    setSpanStale(spanMaterialized)
  }

  function materializeSpan() {
    if (!isValidSlice) return
    setSpanMaterialized(true)
    setSpanStale(false)
  }

  function resetState() {
    setCount(6)
    setLow(2)
    setHigh(5)
    setReallocated(false)
    setSpanMaterialized(false)
    setSpanStale(false)
  }

  function runManual(action: () => void) {
    pauseAmbient()
    action()
  }

  function ambientStep() {
    phaseRef.current = (phaseRef.current + 1) % 6

    if (phaseRef.current === 0) resetState()
    if (phaseRef.current === 1) materializeSpan()
    if (phaseRef.current === 2) growArray()
    if (phaseRef.current === 3) materializeSpan()
    if (phaseRef.current === 4) tryCreateSlice(0, 3)
    if (phaseRef.current === 5) tryCreateSlice(3, 7)
  }

  useAmbientCycle(ambientEnabled, 1650, ambientStep)

  useGSAP(
    () => {
      if (reduceMotion) return undefined

      gsap.fromTo(
        '.visual-prototype__slot--highlight',
        { y: 4, scale: 0.96 },
        { y: 0, scale: 1.04, duration: visualDuration, ease: visualEase, stagger: 0.035, yoyo: true, repeat: 1 },
      )
      gsap.fromTo(
        '.visual-prototype__slice',
        { x: -8, autoAlpha: 0.5 },
        { x: 0, autoAlpha: 1, duration: 0.32, ease: visualEase, stagger: 0.05 },
      )

      return undefined
    },
    { scope: rootRef, dependencies: [count, low, high, reallocated, spanMaterialized, spanStale, reduceMotion], revertOnUpdate: true },
  )

  return (
    <figure ref={rootRef} className="visual-prototype" aria-labelledby="slice-vis-title">
      <figcaption id="slice-vis-title" className="visual-prototype__caption">
        SliceVisualizer — looped Slice range + temporary Span invalidation
      </figcaption>

      <div className="visual-prototype__memory">
        <div className="visual-prototype__label-row">
          <span>Array (count={count})</span>
          {spanStale && (
            <span className="visual-prototype__status visual-prototype__status--warn">reallocated — previous Span invalid</span>
          )}
        </div>

        <div className="visual-prototype__slots" style={{ gridTemplateColumns: `repeat(${capacity}, 1fr)` }}>
          {slots.map((filled, i) => {
            const inSlice = isValidSlice && i >= low && i < high
            const slotClass = [
              'visual-prototype__slot',
              filled ? 'visual-prototype__slot--filled' : '',
              inSlice ? 'visual-prototype__slot--highlight' : '',
              inSlice && spanStale ? 'visual-prototype__slot--dangling' : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <div key={i} className={slotClass}>
                {filled ? i + 1 : ''}
              </div>
            )
          })}
        </div>

        {isValidSlice && !reallocated && (
          <div className="visual-prototype__slice">
            Slice [{low}..{high}) — range length {sliceLength} — <strong>valid</strong>
          </div>
        )}

        {isValidSlice && reallocated && (
          <div className="visual-prototype__slice">
            Slice [{low}..{high}) — <strong>still a valid range</strong>; re-check against current Array before access
          </div>
        )}

        {isValidSlice && spanMaterialized && (
          <div className={`visual-prototype__slice visual-prototype__slice--span ${spanStale ? 'visual-prototype__slice--invalid' : ''}`}>
            Span from Slice [{low}..{high}) —{' '}
            {spanStale ? (
              <>
                <strong>DANGLING</strong> (backing storage moved)
              </>
            ) : (
              <>
                temporary <strong>borrowed pointer view</strong>
              </>
            )}
          </div>
        )}

        {!isValidSlice && (
          <div className="visual-prototype__slice visual-prototype__slice--invalid">
            Invalid range — array_try_slice_t would return false
          </div>
        )}
      </div>

      <div className="visual-prototype__controls">
        <button type="button" onClick={() => runManual(() => tryCreateSlice(2, 5))} className="visual-prototype__btn">
          Slice [2..5)
        </button>
        <button type="button" onClick={() => runManual(() => tryCreateSlice(1, 4))} className="visual-prototype__btn">Slice [1..4)</button>
        <button type="button" onClick={() => runManual(() => tryCreateSlice(3, 7))} className="visual-prototype__btn">Slice [3..7)</button>
        <button type="button" onClick={() => runManual(() => tryCreateSlice(0, 3))} className="visual-prototype__btn">Slice [0..3)</button>
        <button type="button" onClick={() => runManual(materializeSpan)} disabled={!isValidSlice} className="visual-prototype__btn">
          Materialize Span
        </button>
        <button type="button" onClick={() => runManual(growArray)} className="visual-prototype__btn visual-prototype__btn--danger">Force realloc (grow)</button>
        <button type="button" onClick={() => runManual(resetState)} className="visual-prototype__btn visual-prototype__btn--ghost">Reset</button>
      </div>

      <p className="visual-prototype__note">
        Directly demonstrates the contract from api-reference.md: Slice(T) stores a durable range; Span(T)
        is the explicit borrowed pointer view that becomes invalid after realloc (array_reserve / growth).
      </p>
    </figure>
  )
}
