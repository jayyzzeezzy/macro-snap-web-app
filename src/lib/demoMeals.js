// The backend persists nothing for the shared demo user (see the auth handoff),
// so a demo user's logged meals live here in localStorage. Mirrors the goals.js
// pattern and produces the same shapes the meals API would return, so the
// screens don't need to care whether data came from the server or from here.
// Cleared on demo sign-out.
const KEY = 'macrosnap.demoMeals'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // corrupt/unavailable storage — start empty
  }
  return []
}

function save(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    // ignore write failures (private mode, quota)
  }
}

export function clearDemoMeals() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

function macroTotals(items) {
  return items.reduce(
    (acc, i) => ({
      calories: acc.calories + (i.calories || 0),
      protein: acc.protein + (i.protein || 0),
      carbs: acc.carbs + (i.carbs || 0),
      fat: acc.fat + (i.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

// Build a serialized meal shaped like POST /api/meals and store it.
export function addDemoMeal(items) {
  const meal = {
    id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: 'demo',
    eatenAt: new Date().toISOString(),
    items: items.map((it, i) => ({ id: `${i}`, ...it })),
  }
  const all = load()
  all.push(meal)
  save(all)
  return meal
}

// Mirrors GET /api/meals — newest first.
export function listDemoMeals() {
  return { meals: [...load()].reverse() }
}

// Mirrors GET /api/meals/daily — meals for one day plus totals.
export function dailyDemoMeals(date) {
  const target = date ? new Date(date) : new Date()
  const start = new Date(new Date(target).setHours(0, 0, 0, 0))
  const end = new Date(new Date(target).setHours(23, 59, 59, 999))
  const meals = load().filter((m) => {
    const t = new Date(m.eatenAt)
    return t >= start && t <= end
  })
  const totals = macroTotals(meals.flatMap((m) => m.items))
  return { date: start.toISOString(), meals, totals }
}
