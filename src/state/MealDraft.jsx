// Holds the in-progress meal between the Capture and Results screens.
// The hook lives in MealDraftContext.js so this file only exports a component
// (keeps React Fast Refresh happy).
import { useState } from 'react'
import { MealDraftContext } from './MealDraftContext'

export function MealDraftProvider({ children }) {
  // draft: { items, totals, preview } | null
  const [draft, setDraft] = useState(null)
  const clearDraft = () => setDraft(null)
  return (
    <MealDraftContext.Provider value={{ draft, setDraft, clearDraft }}>
      {children}
    </MealDraftContext.Provider>
  )
}
