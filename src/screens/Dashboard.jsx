import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDaily } from '../lib/api'
import { loadGoals, saveGoals, DEFAULT_GOALS } from '../lib/goals'
import { round, sumMacros } from '../lib/macros'
import MacroBar from '../components/MacroBar'
import MacroTotals from '../components/MacroTotals'

const todayISO = () => new Date().toISOString().slice(0, 10)

const MACROS = [
  { kind: 'calories', label: 'Calories' },
  { kind: 'protein', label: 'Protein' },
  { kind: 'carbs', label: 'Carbs' },
  { kind: 'fat', label: 'Fat' },
]

// Screen 5: today's totals vs goals, plus the meals eaten.
export default function Dashboard() {
  const [date, setDate] = useState(todayISO())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [goals, setGoals] = useState(loadGoals)
  const [editingGoals, setEditingGoals] = useState(false)

  const load = useCallback(async (forDate) => {
    setLoading(true)
    setError('')
    try {
      const isToday = forDate === todayISO()
      const result = await getDaily(isToday ? undefined : forDate)
      setData(result)
    } catch (err) {
      setError(err.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Fetch the day's meals when the date changes; loading state is set inside
    // load(). Intentional data-fetching effect (no data framework here).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(date)
  }, [date, load])

  const totals = data?.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }
  const meals = data?.meals ?? []

  function commitGoals(next) {
    setGoals(next)
    saveGoals(next)
  }

  return (
    <div className="screen dashboard">
      <header className="screen__header">
        <h1>Today</h1>
        <input
          className="dashboard__date"
          type="date"
          max={todayISO()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </header>

      {error && <p className="error">{error}</p>}

      <section className="card">
        <div className="card__head">
          <h2>Macros</h2>
          <button className="link link--small" onClick={() => setEditingGoals((v) => !v)}>
            {editingGoals ? 'Done' : 'Edit goals'}
          </button>
        </div>

        {editingGoals ? (
          <GoalEditor goals={goals} onChange={commitGoals} />
        ) : (
          <div className="dashboard__bars">
            {MACROS.map((m) => (
              <MacroBar
                key={m.kind}
                kind={m.kind}
                label={m.label}
                value={totals[m.kind]}
                goal={goals[m.kind]}
              />
            ))}
          </div>
        )}
      </section>

      <section className="dashboard__meals">
        <h2>Meals</h2>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : meals.length === 0 ? (
          <p className="muted">No meals logged for this day.</p>
        ) : (
          <ul className="meal-list">
            {meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </ul>
        )}
      </section>

      <Link to="/" className="fab" aria-label="Snap a meal">＋</Link>
    </div>
  )
}

function GoalEditor({ goals, onChange }) {
  const fields = [
    { key: 'calories', label: 'Calories', unit: 'kcal' },
    { key: 'protein', label: 'Protein', unit: 'g' },
    { key: 'carbs', label: 'Carbs', unit: 'g' },
    { key: 'fat', label: 'Fat', unit: 'g' },
  ]
  return (
    <div className="goal-editor">
      {fields.map((f) => (
        <label key={f.key} className="goal-editor__field">
          <span>{f.label}</span>
          <span className="goal-editor__input">
            <input
              type="number"
              min="0"
              value={goals[f.key]}
              onChange={(e) =>
                onChange({ ...goals, [f.key]: e.target.value === '' ? 0 : Number(e.target.value) })
              }
            />
            {f.unit}
          </span>
        </label>
      ))}
      <button className="link link--small" onClick={() => onChange({ ...DEFAULT_GOALS })}>
        Reset to defaults
      </button>
    </div>
  )
}

function MealCard({ meal }) {
  const eaten = meal.eatenAt ? new Date(meal.eatenAt) : null
  const time = eaten
    ? eaten.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : ''
  const totals = sumMacros(meal.items ?? [])

  return (
    <li className="meal-card">
      <div className="meal-card__head">
        <span className="meal-card__time">{time}</span>
        <span className="meal-card__cal">{round(totals.calories)} kcal</span>
      </div>
      <ul className="meal-card__items">
        {meal.items?.map((it, i) => (
          <li key={i}>
            <span>{it.name}</span>
            <span className="muted">{round(it.portion_grams)}g</span>
          </li>
        ))}
      </ul>
      <MacroTotals macros={totals} />
    </li>
  )
}
