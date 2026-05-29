import { useState } from 'react'
import { usePageMeta } from '../hooks/usePageMeta'
import { LazyPlaygroundVisuals } from '../components/visuals/LazyPlaygroundVisuals'

export function PlaygroundPage() {
  usePageMeta({
    title: 'Playground — Arraylist',
    description: 'Interactive sandbox for all Arraylist memory models and behaviors.',
    path: '/playground',
  })

  const [showLabels, setShowLabels] = useState(true)

  return (
    <article className="doc-page playground-page">
      <header className="doc-page__header">
        <p className="doc-page__path">/playground</p>
        <h1 className="doc-page__title">Interactive Playground</h1>
        <p className="doc-page__lede">
          Experiment freely with every visual model. All behaviors match the documented contracts in the reference.
        </p>
      </header>

      <div className="playground-controls">
        <label>
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
          />{' '}
          Show explanatory labels
        </label>
        <span className="playground-hint">Press / anywhere to search docs</span>
      </div>

      <div className={showLabels ? '' : 'hide-labels'}>
        <LazyPlaygroundVisuals />
      </div>

      <footer className="playground-footer">
        These models are the same components used throughout the site. Changes here do not affect the documentation pages.
      </footer>
    </article>
  )
}
