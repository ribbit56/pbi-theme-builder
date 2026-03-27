import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { validateHex, normaliseHexInput, getContrast, toRgbParts } from '../utils/colorHelpers.js'

/**
 * Inline color picker: native <input type="color"> synced with a hex text input.
 *
 * Props:
 *   value        — current hex string
 *   onChange     — called with a valid hex string when the value changes
 *   label        — optional label shown above the inputs
 *   contrastWith — optional hex string; shows a contrast warning if ratio < 4.5
 */
export default function ColorPicker({ value, onChange, label, contrastWith }) {
  // Local state so we can show invalid input without immediately resetting
  const [localHex, setLocalHex] = useState(value)
  const [isInvalid, setIsInvalid] = useState(false)

  // Sync from parent when value changes externally
  useEffect(() => {
    setLocalHex(value)
    setIsInvalid(false)
  }, [value])

  const handleNativeChange = (e) => {
    // Native color input always produces a valid lowercase hex
    const hex = e.target.value
    setLocalHex(hex)
    setIsInvalid(false)
    onChange(hex)
  }

  const handleTextChange = (e) => {
    const raw = normaliseHexInput(e.target.value)
    setLocalHex(raw)
    if (validateHex(raw)) {
      setIsInvalid(false)
      onChange(raw)
    } else {
      setIsInvalid(true)
    }
  }

  const rgb = toRgbParts(value)
  const contrastRatio = contrastWith ? getContrast(value, contrastWith) : null
  const showContrastWarning = contrastRatio !== null && contrastRatio < 4.5

  return (
    <div className="space-y-2">
      {label && (
        <label style={{ color: 'var(--text-secondary)' }} className="block text-xs font-medium uppercase tracking-wide">
          {label}
        </label>
      )}

      <div className="flex items-center gap-3">
        {/* Native color wheel — styled to look like a square button */}
        <div className="relative w-10 h-10 rounded-lg overflow-hidden border-2 flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}>
          <input
            type="color"
            value={validateHex(localHex) ? localHex : '#000000'}
            onChange={handleNativeChange}
            className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer opacity-0"
            style={{ cursor: 'pointer' }}
            title="Open color picker"
          />
          <div
            className="w-full h-full rounded-lg"
            style={{ background: validateHex(localHex) ? localHex : value }}
          />
          <input
            type="color"
            value={validateHex(localHex) ? localHex : '#000000'}
            onChange={handleNativeChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="flex-1 space-y-1">
          {/* Hex text input */}
          <input
            type="text"
            value={localHex}
            onChange={handleTextChange}
            maxLength={7}
            spellCheck={false}
            placeholder="#RRGGBB"
            style={{
              background: 'var(--surface-2)',
              border: `1px solid ${isInvalid ? '#ef4444' : 'var(--border)'}`,
              color: 'var(--text-primary)',
              outline: isInvalid ? '2px solid #ef444440' : 'none',
            }}
            className="w-full px-2 py-1 rounded text-sm font-mono transition-colors"
          />

          {/* RGB display */}
          <div style={{ color: 'var(--text-secondary)' }} className="text-xs font-mono">
            {rgb.r}, {rgb.g}, {rgb.b}
          </div>
        </div>
      </div>

      {/* Contrast warning */}
      {showContrastWarning && (
        <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md"
          style={{ background: '#f59e0b20', color: '#b45309' }}>
          <AlertTriangle size={12} />
          <span>Low contrast ({contrastRatio.toFixed(1)}:1 — AA requires 4.5:1)</span>
        </div>
      )}

      {isInvalid && (
        <p className="text-xs" style={{ color: '#ef4444' }}>
          Enter a valid hex color like #3A7BD5
        </p>
      )}
    </div>
  )
}
