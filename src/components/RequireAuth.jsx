import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

// Gate for the authenticated app: waits for the on-load session check, then
// either renders the protected screens (with an account bar) or redirects to
// sign-in. Also surfaces sign-out and a demo-mode notice.
export default function RequireAuth() {
  const { user, loading, isDemo, signOut } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="screen">
        <p className="muted muted--center">Loading…</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/signin" replace />

  function handleSignOut() {
    signOut()
    navigate('/signin', { replace: true })
  }

  return (
    <>
      <div className="account-bar">
        <span className="account-bar__user">
          {isDemo ? 'Demo mode' : user.email}
        </span>
        <button className="link link--small" onClick={handleSignOut}>
          {isDemo ? 'Exit demo' : 'Sign out'}
        </button>
      </div>
      {isDemo && (
        <p className="demo-banner">
          You’re exploring in demo mode — meals are saved only on this device.
        </p>
      )}
      <Outlet />
    </>
  )
}
