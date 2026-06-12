import { round } from '../lib/macros'

// Compact four-up readout of a macro set (used on the Results screen).
export default function MacroTotals({ macros }) {
  const m = macros || {}
  const stats = [
    { key: 'calories', label: 'Cal', value: round(m.calories) },
    { key: 'protein', label: 'Protein', value: `${round(m.protein)}g` },
    { key: 'carbs', label: 'Carbs', value: `${round(m.carbs)}g` },
    { key: 'fat', label: 'Fat', value: `${round(m.fat)}g` },
  ]
  return (
    <div className="macro-totals">
      {stats.map((s) => (
        <div key={s.key} className="macro-totals__cell" data-kind={s.key}>
          <span className="macro-totals__value">{s.value}</span>
          <span className="macro-totals__label">{s.label}</span>
        </div>
      ))}
    </div>
  )
}
