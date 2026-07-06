import { useMemo } from 'react'
import { meals as mealsApi } from '../lib/api'
import { addDemoMeal, listDemoMeals, dailyDemoMeals } from '../lib/demoMeals'
import { useAuth } from './AuthContext'

// Meals data access that transparently swaps the server API for the
// localStorage-backed demo store when the current user is the demo user.
// Both branches return the same shapes, so screens stay identical.
export function useMeals() {
  const { isDemo } = useAuth()
  return useMemo(
    () =>
      isDemo
        ? {
            create: (items) => Promise.resolve(addDemoMeal(items)),
            list: () => Promise.resolve(listDemoMeals()),
            daily: (date) => Promise.resolve(dailyDemoMeals(date)),
          }
        : mealsApi,
    [isDemo]
  )
}
