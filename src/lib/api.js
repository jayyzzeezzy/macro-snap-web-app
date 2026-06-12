// Thin client for the MacroSnap Express backend.
// VITE_API_URL points at the backend during dev (see .env.local).
const BASE = import.meta.env.VITE_API_URL ?? ''

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
  } catch {
    throw new Error('Could not reach the server. Is the backend running?')
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      // non-JSON error body; keep the generic message
    }
    throw new Error(message)
  }
  return res.json()
}

// POST /api/analyze — send a food photo, get identified items + macros.
export function analyzeImage({ image, mimeType }) {
  return request('/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ image, mimeType }),
  })
}

// GET /api/usda/search — used when the user renames a food.
export function searchUsda(query) {
  return request(`/api/usda/search?q=${encodeURIComponent(query)}`)
}

// POST /api/meals — save the final user-corrected meal.
export function saveMeal(items) {
  return request('/api/meals', {
    method: 'POST',
    body: JSON.stringify({ items }),
  })
}

// GET /api/meals/daily — meals + totals for a single day (omit date for today).
export function getDaily(date) {
  const qs = date ? `?date=${encodeURIComponent(date)}` : ''
  return request(`/api/meals/daily${qs}`)
}
