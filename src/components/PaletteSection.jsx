import { useState } from 'react'
import { Shuffle } from 'lucide-react'
import ColorSwatch from './ColorSwatch.jsx'
import ColorPicker from './ColorPicker.jsx'
import { buildDivergingScale } from '../utils/colorHelpers.js'
import { COLOR_ROLE_GROUPS } from '../utils/constants.js'

/**
 * Full palette editor grouped into three sections:
 * 1. Series Colors (8 dataColors)
 * 2. Background & Text
 * 3. Diverging Scale
 *
 * Click a swatch to open an inline ColorPicker accordion.
 * Only one picker is open at a time.
 */
export default function PaletteSection({ state, dispatch }) {
  // activeKey: 'data-0'...'data-7', or a role key like 'background', or null
  const [activeKey, setActiveKey] = useState(null)

  const toggle = (key) => setActiveKey(prev => prev === key ? null : key)

  return (
    <div className="space-y-6">
      <h3 style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold uppercase tracking-widest">
        Color Palette
      </h3>

      {/* ── Series Colors ─────────────────────────── */}
      <Section
        label="Series Colors"
        description="8 colors used for chart series"
        action={
          <button
            title="Shuffle series colors"
            onClick={() => {
              const shuffled = [...state.dataColors].sort(() => Math.random() - 0.5)
              dispatch({ type: 'SET_ALL_DATA_COLORS', payload: shuffled })
            }}
            className="p-1 rounded-md transition-colors hover:opacity-70"
            style={{ color: 'var(--text-secondary)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <Shuffle size={12} />
          </button>
        }
      >
        <div className="grid grid-cols-8 gap-2">
          {state.dataColors.map((color, i) => {
            const key = `data-${i}`
            const isLight = (() => {
              const r = parseInt(color.slice(1,3),16)/255
              const g = parseInt(color.slice(3,5),16)/255
              const b = parseInt(color.slice(5,7),16)/255
              return 0.2126*r + 0.7152*g + 0.0722*b > 0.55
            })()
            return (
              <div key={key} className="flex flex-col gap-1">
                <button
                  onClick={() => toggle(key)}
                  title={`Edit series ${i + 1}`}
                  className="w-full h-20 rounded-xl border relative transition-transform hover:scale-[1.03]"
                  style={{
                    background: color,
                    borderColor: activeKey === key ? 'var(--accent)' : 'rgba(0,0,0,0.08)',
                    boxShadow: activeKey === key ? '0 0 0 2px var(--accent)' : '0 1px 3px rgba(0,0,0,0.08)',
                  }}
                >
                  <span
                    className="absolute top-1.5 left-0 right-0 text-center text-[11px] font-bold"
                    style={{ color: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)' }}
                  >
                    {i + 1}
                  </span>
                </button>
                <div className="text-[10px] font-mono leading-none truncate text-center" style={{ color: 'var(--text-secondary)' }}>
                  {color.toUpperCase()}
                </div>
              </div>
            )
          })}
        </div>

        {/* Color picker — shown below the row when a swatch is active */}
        {activeKey?.startsWith('data-') && (() => {
          const i = parseInt(activeKey.split('-')[1])
          return (
            <div className="mt-2 p-3 rounded-xl border shadow-lg"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <ColorPicker
                value={state.dataColors[i]}
                onChange={hex => dispatch({ type: 'SET_DATA_COLOR', payload: { index: i, value: hex } })}
                label={`Series ${i + 1}`}
              />
            </div>
          )
        })()}
      </Section>

      {/* ── Background & Text ─────────────────────── */}
      <Section label="Background & Text">
        <div className="grid grid-cols-2 gap-4">
          {COLOR_ROLE_GROUPS[1].roles.map(({ key, label }) => {
            const color = state[key]
            return (
              <div key={key} className="space-y-2">
                <ColorSwatch
                  color={color}
                  label={label}
                  onEdit={() => toggle(key)}
                />
                {activeKey === key && (
                  <div className="col-span-2 p-3 rounded-xl border shadow-lg"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <ColorPicker
                      value={color}
                      onChange={(hex) =>
                        dispatch({ type: 'SET_ROLE_COLOR', payload: { role: key, value: hex } })
                      }
                      label={label}
                      contrastWith={key === 'foreground' ? state.background : key === 'background' ? state.foreground : undefined}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Section>

      {/* ── Diverging Scale ───────────────────────── */}
      <Section label="Diverging Scale" description="Min → Center → Max">
        {/* Gradient preview bar */}
        <DivergingGradientBar min={state.minimum} center={state.center} max={state.maximum} />

        <div className="flex justify-between mt-3">
          {COLOR_ROLE_GROUPS[2].roles.map(({ key, label }) => {
            const color = state[key]
            return (
              <div key={key} className="space-y-2">
                <ColorSwatch
                  color={color}
                  label={label}
                  size="sm"
                  onEdit={() => toggle(key)}
                />
                {activeKey === key && (
                  <div className="w-56 p-3 rounded-xl border shadow-lg"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <ColorPicker
                      value={color}
                      onChange={(hex) =>
                        dispatch({ type: 'SET_ROLE_COLOR', payload: { role: key, value: hex } })
                      }
                      label={label}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}

function Section({ label, description, action, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">{label}</h4>
          {description && (
            <p style={{ color: 'var(--text-secondary)' }} className="text-xs mt-0.5">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function DivergingGradientBar({ min, center, max }) {
  const scale = buildDivergingScale(min, center, max, 11)
  if (!scale.length) return null

  return (
    <div className="flex h-5 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
      {scale.map((color, i) => (
        <div key={i} className="flex-1" style={{ background: color }} />
      ))}
    </div>
  )
}
