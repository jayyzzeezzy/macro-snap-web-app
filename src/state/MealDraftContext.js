import { createContext, useContext } from 'react'

export const MealDraftContext = createContext(null)

export function useMealDraft() {
  const ctx = useContext(MealDraftContext)
  if (!ctx) throw new Error('useMealDraft must be used within MealDraftProvider')
  return ctx
}
