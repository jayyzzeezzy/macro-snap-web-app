import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../lib/api'

// Sign-up screen for new users: email + password. No session/persistence yet —
// on success we send the user to the sign-in page to log in.
export default function SignUp() {
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
      await signup({ email, password })
      navigate('/signin')
    } catch (err) {
      setError(err.message)
    } finally {
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
