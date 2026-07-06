import { useCallback, useEffect, useState } from 'react'
import { auth, setOnUnauthorized } from '../lib/api'
import { clearDemoMeals } from '../lib/demoMeals'
import { useMealDraft } from './MealDraftContext'
import { AuthContext } from './AuthContext'

// Holds the authenticated user and the session lifecycle. On mount it restores
// the session by validating any stored token against /api/auth/me.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { clearDraft } = useMealDraft()

  useEffect(() => {
    // A protected 401 means the session is dead. The API client has already
    // cleared the token; drop the user (guards redirect to sign-in) and discard
    // any in-progress meal draft so it can't leak into the next session.
    setOnUnauthorized(() => {
      setUser(null)
      clearDraft()
    })
  }, [clearDraft])

  useEffect(() => {
    // Restore session from a stored token on load.
    let active = true
    auth
      .me()
      .catch(() => null)
      .then((u) => {
        if (!active) return
        setUser(u)
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    const u = await auth.signin(email, password)
    setUser(u)
    return u
  }, [])

  const signUp = useCallback(async (email, password) => {
    const u = await auth.signup(email, password)
    setUser(u)
    return u
  }, [])

  const startDemo = useCallback(async () => {
    clearDemoMeals() // start each demo fresh, not with a previous demo's meals
    const u = await auth.demo()
    setUser(u)
    return u
  }, [])

  const signOut = useCallback(() => {
    auth.signout()
    clearDemoMeals() // demo data only ever lived on this device
    clearDraft() // don't carry an unsaved meal into the next session
    setUser(null)
  }, [clearDraft])

  const value = {
    user,
    loading,
    isDemo: !!user?.isDemo,
    signIn,
    signUp,
    startDemo,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
