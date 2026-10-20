const OPTIONS = [10, 15, 18, 20]

export default function TipButtons({ value, onChange }) {
  return (
    <div className="tip-buttons" role="group" aria-label="Tip percentage">
      {OPTIONS.map((pct) => (
        <button
          key={pct}
          type="button"
          data-testid={`tip-${pct}`}
          aria-pressed={value === pct}
          className={value === pct ? 'chip chip-on' : 'chip'}
          onClick={() => onChange(pct)}
        >
          {pct}%
        </button>
      ))}
    </div>
  )
}
