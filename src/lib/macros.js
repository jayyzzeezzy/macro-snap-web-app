// Client-side macro math so portion edits don't hit the API (see CLAUDE.md).

export function recalcMacros(per100g, grams) {
  const g = Number(grams) || 0
  return {
    calories: (per100g.calories * g) / 100,
    protein: (per100g.protein * g) / 100,
    carbs: (per100g.carbs * g) / 100,
    fat: (per100g.fat * g) / 100,
  }
}

const ZERO = { calories: 0, protein: 0, carbs: 0, fat: 0 }

// Items carry their macros as flat fields (calories/protein/carbs/fat),
// matching the API. `per100g` is separate and not summed here.
export function sumMacros(items) {
  return items.reduce((total, item) => ({
    calories: total.calories + (item.calories || 0),
    protein: total.protein + (item.protein || 0),
    carbs: total.carbs + (item.carbs || 0),
    fat: total.fat + (item.fat || 0),
  }), { ...ZERO })
}

export const round = (n) => Math.round(Number(n) || 0)
export const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10
