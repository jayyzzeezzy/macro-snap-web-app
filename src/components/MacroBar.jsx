import { round } from '../lib/macros'

const UNITS = { calories: 'kcal', protein: 'g', carbs: 'g', fat: 'g' }

// A single labelled progress bar: current value vs goal.
export default function MacroBar({ label, kind, value, goal }) {
  const current = round(value)
  const target = round(goal) || 0
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0
  const over = target > 0 && current > target

  return (
    <div className="macro-bar">
      <div className="macro-bar__head">
        <span className="macro-bar__label">{label}</span>
        <span className="macro-bar__value">
          {current}
          <span className="macro-bar__goal">
            {' / '}{target} {UNITS[kind]}
          </span>
        </span>
      </div>
      <div className="macro-bar__track" data-kind={kind}>
        <div
          className={`macro-bar__fill${over ? ' is-over' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
