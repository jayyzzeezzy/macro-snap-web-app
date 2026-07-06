import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

// Sign-in screen: email + password, plus a one-tap demo. On success the auth
// context stores the JWT and we head into the app.
export default function SignIn() {
  const navigate = useNavigate()
  const { user, signIn, startDemo } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Already authenticated (e.g. navigated here manually) — go to the app.
  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  async function handleDemo() {
    setSubmitting(true)
    setError('')
    try {
      await startDemo()
      navigate('/')
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="screen auth">
      <header className="screen__header">
        <h1>Sign in</h1>
      </header>

      {error && <p className="error">{error}</p>}

      <form className="auth__form" onSubmit={handleSubmit}>
        <label className="auth__field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="auth__field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button className="btn btn--primary btn--block" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <button
        className="btn btn--ghost btn--block"
        type="button"
        onClick={() => navigate('/signup')}
        disabled={submitting}
      >
        Create an account
      </button>

      <button
        className="btn btn--ghost btn--block"
        type="button"
        onClick={handleDemo}
        disabled={submitting}
      >
        Try the demo
      </button>
    </div>
  )
}
