import { useEffect, useState } from 'react'
import { food } from '../lib/api'
import { round } from '../lib/macros'

// Inline panel for renaming a food: search USDA and pick the correct match.
// onPick receives the chosen USDA food { fdcId, description, per100g, ... }.
export default function UsdaSearch({ initialQuery = '', onPick, onCancel }) {
  const [query, setQuery] = useState(initialQuery)
  const [foods, setFoods] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function runSearch(e) {
    e?.preventDefault()
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setError('')
    try {
      const data = await food.usdaSearch(q)
      setFoods(data.foods || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-search once if we were opened with a starting query. Setting loading
  // state from this fetch is intentional (no data framework here).
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    if (initialQuery.trim()) runSearch()
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  return (
    <div className="usda-search">
      <form className="usda-search__form" onSubmit={runSearch}>
        <input
          className="usda-search__input"
          type="search"
          value={query}
          autoFocus
          placeholder="Search USDA foods…"
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn--small" disabled={loading}>
          {loading ? '…' : 'Search'}
        </button>
        <button type="button" className="btn btn--small btn--ghost" onClick={onCancel}>
          Cancel
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {foods && !error && (
        foods.length === 0 ? (
          <p className="muted">No matches. Try different words.</p>
        ) : (
          <ul className="usda-search__results">
            {foods.map((food) => (
              <li key={food.fdcId}>
                <button
                  type="button"
                  className="usda-search__result"
                  onClick={() => onPick(food)}
                >
                  <span className="usda-search__desc">{food.description}</span>
                  <span className="usda-search__meta">
                    {round(food.per100g?.calories)} kcal / 100g
                    {food.dataType ? ` · ${food.dataType}` : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  )
}
