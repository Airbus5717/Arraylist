import { useRef, useState } from 'react'
import { gsap, useAmbientCycle, useAmbientPause, useGSAP, usePrefersReducedMotion, visualDuration, visualEase } from './animation'

const DEMO = [10, 20, 30, 40, 50]

export function IterationVisualizer() {
  const rootRef = useRef<HTMLElement>(null)
  const [pos, setPos] = useState(0)
  const [manualPlaying, setManualPlaying] = useState(false)
  const reduceMotion = usePrefersReducedMotion()
  const { ambientEnabled, pauseAmbient } = useAmbientPause(reduceMotion || manualPlaying)

  function advance() {
    setPos((p) => (p + 1) % DEMO.length)
  }

  function step() {
    pauseAmbient()
    advance()
  }

  function toggle() {
    pauseAmbient(3600)
    setManualPlaying((playing) => !playing)
  }

  function reset() {
    pauseAmbient()
    setManualPlaying(false)
    setPos(0)
  }

  useAmbientCycle(ambientEnabled || manualPlaying, manualPlaying ? 420 : 1500, advance)

  useGSAP(
    () => {
      if (reduceMotion) return undefined

      gsap.fromTo(
        '.visual-prototype__slot--highlight',
        { scale: 0.96, y: 0 },
        { scale: 1.1, y: -2, duration: visualDuration, ease: visualEase, yoyo: true, repeat: 1 },
      )
      gsap.fromTo(
        '.visual-prototype__iter-label',
        { x: -5, autoAlpha: 0.65 },
        { x: 0, autoAlpha: 1, duration: visualDuration, ease: visualEase },
      )

      return undefined
    },
    { scope: rootRef, dependencies: [pos, reduceMotion], revertOnUpdate: true },
  )

  return (
    <figure ref={rootRef} className="visual-prototype" aria-labelledby="iter-vis-title">
      <figcaption id="iter-vis-title" className="visual-prototype__caption">
        IterationVisualizer — looped array_for_each_t stepping
      </figcaption>

      <div className="visual-prototype__memory">
        <div className="visual-prototype__slots" style={{ gridTemplateColumns: `repeat(${DEMO.length}, 1fr)` }}>
          {DEMO.map((v, i) => (
            <div
              key={i}
              className={`visual-prototype__slot ${i === pos ? 'visual-prototype__slot--highlight visual-prototype__slot--filled' : 'visual-prototype__slot--filled'}`}
            >
              {v}
            </div>
          ))}
        </div>
        <div className="visual-prototype__iter-label">
          current pointer → elements[{pos}]
        </div>
      </div>

      <div className="visual-prototype__controls">
        <button type="button" onClick={step} className="visual-prototype__btn">Step (next element)</button>
        <button type="button" onClick={toggle} className="visual-prototype__btn">{manualPlaying ? 'Pause' : 'Play loop'}</button>
        <button type="button" onClick={reset} className="visual-prototype__btn visual-prototype__btn--ghost">Reset</button>
      </div>

      <p className="visual-prototype__note">
        Shows the strict C iteration macro contract: visits every initialized element exactly once in order, pointer is always valid for the current count.
      </p>
    </figure>
  )
}
