import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

// Account settings. Currently just "Set a password" for Google/passwordless
// accounts (hasPassword === false), so they can also log in with email.
export default function Settings() {
  const { user, isDemo, setPassword } = useAuth()
  const [password, setPasswordValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const hasPassword = !!user?.hasPassword

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await setPassword(password)
      setDone(true)
      setPasswordValue('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="screen auth">
      <header className="screen__header">
        <h1>Settings</h1>
        <Link to="/dashboard" className="link">← Back</Link>
      </header>

      <section className="card">
        <div className="card__head">
          <h2>Password</h2>
        </div>

        {isDemo ? (
          <p className="muted">Demo accounts can’t set a password.</p>
        ) : done || hasPassword ? (
          <p className="muted">
            {done
              ? 'Password set. You can now sign in with your email and password.'
              : 'You already have a password set for this account.'}
          </p>
        ) : (
          <>
            <p className="muted">
              Add a password so you can sign in with your email as well as Google.
            </p>
            {error && <p className="error">{error}</p>}
            <form className="auth__form" onSubmit={handleSubmit}>
              <label className="auth__field">
                <span>New password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  required
                />
                <small className="muted">
                  8–50 characters with an uppercase letter, a lowercase letter, a
                  number, and a special character.
                </small>
              </label>
              <button className="btn btn--primary btn--block" type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Set password'}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
