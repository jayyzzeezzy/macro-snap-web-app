import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './state/Auth'
import { MealDraftProvider } from './state/MealDraft'
import RequireAuth from './components/RequireAuth'
import Capture from './screens/Capture'
import Results from './screens/Results'
import Dashboard from './screens/Dashboard'
import SignIn from './screens/SignIn'
import SignUp from './screens/SignUp'
import AuthCallback from './screens/AuthCallback'
import Settings from './screens/Settings'
import './App.css'

export default function App() {
  return (
    <MealDraftProvider>
      <AuthProvider>
        <div className="app">
          <Routes>
            {/* Public */}
            <Route path="/signin" element={<SignIn />} />
            {/* Backend redirects failed Google logins to /login?error=... */}
            <Route path="/login" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected */}
            <Route element={<RequireAuth />}>
              <Route path="/" element={<Capture />} />
              <Route path="/results" element={<Results />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </MealDraftProvider>
  )
}
