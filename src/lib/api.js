// MacroSnap API client.
// Stateless JWT auth: sign in once, store the token, send it as a Bearer header
// on every protected request. See frontend-auth-handoff.md for the contract.
const BASE = import.meta.env?.VITE_API_URL ?? ''
const TOKEN_KEY = 'macrosnap_token'

// "Continue with Google" is a full-page redirect to the backend (not a fetch),
// so it points at the backend origin, not the frontend.
export const googleAuthUrl = `${BASE}/api/auth/google`

// --- token storage ---------------------------------------------------------
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

// Called once when a protected request returns 401 (expired/invalid token).
// AuthProvider wires this to clear user state; the router then shows /signin.
let onUnauthorized = () => {}
export const setOnUnauthorized = (fn) => {
  onUnauthorized = fn
}

// Thrown for any non-2xx response so callers can try/catch on err.message.
export class ApiError extends Error {
  constructor(message, status, body) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body // full parsed response: { error } or { errors: [...] }
  }
}

// --- core request ----------------------------------------------------------
async function request(path, { method = 'GET', body, auth = false, isForm = false } = {}) {
  const headers = {}
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  let payload = body
  if (body && !isForm) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: payload })
  } catch {
    throw new ApiError('Could not reach the server. Is the backend running?', 0, null)
  }

  // Global session-expiry handling: a 401 on a protected call means the token
  // is dead — clear it and notify the app once.
  if (res.status === 401 && auth) {
    clearToken()
    onUnauthorized()
  }

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    // Prefer a single { error }, else join express-validator { errors: [...] }.
    const message =
      data?.error ||
      (Array.isArray(data?.errors) && data.errors.length
        ? data.errors.map((e) => e.message).join('\n')
        : `Request failed (${res.status})`)
    throw new ApiError(message, res.status, data)
  }
  return data
}

// --- auth ------------------------------------------------------------------
export const auth = {
  // Creates the account AND logs the user in — stores the token, returns the
  // user (same shape as signin: { id, email, name }).
  async signup(email, name, password) {
    const data = await request('/api/auth/signup', { method: 'POST', body: { email, name, password } })
    setToken(data.token)
    return data.user
  },

  // Stores the token on success; returns the user.
  async signin(email, password) {
    const data = await request('/api/auth/signin', { method: 'POST', body: { email, password } })
    setToken(data.token)
    return data.user
  },

  // Demo mode — also stores the token. Returns { id, email, isDemo: true }.
  async demo() {
    const data = await request('/api/auth/demo', { method: 'POST' })
    setToken(data.token)
    return data.user
  },

  // Validate the stored token on app load. Returns the user or null.
  async me() {
    if (!getToken()) return null
    try {
      return await request('/api/auth/me', { auth: true })
    } catch (e) {
      if (e.status === 401) return null // token already cleared by request()
      throw e
    }
  },

  // Add a password to a passwordless (Google) account. 200 { success }, or
  // 409 (already set) / 403 (demo) / 400 (weak) surfaced as ApiError.
  setPassword: (password) =>
    request('/api/auth/set-password', { method: 'POST', auth: true, body: { password } }),

  signout() {
    clearToken()
  },
}

// --- meals -----------------------------------------------------------------
export const meals = {
  // items: [{ name, fdcId?, portion_grams, calories, protein, carbs, fat }]
  create: (items) => request('/api/meals', { method: 'POST', auth: true, body: { items } }),
  list: () => request('/api/meals', { auth: true }),
  daily: (date) => request(`/api/meals/daily${date ? `?date=${encodeURIComponent(date)}` : ''}`, { auth: true }),
}

// --- goals -----------------------------------------------------------------
// Per-user daily macro goals { calories, protein, carbs, fat }. New users get
// backend defaults; demo users get defaults and PUT echoes without persisting.
export const goals = {
  get: () => request('/api/goals', { auth: true }),
  update: ({ calories, protein, carbs, fat }) =>
    request('/api/goals', { method: 'PUT', auth: true, body: { calories, protein, carbs, fat } }),
}

// --- food / vision ---------------------------------------------------------
export const food = {
  // Send a base64-encoded image (what the Capture screen produces).
  analyzeBase64: (image, mimeType = 'image/jpeg') =>
    request('/api/analyze', { method: 'POST', auth: true, body: { image, mimeType } }),

  // Or send a File straight from an <input type="file"> as multipart/form-data.
  analyzePhoto(photo) {
    const form = new FormData()
    form.append('photo', photo)
    return request('/api/analyze', { method: 'POST', auth: true, body: form, isForm: true })
  },

  usdaSearch: (q) => request(`/api/usda/search?q=${encodeURIComponent(q)}`, { auth: true }),
  usdaFood: (fdcId) => request(`/api/usda/food/${fdcId}`, { auth: true }),
}
