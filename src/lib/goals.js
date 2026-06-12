// Daily macro goals. No backend field for these yet, so they live in localStorage
// and are editable on the dashboard.
const KEY = 'macrosnap.goals'

export const DEFAULT_GOALS = { calories: 2000, protein: 150, carbs: 200, fat: 65 }

export function loadGoals() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULT_GOALS, ...JSON.parse(raw) }
  } catch {
    // corrupt/unavailable storage — fall back to defaults
  }
  return { ...DEFAULT_GOALS }
}

export function saveGoals(goals) {
  try {
    localStorage.setItem(KEY, JSON.stringify(goals))
  } catch {
    // ignore write failures (private mode, quota)
  }
}
