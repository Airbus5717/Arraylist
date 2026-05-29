import React from 'react'
import { Suspense } from 'react'

const GrowthVisualizer = React.lazy(() => import('./GrowthVisualizer').then(m => ({ default: m.GrowthVisualizer })))
const OwnershipVisualizer = React.lazy(() => import('./OwnershipVisualizer').then(m => ({ default: m.OwnershipVisualizer })))
const AccessVisualizer = React.lazy(() => import('./AccessVisualizer').then(m => ({ default: m.AccessVisualizer })))
const IterationVisualizer = React.lazy(() => import('./IterationVisualizer').then(m => ({ default: m.IterationVisualizer })))
const SliceVisualizer = React.lazy(() => import('./SliceVisualizer').then(m => ({ default: m.SliceVisualizer })))
const NullableHelpersVisualizer = React.lazy(() => import('./NullableHelpersVisualizer').then(m => ({ default: m.NullableHelpersVisualizer })))

export function LazyPlaygroundVisuals() {
  return (
    <Suspense fallback={<div className="visuals-loading">Loading full sandbox…</div>}>
      <div className="playground-grid">
        <GrowthVisualizer />
        <OwnershipVisualizer />
        <AccessVisualizer />
        <IterationVisualizer />
        <SliceVisualizer />
        <NullableHelpersVisualizer />
      </div>
    </Suspense>
  )
}
