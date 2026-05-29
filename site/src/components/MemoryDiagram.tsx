export function MemoryDiagram() {
  return (
    <figure className="memory-diagram" aria-labelledby="memory-diagram-title">
      <figcaption className="memory-diagram__caption" id="memory-diagram-title">
        Array(T) allocation layout
      </figcaption>

      <div className="memory-diagram__array" aria-label="Array block with count, capacity, and elements">
        <div className="memory-diagram__cell memory-diagram__cell--meta">
          <span className="memory-diagram__cell-label">count</span>
          <span className="memory-diagram__cell-value">3</span>
        </div>
        <div className="memory-diagram__cell memory-diagram__cell--meta">
          <span className="memory-diagram__cell-label">capacity</span>
          <span className="memory-diagram__cell-value">8</span>
        </div>
        <div className="memory-diagram__cell memory-diagram__cell--elements">
          <span className="memory-diagram__cell-label">elements[0..capacity-1]</span>
          <span className="memory-diagram__slots" aria-hidden="true">
            <span className="memory-diagram__slot memory-diagram__slot--filled">10</span>
            <span className="memory-diagram__slot memory-diagram__slot--filled">20</span>
            <span className="memory-diagram__slot memory-diagram__slot--filled">30</span>
            <span className="memory-diagram__slot" />
            <span className="memory-diagram__slot" />
            <span className="memory-diagram__slot" />
            <span className="memory-diagram__slot" />
            <span className="memory-diagram__slot" />
          </span>
        </div>
      </div>

      <div className="memory-diagram__slice" aria-label="Slice range references array indexes">
        <span className="memory-diagram__slice-label">Slice(T)</span>
        <span className="memory-diagram__slice-line" aria-hidden="true" />
        <span className="memory-diagram__slice-note">range: start + count</span>
      </div>

      <div className="memory-diagram__slice" aria-label="Span is a temporary borrowed pointer view">
        <span className="memory-diagram__slice-label">Span(T)</span>
        <span className="memory-diagram__slice-line" aria-hidden="true" />
        <span className="memory-diagram__slice-note">temporary view: count + elements*</span>
      </div>

      <dl className="memory-diagram__notes">
        <div>
          <dt>checked</dt>
          <dd>array_try_push · array_try_at · array_try_slice_t</dd>
        </div>
        <div>
          <dt>unchecked</dt>
          <dd>array_at · array_end · slice_from_array_t</dd>
        </div>
      </dl>
    </figure>
  )
}
