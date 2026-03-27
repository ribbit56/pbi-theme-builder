import { useState, useMemo } from 'react'
import { Wand2 } from 'lucide-react'
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

  const colors = useMemo(() => generateHarmony(seed, type), [seed, type])

  return (
    <div className="space-y-3">
      <h3
        className="text-sm font-semibold uppercase tracking-widest"
        style={{ color: 'var(--text-primary)' }}
      >
        Harmony Generator
      </h3>

      {/* Seed color picker */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Seed</span>
        <input
          type="color"
          value={seed}
          onChange={e => setSeed(e.target.value)}
          className="w-8 h-8 rounded-lg border cursor-pointer p-0.5"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        />
        <code className="text-xs" style={{ color: 'var(--text-secondary)' }}>{seed.toUpperCase()}</code>
      </div>

      {/* Harmony type selector */}
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

      {/* 8-color preview strip */}
      <div className="flex gap-1 rounded-lg overflow-hidden h-8">
        {colors.map((color, i) => (
          <div
            key={i}
            className="flex-1"
            style={{ background: color }}
            title={color.toUpperCase()}
          />
        ))}
      </div>

      {/* Apply button */}
      <button
        onClick={() => onApply(colors)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
        style={{ background: 'var(--accent)', color: '#fff' }}
      >
        <Wand2 size={12} />
        Apply to series colors
      </button>
    </div>
  )
}
