import { useState, useMemo } from 'react'
import { Wand2, Copy, Check } from 'lucide-react'
import { generateHarmony } from '../utils/colorHelpers'

const HARMONY_TYPES = [
  { value: 'analogous',            label: 'Analogous' },
  { value: 'triadic',              label: 'Triadic' },
  { value: 'split-complementary', label: 'Split-Comp' },
  { value: 'tetradic',            label: 'Tetradic' },
  { value: 'monochromatic',       label: 'Mono' },
]

export default function HarmonyGenerator({ onApply }) {
  const [seed, setSeed] = useState('#118DFF')
  const [type, setType] = useState('analogous')
  const [copiedHex, setCopiedHex] = useState(null)

  const colors = useMemo(() => generateHarmony(seed, type), [seed, type])

  const copyHex = (hex, e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(hex.toUpperCase())
    setCopiedHex(hex)
    setTimeout(() => setCopiedHex(h => h === hex ? null : h), 1500)
  }

  return (
    <div className="flex gap-4 h-full">

      {/* Left: controls */}
      <div className="w-96 flex-shrink-0 flex flex-col gap-5">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            Seed Color
          </h3>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={seed}
              onChange={e => setSeed(e.target.value)}
              className="w-9 h-9 rounded-lg border cursor-pointer p-0.5"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            />
            <code className="text-sm font-mono font-medium" style={{ color: 'var(--text)' }}>
              {seed.toUpperCase()}
            </code>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            Harmony Type
          </h3>
          <div className="flex gap-1.5 flex-wrap">
            {HARMONY_TYPES.map(h => (
              <button
                key={h.value}
                onClick={() => setType(h.value)}
                className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                style={{
                  background: type === h.value ? 'var(--accent)' : 'var(--surface-2)',
                  color:      type === h.value ? '#fff' : 'var(--text-secondary)',
                  border:     '1px solid var(--border)',
                }}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onApply(colors)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:opacity-80 w-fit"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <Wand2 size={12} />
          Apply to series colors
        </button>
      </div>

      {/* Right: 4×2 color swatch grid */}
      <div className="flex-1 min-h-0 flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
          Generated Colors
        </h3>
        <div className="grid grid-cols-4 grid-rows-2 gap-2 flex-1 min-h-0">
          {colors.map((hex, i) => (
            <div
              key={i}
              className="flex flex-col rounded-xl overflow-hidden border"
              style={{
                borderColor: 'rgba(0,0,0,0.08)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              {/* Color block */}
              <div
                className="flex-1 min-h-0"
                style={{ background: hex }}
              />
              {/* Hex label + copy */}
              <div className="flex items-center justify-between px-1.5 pt-1 pb-1.5 flex-shrink-0" style={{ background: 'var(--surface-2)' }}>
                <span className="text-[11px] font-mono font-medium leading-none truncate" style={{ color: 'var(--text)' }}>
                  {hex.toUpperCase()}
                </span>
                <button
                  onClick={e => copyHex(hex, e)}
                  title="Copy hex"
                  className="flex-shrink-0 rounded transition-colors hover:opacity-70"
                  style={{ color: copiedHex === hex ? '#16a34a' : 'var(--text-secondary)' }}
                >
                  {copiedHex === hex ? <Check size={11} /> : <Copy size={11} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
