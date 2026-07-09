import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

// Landing page for the "Continue with Google" redirect. The backend sends the
// JWT back in the URL fragment (#token=...); we store it, load the session, and
// head into the app. On failure the backend redirects to /login instead.
export default function AuthCallback() {
  const navigate = useNavigate()
  const { completeOAuthLogin } = useAuth()
  const [failed, setFailed] = useState(false)
  const ran = useRef(false)

  useEffect(() => {
    // Guard against React StrictMode's double-invoke consuming the token twice.
    if (ran.current) return
    ran.current = true

    const params = new URLSearchParams(window.location.hash.slice(1))
    const token = params.get('token')
    // Strip the token from the URL so it isn't left in history.
    window.history.replaceState({}, '', '/auth/callback')

    if (!token) {
      navigate('/signin', { replace: true })
      return
    }

    completeOAuthLogin(token)
      .then((user) => {
        navigate(user ? '/dashboard' : '/signin', { replace: true })
      })
      .catch(() => setFailed(true))
  }, [completeOAuthLogin, navigate])

  return (
    <div className="screen auth">
      {failed ? (
        <>
          <p className="error">Couldn’t complete Google sign-in. Please try again.</p>
          <button className="btn btn--primary btn--block" onClick={() => navigate('/signin', { replace: true })}>
            Back to sign in
          </button>
        </>
      ) : (
        <p className="muted muted--center">Signing you in…</p>
      )}
    </div>
  )
}
