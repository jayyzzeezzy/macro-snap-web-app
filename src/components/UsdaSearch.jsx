import { useCallback, useEffect, useState } from 'react'
import { food } from '../lib/api'
import { round } from '../lib/macros'

// Minimum characters before hitting the (rate-limited) USDA API; avoids wasteful
// 1-char lookups.
const MIN_QUERY = 2
const DEBOUNCE_MS = 300

// Inline panel for renaming a food: search USDA and pick the correct match.
// onPick receives the chosen USDA food { fdcId, description, per100g, ... }.
export default function UsdaSearch({ initialQuery = '', onPick, onCancel }) {
  const [query, setQuery] = useState(initialQuery)
  const [foods, setFoods] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const runSearch = useCallback(async (raw) => {
    const q = raw.trim()
    if (q.length < MIN_QUERY) return
    setLoading(true)
    setError('')
    try {
      const data = await food.usdaSearch(q)
      setFoods(data.foods || [])
    } catch (err) {
      // Surfaces the server's message, including 429 rate-limit notices.
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search-as-you-type: wait until the user pauses (and has typed at
  // least MIN_QUERY chars) so typing "chicken" spends one request, not one per
  // keystroke. Also covers the initial query when the panel opens.
  useEffect(() => {
    if (query.trim().length < MIN_QUERY) return
    const t = setTimeout(() => runSearch(query), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [query, runSearch])

  function onSubmit(e) {
    e.preventDefault()
    runSearch(query) // immediate search / retry on Enter or the Search button
  }

  return (
    <div className="usda-search">
      <form className="usda-search__form" onSubmit={onSubmit}>
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
