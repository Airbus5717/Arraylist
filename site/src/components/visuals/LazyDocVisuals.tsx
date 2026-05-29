import React from 'react'
import { Suspense } from 'react'

const OwnershipVisualizer = React.lazy(() =>
  import('./OwnershipVisualizer').then((m) => ({ default: m.OwnershipVisualizer }))
)
const GrowthVisualizer = React.lazy(() =>
  import('./GrowthVisualizer').then((m) => ({ default: m.GrowthVisualizer }))
)
const AccessVisualizer = React.lazy(() =>
  import('./AccessVisualizer').then((m) => ({ default: m.AccessVisualizer }))
)
const SliceVisualizer = React.lazy(() =>
  import('./SliceVisualizer').then((m) => ({ default: m.SliceVisualizer }))
)
const NullableHelpersVisualizer = React.lazy(() =>
  import('./NullableHelpersVisualizer').then((m) => ({ default: m.NullableHelpersVisualizer }))
)

type Props = {
  slug: string
}

export function LazyDocVisuals({ slug }: Props) {
  if (slug === 'overview') {
    return (
      <Suspense fallback={<div className="visuals-loading">Loading models…</div>}>
        <div className="doc-visual-callout">
          <OwnershipVisualizer />
          <GrowthVisualizer />
          <SliceVisualizer />
          <NullableHelpersVisualizer />
        </div>
      </Suspense>
    )
  }

  if (slug === 'api-reference') {
    return (
      <Suspense fallback={<div className="visuals-loading">Loading model…</div>}>
        <div className="doc-visual-callout">
          <AccessVisualizer />
        </div>
      </Suspense>
    )
  }

  return null
}
