import { useMemo, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useMealDraft } from '../state/MealDraftContext'
import { useMeals } from '../state/useMeals'
import { recalcMacros, sumMacros, round } from '../lib/macros'
import MacroTotals from '../components/MacroTotals'
import UsdaSearch from '../components/UsdaSearch'

// Screen 3: editable list of identified items. Portions recalc client-side;
// renaming a food searches USDA for the correct match.
export default function Results() {
  const navigate = useNavigate()
  const { draft, clearDraft } = useMealDraft()
  const meals = useMeals()

  // Local, editable copy of the analyzed items. Hook order must stay stable,
  // so initialise before the early return below.
  const [items, setItems] = useState(() => draft?.items ?? [])
  const [renaming, setRenaming] = useState(null) // index being renamed, or null
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const totals = useMemo(() => sumMacros(items), [items])
  const hasUnmatched = items.some((it) => !it.found || !it.per100g)

  // No analysis in memory (e.g. refresh) — send the user back to capture.
  if (!draft) return <Navigate to="/" replace />

  function setPortion(index, grams) {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it
        const portion_grams = grams === '' ? '' : Number(grams)
        // Recompute the flat macro fields from per100g; leave them if unmatched.
        if (!it.per100g) return { ...it, portion_grams }
        return { ...it, portion_grams, ...recalcMacros(it.per100g, portion_grams) }
      })
    )
  }

  function pickMatch(index, food) {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it
        const portion = Number(it.portion_grams) || 0
        return {
          ...it,
          name: food.description,
          fdcId: food.fdcId,
          usdaDescription: food.description,
          per100g: food.per100g,
          found: true,
          ...recalcMacros(food.per100g, portion),
        }
      })
    )
    setRenaming(null)
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index))
    setRenaming(null)
  }

  async function save() {
    if (items.length === 0 || hasUnmatched) return
    setSaving(true)
    setError('')
    try {
      await meals.create(
        items.map((it) => ({
          name: it.name,
          fdcId: it.fdcId,
          portion_grams: Number(it.portion_grams) || 0,
          calories: it.calories,
          protein: it.protein,
          carbs: it.carbs,
          fat: it.fat,
        }))
      )
      clearDraft()
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="screen results">
      <header className="screen__header">
        <button className="link" onClick={() => navigate('/')}>← Back</button>
        <h1>Review meal</h1>
        <span />
      </header>

      {draft.preview && (
        <img className="results__thumb" src={draft.preview} alt="Analyzed meal" />
      )}

      {items.length === 0 ? (
        <p className="muted">No items left. Go back and try another photo.</p>
      ) : (
        <ul className="item-list">
          {items.map((item, index) => {
            const unmatched = !item.found || !item.per100g
            return (
              <li key={index} className={`item${unmatched ? ' item--unmatched' : ''}`}>
                <div className="item__row">
                  <div className="item__name">
                    {item.name}
                    {unmatched && <span className="badge badge--warn">No USDA match</span>}
                  </div>
                  <button
                    className="link link--small"
                    onClick={() => setRenaming(renaming === index ? null : index)}
                  >
                    {unmatched ? 'Find match' : 'Edit'}
                  </button>
                </div>

                <div className="item__portion">
                  <label>
                    Portion
                    <span className="item__portion-input">
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        value={item.portion_grams}
                        onChange={(e) => setPortion(index, e.target.value)}
                      />
                      g
                    </span>
                  </label>
                  <button className="link link--small link--danger" onClick={() => removeItem(index)}>
                    Remove
                  </button>
                </div>

                {unmatched ? (
                  <p className="item__hint">
                    Pick a USDA match to get macros for this item.
                  </p>
                ) : (
                  <MacroTotals macros={item} />
                )}

                {renaming === index && (
                  <UsdaSearch
                    initialQuery={item.name}
                    onPick={(food) => pickMatch(index, food)}
                    onCancel={() => setRenaming(null)}
                  />
                )}
              </li>
            )
          })}
        </ul>
      )}

      {error && <p className="error">{error}</p>}

      <div className="results__summary">
        <div className="results__summary-head">
          <span>Meal total</span>
          <strong>{round(totals.calories)} kcal</strong>
        </div>
        <MacroTotals macros={totals} />
      </div>

      <div className="screen__footer">
        {hasUnmatched && items.length > 0 && (
          <p className="muted muted--center">Match every item to save this meal.</p>
        )}
        <button
          className="btn btn--primary btn--block"
          onClick={save}
          disabled={saving || items.length === 0 || hasUnmatched}
        >
          {saving ? 'Saving…' : 'Save meal'}
        </button>
      </div>
    </div>
  )
}
