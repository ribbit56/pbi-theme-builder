import { useState } from 'react'
import { Download, AlertCircle, X, CheckCircle } from 'lucide-react'
import { buildTheme } from '../utils/themeBuilder.js'

/**
 * Builds and triggers a JSON file download of the Power BI theme.
 * Catches validation errors from buildTheme and shows them inline.
 * Never downloads a file when validation fails.
 */
export default function ExportButton({ getState }) {
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleExport = () => {
    setError(null)
    setSuccess(false)

    try {
      const state = getState()
      const themeObject = buildTheme(state)
      const json = JSON.stringify(themeObject, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `${state.name.replace(/\s+/g, '-').toLowerCase()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
        style={{
          background: success ? '#16a34a' : 'var(--accent)',
          color: 'white',
        }}
      >
        {success ? <CheckCircle size={15} /> : <Download size={15} />}
        {success ? 'Exported!' : 'Export JSON'}
      </button>

      {error && (
        <div
          className="absolute right-0 top-full mt-2 z-50 w-80 p-4 rounded-xl border shadow-xl"
          style={{ background: 'var(--surface)', borderColor: '#ef4444' }}
        >
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold mb-1" style={{ color: '#ef4444' }}>Export failed</p>
              <pre className="text-xs whitespace-pre-wrap break-words" style={{ color: 'var(--text-secondary)' }}>
                {error}
              </pre>
            </div>
            <button
              onClick={() => setError(null)}
              style={{ color: 'var(--text-secondary)' }}
              className="flex-shrink-0 hover:opacity-70"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
