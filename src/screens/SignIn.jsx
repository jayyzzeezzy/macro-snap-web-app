import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signin } from '../lib/api'

// Sign-in screen: email + password. No session/persistence yet — this just
// posts the credentials and surfaces any error from the backend.
export default function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await signin({ email, password })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="screen auth">
      <header className="screen__header">
        <h1>Sign in</h1>
        <Link to="/" className="link">← Back</Link>
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
        onClick={() => navigate('/')}
        disabled={submitting}
      >
        Try the demo
      </button>
    </div>
  )
}
