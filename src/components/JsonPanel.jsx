import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react'
import { buildTheme } from '../utils/themeBuilder'

export default function JsonPanel({ state }) {
  const [isOpen, setIsOpen]   = useState(false)
  const [copied, setCopied]   = useState(false)

  const json = useMemo(() => {
    try {
      return JSON.stringify(buildTheme(state), null, 2)
    } catch (e) {
      return `// Validation error: ${e.message}`
    }
  }, [state])

  const handleCopy = () => {
    navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>

      {/* Header / toggle */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:opacity-80"
        style={{ background: 'var(--surface-2)' }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-secondary)' }}
        >
          Raw JSON
        </span>
        {isOpen
          ? <ChevronDown  size={14} style={{ color: 'var(--text-secondary)' }} />
          : <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />
        }
      </button>

      {isOpen && (
        <div style={{ background: 'var(--surface)' }}>
          {/* Toolbar */}
          <div
            className="flex justify-end px-3 py-2 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors hover:opacity-80"
              style={{
                background: copied ? '#16a34a' : 'var(--surface-2)',
                color:      copied ? '#fff'     : 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* JSON code block */}
          <pre
            className="p-4 text-xs overflow-x-auto"
            style={{
              color:      'var(--text-secondary)',
              fontFamily: 'Consolas, "Courier New", monospace',
              maxHeight:  '380px',
              overflowY:  'auto',
              lineHeight: '1.6',
            }}
          >
            {json}
          </pre>
        </div>
      )}
    </div>
  )
}
