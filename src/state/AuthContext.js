import { createContext, useContext } from 'react'

// Lives in its own file (no component export) so React Fast Refresh stays happy,
// matching the MealDraftContext pattern.
export const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
