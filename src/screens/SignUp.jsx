import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

// Sign-up screen for new users: email + password. Signup logs the user in
// (returns a token), so on success we drop them straight into the app.
export default function SignUp() {
  const navigate = useNavigate()
  const { user, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Already authenticated — no need to register.
  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      // Signup issues a token and logs the user in, so go straight to the app.
      await signUp(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="screen auth">
      <header className="screen__header">
        <h1>Create account</h1>
        <Link to="/signin" className="link">← Back</Link>
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <small className="muted">
            8–50 characters with an uppercase letter, a lowercase letter, a number,
            and a special character.
          </small>
        </label>

        <button className="btn btn--primary btn--block" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="auth__alt muted">
        Already have an account? <Link to="/signin" className="link">Sign in</Link>
      </p>
    </div>
  )
}
