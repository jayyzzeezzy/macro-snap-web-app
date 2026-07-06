import { Routes, Route, Navigate } from 'react-router-dom'
import { MealDraftProvider } from './state/MealDraft'
import Capture from './screens/Capture'
import Results from './screens/Results'
import Dashboard from './screens/Dashboard'
import SignIn from './screens/SignIn'
import SignUp from './screens/SignUp'
import './App.css'

export default function App() {
  return (
    <MealDraftProvider>
      <div className="app">
        <Routes>
          <Route path="/" element={<Capture />} />
          <Route path="/results" element={<Results />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </MealDraftProvider>
  )
}
