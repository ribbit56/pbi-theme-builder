import { X } from 'lucide-react'

// ── Color wheel helpers ──────────────────────────────────────────────────────

// Convert hue angle (0° = top, clockwise) to SVG x/y
function xy(cx, cy, r, deg) {
  const rad = (deg - 90) * Math.PI / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

// Donut sector path between two radii and two angles
function donutSector(cx, cy, r1, r2, a1, a2) {
  const [ax, ay] = xy(cx, cy, r2, a1)
  const [bx, by] = xy(cx, cy, r2, a2)
  const [cx2, cy2] = xy(cx, cy, r1, a2)
  const [dx, dy] = xy(cx, cy, r1, a1)
  const large = a2 - a1 > 180 ? 1 : 0
  return `M${ax},${ay} A${r2},${r2} 0 ${large} 1 ${bx},${by} L${cx2},${cy2} A${r1},${r1} 0 ${large} 0 ${dx},${dy} Z`
}

// 12 hue colors for the wheel (30° steps)
const HUE_COLORS = [
  '#FF0000','#FF8000','#FFFF00','#80FF00',
  '#00FF00','#00FF80','#00FFFF','#0080FF',
  '#0000FF','#8000FF','#FF00FF','#FF0080',
]

function ColorWheel({ markers, size = 120 }) {
  const cx = size / 2
  const cy = size / 2
  const outerR = size * 0.46
  const innerR = size * 0.24
  const markerR = size * 0.35
  const dotR = size * 0.045

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Hue ring */}
      {HUE_COLORS.map((color, i) => (
        <path
          key={i}
          d={donutSector(cx, cy, innerR, outerR, i * 30, (i + 1) * 30)}
          fill={color}
        />
      ))}
      {/* White inner circle */}
      <circle cx={cx} cy={cy} r={innerR - 1} fill="white" fillOpacity={0.15} />

      {/* Connection lines */}
      {markers.length > 1 && markers.map((m, i) => {
        const next = markers[(i + 1) % markers.length]
        if (i === markers.length - 1) return null
        const [x1, y1] = xy(cx, cy, markerR, m.angle)
        const [x2, y2] = xy(cx, cy, markerR, next.angle)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth={1.5} strokeOpacity={0.8} />
      })}

      {/* Marker dots */}
      {markers.map((m, i) => {
        const [mx, my] = xy(cx, cy, markerR, m.angle)
        return (
          <g key={i}>
            <circle cx={mx} cy={my} r={dotR + 1.5} fill="white" />
            <circle cx={mx} cy={my} r={dotR} fill={m.color} />
          </g>
        )
      })}
    </svg>
  )
}

function Swatches({ colors }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {colors.map((c, i) => (
        <div key={i} title={c.toUpperCase()}
          className="w-7 h-7 rounded-md border flex-shrink-0"
          style={{ background: c, borderColor: 'rgba(0,0,0,0.1)' }}
        />
      ))}
    </div>
  )
}

// ── Harmony definitions ──────────────────────────────────────────────────────

const HARMONIES = [
  {
    name: 'Analogous',
    tagline: 'Colors that live next to each other on the wheel',
    description:
      'Analogous palettes use hues within about 60° of each other. They feel natural and cohesive — like a sunset or a forest — because they share a common temperature.',
    when: 'Use when you want harmony and calm. Great for reports where the visuals should feel unified and not compete with each other.',
    markers: [
      { angle: 180, color: '#06b6d4' },
      { angle: 210, color: '#2563eb' },
      { angle: 240, color: '#7c3aed' },
    ],
    colors: ['#06b6d4', '#0ea5e9', '#2563eb', '#3b82f6', '#6366f1', '#7c3aed', '#8b5cf6', '#a855f7'],
    accent: '#2563eb',
  },
  {
    name: 'Triadic',
    tagline: 'Three hues spaced evenly 120° apart',
    description:
      'Triadic schemes use three colors equally spaced around the wheel. The result is vibrant and balanced — each hue contrasts with the others without being complementary opposites.',
    when: 'Use when you need visual variety and energy. Good for multi-series charts where each series needs to stand out clearly.',
    markers: [
      { angle: 210, color: '#2563eb' },
      { angle: 330, color: '#dc2626' },
      { angle:  90, color: '#16a34a' },
    ],
    colors: ['#2563eb', '#dc2626', '#16a34a', '#3b82f6', '#ef4444', '#22c55e', '#1d4ed8', '#b91c1c'],
    accent: '#dc2626',
  },
  {
    name: 'Split-Complementary',
    tagline: 'A safer take on complementary contrast',
    description:
      'Instead of using the direct opposite (complement) of your seed color, split-complementary takes the two hues on either side of that complement. You get strong contrast with less visual tension.',
    when: 'Use when you want contrast but complementary feels too harsh. A good balance between bold and approachable.',
    markers: [
      { angle: 210, color: '#2563eb' },
      { angle:  15, color: '#ea580c' },
      { angle:  45, color: '#ca8a04' },
    ],
    colors: ['#2563eb', '#ea580c', '#ca8a04', '#3b82f6', '#f97316', '#eab308', '#1d4ed8', '#c2410c'],
    accent: '#ea580c',
  },
  {
    name: 'Tetradic',
    tagline: 'Four colors forming a rectangle on the wheel',
    description:
      'Tetradic (or double-complementary) palettes use two complementary pairs. This gives you the widest hue variety of any scheme, but requires careful balancing — dominant and accent roles matter.',
    when: 'Use when you have many series and need maximum differentiation. Works best when one color is dominant and the others are accents.',
    markers: [
      { angle: 210, color: '#2563eb' },
      { angle: 300, color: '#9333ea' },
      { angle:  30, color: '#ea580c' },
      { angle: 120, color: '#16a34a' },
    ],
    colors: ['#2563eb', '#9333ea', '#ea580c', '#16a34a', '#3b82f6', '#a855f7', '#f97316', '#22c55e'],
    accent: '#9333ea',
  },
  {
    name: 'Monochromatic',
    tagline: 'One hue, many shades and tints',
    description:
      'Monochromatic palettes use a single hue across a range of lightness and saturation values. The result is highly polished and elegant, though differentiation between series relies entirely on value contrast.',
    when: 'Use for branded, single-color report themes. Also excellent for conditional formatting scales and heatmaps.',
    markers: [
      { angle: 210, color: '#2563eb' },
    ],
    colors: ['#1e3a8a', '#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
    accent: '#2563eb',
  },
]

// ── Modal ────────────────────────────────────────────────────────────────────

export default function ColorTheoryModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          <div>
            <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>Color Theory Guide</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Understanding the harmony types available in the generator
            </p>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:opacity-70 transition-colors"
            style={{ color: 'var(--text-secondary)', background: 'var(--surface)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-2">

          {/* Intro */}
          <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            A color wheel arranges hues around a circle. The relationship between the hues you pick — how far apart they are, how many you choose — determines the "feel" of your palette. Each harmony type below is a different way of selecting hues from that circle.
          </p>

          {/* Harmony cards */}
          {HARMONIES.map(({ name, tagline, description, when, markers, colors, accent }) => (
            <div key={name} className="rounded-xl border overflow-hidden mb-4"
              style={{ borderColor: 'var(--border)' }}>

              {/* Card header strip */}
              <div className="px-4 py-2 flex items-center gap-2"
                style={{ background: accent + '18', borderBottom: `1px solid ${accent}30` }}>
                <span className="text-sm font-semibold" style={{ color: accent }}>{name}</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>— {tagline}</span>
              </div>

              {/* Card body */}
              <div className="p-4 flex gap-5 items-start" style={{ background: 'var(--surface)' }}>
                {/* Color wheel */}
                <div className="flex-shrink-0">
                  <ColorWheel markers={markers} size={110} />
                </div>

                {/* Text + swatches */}
                <div className="flex-1 space-y-3 min-w-0">
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {description}
                  </p>

                  {/* Example palette */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest mb-1.5"
                      style={{ color: 'var(--text-secondary)' }}>Example palette</p>
                    <Swatches colors={colors} />
                  </div>

                  {/* When to use */}
                  <div className="rounded-lg px-3 py-2" style={{ background: accent + '12' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: accent }}>
                      When to use
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{when}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <p className="text-[11px] text-center pb-1" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
            Tip: use the Harmony Generator to preview any of these schemes live with your own seed color.
          </p>
        </div>
      </div>
    </div>
  )
}
