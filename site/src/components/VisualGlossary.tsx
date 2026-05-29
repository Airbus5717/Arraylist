const glossary = [
  { name: 'GrowthVisualizer', desc: 'Geometric capacity growth on push / reserve (starts at 1, doubles)' },
  { name: 'OwnershipVisualizer', desc: 'Array owns memory; Slice stores a range; Span is the borrowed pointer view' },
  { name: 'AccessVisualizer', desc: 'Bounds-checked array_try_at — success writes pointer, failure returns false safely' },
  { name: 'IterationVisualizer', desc: 'array_for_each_t visits every initialized element exactly once in order' },
  { name: 'SliceVisualizer', desc: 'Slice ranges survive realloc; previously materialized spans become dangling' },
]

export function VisualGlossary() {
  return (
    <section className="visual-glossary">
      <h2 className="visual-glossary__title">Visual glossary</h2>
      <ul className="visual-glossary__list">
        {glossary.map((item) => (
          <li key={item.name} className="visual-glossary__item">
            <strong>{item.name}</strong>
            <span>{item.desc}</span>
          </li>
        ))}
      </ul>
      <p className="visual-glossary__note">
        All models are interactive and appear throughout the site (home + relevant reference pages).
      </p>
    </section>
  )
}
