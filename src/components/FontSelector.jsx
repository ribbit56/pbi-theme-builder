import { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { FONT_LIST, TEXT_CLASS_LABELS } from '../utils/constants.js'
import { useFontLoader } from '../hooks/useFontLoader.js'
import ColorPicker from './ColorPicker.jsx'

/**
 * Font selector for one Power BI text class.
 * Shows a searchable custom listbox with each option rendered in its own typeface.
 *
 * Props:
 *   textClass  — 'callout' | 'title' | 'header' | 'label'
 *   value      — { fontFace, fontSize, fontColor }
 *   onChange   — callback({ fontFace?, fontSize?, fontColor? })
 */
export default function FontSelector({ textClass, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { loadFont } = useFontLoader()
  const dropdownRef = useRef(null)

  // Load the currently selected font on mount / when it changes
  useEffect(() => {
    if (value.fontFace) loadFont(value.fontFace)
  }, [value.fontFace, loadFont])

  const filtered = useMemo(() =>
    FONT_LIST.filter(f => f.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  )

  const selectFont = (fontName) => {
    loadFont(fontName)
    onChange({ fontFace: fontName })
    setIsOpen(false)
    setQuery('')
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="space-y-3 pb-4 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
      <h4 style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">
        {TEXT_CLASS_LABELS[textClass]}
      </h4>

      <div className="grid grid-cols-2 gap-3">
        {/* Font family picker */}
        <div className="col-span-2 space-y-1.5 relative" ref={dropdownRef}>
          <label style={{ color: 'var(--text-secondary)' }} className="text-xs font-medium uppercase tracking-wide block">
            Font Family
          </label>

          <button
            onClick={() => setIsOpen(o => !o)}
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontFamily: value.fontFace,
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors hover:opacity-80"
          >
            <span>{value.fontFace || 'Select font…'}</span>
            <ChevronDown size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          </button>

          {isOpen && (
            <div
              className="absolute z-50 mt-1 w-72 rounded-xl border shadow-xl overflow-hidden"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {/* Search */}
              <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <Search size={13} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search fonts…"
                  style={{ background: 'transparent', color: 'var(--text-primary)' }}
                  className="flex-1 text-sm outline-none"
                />
              </div>

              {/* Font list */}
              <div className="max-h-52 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }} className="px-3 py-4 text-sm text-center">
                    No fonts match "{query}"
                  </p>
                ) : (
                  filtered.map(font => (
                    <FontOption
                      key={font.name}
                      font={font}
                      isSelected={font.name === value.fontFace}
                      onSelect={selectFont}
                      onHover={loadFont}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Font size */}
        <div className="space-y-1.5">
          <label style={{ color: 'var(--text-secondary)' }} className="text-xs font-medium uppercase tracking-wide block">
            Size (pt)
          </label>
          <input
            type="number"
            min={6}
            max={120}
            value={value.fontSize}
            onChange={e => {
              const n = parseFloat(e.target.value)
              if (!isNaN(n) && n > 0) onChange({ fontSize: n })
            }}
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            className="w-full px-2 py-2 rounded-lg text-sm outline-none"
          />
        </div>

        {/* Font color */}
        <div className="space-y-1.5">
          <label style={{ color: 'var(--text-secondary)' }} className="text-xs font-medium uppercase tracking-wide block">
            Color
          </label>
          <ColorPicker
            value={value.fontColor}
            onChange={(hex) => onChange({ fontColor: hex })}
          />
        </div>
      </div>

      {/* Live preview */}
      <div
        className="px-3 py-2 rounded-lg border text-sm"
        style={{
          background: 'var(--surface-2)',
          borderColor: 'var(--border)',
          fontFamily: value.fontFace,
          fontSize: `${Math.min(value.fontSize, 20)}px`,
          color: value.fontColor,
        }}
      >
        The quick brown fox jumps over the lazy dog
      </div>
    </div>
  )
}

function FontOption({ font, isSelected, onSelect, onHover }) {
  return (
    <button
      onClick={() => onSelect(font.name)}
      onMouseEnter={() => onHover(font.name)}
      style={{
        background: isSelected ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
        color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
        fontFamily: font.name,
      }}
      className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--surface-2)] transition-colors"
    >
      {font.name}
    </button>
  )
}
