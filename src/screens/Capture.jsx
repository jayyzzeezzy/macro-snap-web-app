import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { food } from '../lib/api'
import { fileToBase64 } from '../lib/image'
import { useMealDraft } from '../state/MealDraftContext'

// Screen 1: snap or upload a food photo, then analyze it.
export default function Capture() {
  const navigate = useNavigate()
  const { setDraft } = useMealDraft()
  const cameraInput = useRef(null)
  const uploadInput = useRef(null)

  const [preview, setPreview] = useState(null) // { dataUrl, base64, mimeType }
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file) return
    setError('')
    try {
      const img = await fileToBase64(file)
      setPreview(img)
    } catch (err) {
      setError(err.message)
    }
  }

  async function analyze() {
    if (!preview) return
    setAnalyzing(true)
    setError('')
    try {
      const data = await food.analyzeBase64(preview.base64, preview.mimeType)
      setDraft({ items: data.items || [], totals: data.totals, preview: preview.dataUrl })
      navigate('/results')
    } catch (err) {
      setError(err.message)
      setAnalyzing(false)
    }
  }

  return (
    <div className="screen capture">
      <header className="screen__header">
        <h1>MacroSnap</h1>
        <Link to="/dashboard" className="link">Today →</Link>
      </header>

      <div className="capture__stage">
        {preview ? (
          <img className="capture__preview" src={preview.dataUrl} alt="Selected food" />
        ) : (
          <div className="capture__placeholder">
            <span className="capture__placeholder-icon" aria-hidden="true">🍽️</span>
            <p>Snap your meal to track its macros</p>
          </div>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {/* Hidden inputs: one opens the camera, one opens the file picker. */}
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleFile}
      />
      <input
        ref={uploadInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
        hidden
        onChange={handleFile}
      />

      <div className="capture__actions">
        {preview ? (
          <>
            <button className="btn btn--primary btn--block" onClick={analyze} disabled={analyzing}>
              {analyzing ? 'Analyzing…' : 'Analyze meal'}
            </button>
            <button
              className="btn btn--ghost btn--block"
              onClick={() => setPreview(null)}
              disabled={analyzing}
            >
              Choose a different photo
            </button>
          </>
        ) : (
          <>
            <button className="btn btn--primary btn--block" onClick={() => cameraInput.current?.click()}>
              📷 Take photo
            </button>
            <button className="btn btn--ghost btn--block" onClick={() => uploadInput.current?.click()}>
              Upload from library
            </button>
          </>
        )}
      </div>
    </div>
  )
}
