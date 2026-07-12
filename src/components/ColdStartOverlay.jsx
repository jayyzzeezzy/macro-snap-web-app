import { useEffect, useState } from 'react'
import { onSlowRequest } from '../lib/api'

// Full-screen notice shown when a request is taking unusually long — typically
// the backend cold-starting on a free host. Subscribes to the api client's
// slow-request signal so it covers every call (login, demo, analyze, /me…).
export default function ColdStartOverlay() {
  const [waking, setWaking] = useState(false)

  useEffect(() => onSlowRequest(setWaking), [])

  if (!waking) return null

  return (
    <div className="cold-start" role="status" aria-live="polite">
      <div className="cold-start__box">
        <div className="spinner" aria-hidden="true" />
        <p className="cold-start__title">Waking up the server…</p>
        <p className="muted muted--center">
          Sorry, this is taking longer than usual. Hang tight.
        </p>
      </div>
    </div>
  )
}
