import { useState } from 'react'
import { Palette, RotateCcw, ImageIcon, Sliders, Type, Download } from 'lucide-react'

import { useTheme } from './hooks/useTheme.js'
import { useColorExtraction } from './hooks/useColorExtraction.js'
import { buildThemeFromColors } from './utils/colorUtils.js'
import { FONT_LIST } from './utils/constants.js'

import ThemeToggle from './components/ThemeToggle.jsx'
import ExportButton from './components/ExportButton.jsx'
import ImageUploader from './components/ImageUploader.jsx'
import ComplementarySuggestions from './components/ComplementarySuggestions.jsx'
import PaletteSection from './components/PaletteSection.jsx'
import FontSelector from './components/FontSelector.jsx'
import ThemePreview from './components/ThemePreview.jsx'
import ColorSwatch from './components/ColorSwatch.jsx'
import HarmonyGenerator from './components/HarmonyGenerator.jsx'
import JsonPanel from './components/JsonPanel.jsx'

const HEADER_HEIGHT = 56
const TAB_HEIGHT = 44

const TABS = [
  { id: 'extract', label: 'Extract',  Icon: ImageIcon },
  { id: 'colors',  label: 'Colors',   Icon: Sliders   },
  { id: 'fonts',   label: 'Fonts',    Icon: Type      },
  { id: 'export',  label: 'Export',   Icon: Download  },
]

export default function App() {
  const { state, dispatch, mode, toggleMode } = useTheme()
  const { extractedColors, isExtracting, error: extractError, extractFromFile } = useColorExtraction()

  const [activeTab, setActiveTab]       = useState('extract')
  const [previewBg, setPreviewBg]       = useState('#ffffff')
  const [globalFont, setGlobalFont]     = useState('Segoe UI')
  const [suggestionBase, setSuggestionBase] = useState(state.dataColors[0])
  const [pendingColor, setPendingColor] = useState(null)

  const handleColorSelect = (hex) => {
    setSuggestionBase(hex)
    setPendingColor(hex)
  }

  const assignToDataColor = (index) => {
    dispatch({ type: 'SET_DATA_COLOR', payload: { index, value: pendingColor } })
    setPendingColor(null)
  }

  const assignToRole = (role) => {
    dispatch({ type: 'SET_ROLE_COLOR', payload: { role, value: pendingColor } })
    setPendingColor(null)
  }

  const applyExtractedAsDataColors = () => {
    if (extractedColors.length === 0) return
    const filled = [
      ...extractedColors.slice(0, 8),
      ...state.dataColors.slice(extractedColors.length, 8),
    ]
    dispatch({ type: 'SET_ALL_DATA_COLORS', payload: filled })
  }

  const applyFontToAll = () => {
    ;['callout', 'title', 'header', 'label'].forEach(cls =>
      dispatch({ type: 'SET_TEXT_CLASS', payload: { cls, field: 'fontFace', value: globalFont } })
    )
  }

  const applyFullThemeFromImage = () => {
    if (extractedColors.length === 0) return
    const patch = buildThemeFromColors(extractedColors)
    dispatch({ type: 'APPLY_IMAGE_THEME', payload: patch })
  }

  // Height of the controls panel — 40% of space below header+tabbar
  const controlsHeight = `calc((100vh - ${HEADER_HEIGHT + TAB_HEIGHT}px) * 0.50)`

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 z-40 flex items-center gap-3 px-5 border-b"
        style={{
          height: HEADER_HEIGHT,
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'var(--accent)' }}>
            <Palette size={12} color="white" />
          </div>
          <span className="font-semibold text-sm hidden sm:block"
            style={{ color: 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif' }}>
            PBI Theme Builder
          </span>
        </div>

        <input
          type="text"
          value={state.name}
          onChange={e => dispatch({ type: 'SET_NAME', payload: e.target.value })}
          placeholder="Theme name…"
          className="flex-1 max-w-xs px-3 py-1.5 rounded-lg text-sm font-semibold border outline-none"
          style={{
            background: 'var(--surface-2)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            title="Reset to defaults"
            className="p-1.5 rounded-lg transition-colors hover:opacity-70"
            style={{ color: 'var(--text-secondary)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <RotateCcw size={13} />
          </button>
          <ThemeToggle mode={mode} onToggle={toggleMode} />
          <ExportButton state={state} />
        </div>
      </header>

      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center gap-1 px-4 border-b"
        style={{
          height: TAB_HEIGHT,
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              style={{
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                background: active ? 'var(--accent-subtle)' : 'transparent',
                border: active ? '1px solid var(--accent-subtle)' : '1px solid transparent',
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Controls panel (top ~40%) ────────────────────────────────── */}
      <div
        className="flex-shrink-0 overflow-y-auto border-b"
        style={{
          height: controlsHeight,
          borderColor: 'var(--border)',
          background: 'var(--bg)',
        }}
      >
        <div className="p-5">
          {activeTab === 'extract' && (
            <div className="space-y-5">

              {/* Image + extracted colors side by side */}
              <div className="flex gap-4 items-start">
                {/* Upload zone — fixed square-ish width */}
                <div className="w-80 flex-shrink-0">
                  <ImageUploader onExtract={extractFromFile} isExtracting={isExtracting} />
                  {extractError && (
                    <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{extractError}</p>
                  )}
                </div>

                {/* Extracted colors grid */}
                {extractedColors.length > 0 ? (
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-widest"
                        style={{ color: 'var(--text-secondary)' }}>
                        Extracted Colors
                      </h3>
                      <div className="flex gap-1.5">
                        <button
                          onClick={applyExtractedAsDataColors}
                          className="text-xs px-2 py-1 rounded-md font-medium transition-colors hover:opacity-80"
                          style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
                        >
                          Series only
                        </button>
                        <button
                          onClick={applyFullThemeFromImage}
                          className="text-xs px-2 py-1 rounded-md font-medium transition-colors hover:opacity-80"
                          style={{ background: 'var(--accent)', color: '#fff' }}
                        >
                          Apply full theme
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {extractedColors.map((color, i) => (
                        <ColorSwatch key={color + i} color={color} size="sm" onAdd={() => handleColorSelect(color)} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center rounded-xl border-2 border-dashed h-44"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                    <p className="text-xs text-center px-4">Upload an image to extract colors</p>
                  </div>
                )}
              </div>

              <HarmonyGenerator
                onApply={colors => dispatch({ type: 'SET_ALL_DATA_COLORS', payload: colors })}
              />

              {pendingColor && (
                <ColorAssignPanel
                  color={pendingColor}
                  onAssignData={assignToDataColor}
                  onAssignRole={assignToRole}
                  onDismiss={() => setPendingColor(null)}
                />
              )}

              <ComplementarySuggestions
                baseColor={suggestionBase}
                onColorSelect={handleColorSelect}
              />
            </div>
          )}

          {activeTab === 'colors' && (
            <PaletteSection state={state} dispatch={dispatch} />
          )}

          {activeTab === 'fonts' && (
            <div className="space-y-4">
              {/* Apply one font to all */}
              <div className="flex gap-2 items-center p-3 rounded-xl border"
                style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                <select
                  value={globalFont}
                  onChange={e => setGlobalFont(e.target.value)}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontFamily: globalFont,
                  }}
                  className="flex-1 px-2 py-1.5 rounded-lg text-sm outline-none"
                >
                  {FONT_LIST.map(f => (
                    <option key={f.name} value={f.name} style={{ fontFamily: f.name }}>{f.name}</option>
                  ))}
                </select>
                <button
                  onClick={applyFontToAll}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:opacity-80 whitespace-nowrap"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  Apply to all
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {['callout', 'title', 'header', 'label'].map(cls => (
                  <FontSelector
                    key={cls}
                    textClass={cls}
                    value={state.textClasses[cls]}
                    onChange={(patch) =>
                      Object.entries(patch).forEach(([field, value]) =>
                        dispatch({ type: 'SET_TEXT_CLASS', payload: { cls, field, value } })
                      )
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <JsonPanel state={state} />
            </div>
          )}
        </div>
      </div>

      {/* ── Preview panel (bottom ~60%) ──────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 p-4" style={{ background: 'var(--bg)' }}>
        <ThemePreview state={state} previewBg={previewBg} onPreviewBgChange={setPreviewBg} />
      </div>

    </div>
  )
}

function ColorAssignPanel({ color, onAssignData, onAssignRole, onDismiss }) {
  const roles = ['background', 'foreground', 'tableAccent', 'maximum', 'center', 'minimum', 'null']

  return (
    <div className="rounded-xl border p-4 space-y-3"
      style={{ background: 'var(--surface)', borderColor: 'var(--accent)', boxShadow: 'var(--shadow-md)' }}>

      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg flex-shrink-0 border"
          style={{ background: color, borderColor: 'var(--border)' }} />
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Assign {color.toUpperCase()}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Choose where to use this color</p>
        </div>
        <button onClick={onDismiss} className="text-xs hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>✕</button>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Series slot</p>
        <div className="flex gap-1.5 flex-wrap">
          {[0,1,2,3,4,5,6,7].map(i => (
            <button
              key={i}
              onClick={() => onAssignData(i)}
              className="w-7 h-7 rounded-lg text-xs font-semibold hover:opacity-80 transition-colors"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Role</p>
        <div className="flex gap-1.5 flex-wrap">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => onAssignRole(role)}
              className="px-2 py-1 rounded-md text-xs font-medium hover:opacity-80 transition-colors capitalize"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              {role}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
