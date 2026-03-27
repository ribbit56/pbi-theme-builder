import { useState } from 'react'
import { Palette, RotateCcw } from 'lucide-react'

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

const HEADER_HEIGHT = 64

export default function App() {
  const { state, dispatch, mode, toggleMode } = useTheme()
  const { extractedColors, isExtracting, error: extractError, extractFromFile } = useColorExtraction()

  // Background of the preview canvas (independent of theme colours)
  const [previewBg, setPreviewBg] = useState('#ffffff')

  // Global font — applied to all text classes at once
  const [globalFont, setGlobalFont] = useState('Segoe UI')

  // Track which color was last clicked in suggestions (used as base for ComplementarySuggestions)
  const [suggestionBase, setSuggestionBase] = useState(state.dataColors[0])

  // When a suggested/extracted color is chosen, open a small role-assign popover
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

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 flex items-center gap-3 px-6 border-b"
        style={{
          height: HEADER_HEIGHT,
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Logo / brand */}
        <div className="flex items-center gap-2 mr-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)' }}>
            <Palette size={14} color="white" />
          </div>
          <span className="font-semibold text-sm hidden sm:block" style={{ color: 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif' }}>
            PBI Theme Builder
          </span>
        </div>

        {/* Theme name */}
        <input
          type="text"
          value={state.name}
          onChange={e => dispatch({ type: 'SET_NAME', payload: e.target.value })}
          placeholder="Theme name…"
          className="flex-1 max-w-xs px-3 py-1.5 rounded-lg text-sm font-semibold border outline-none transition-colors"
          style={{
            background: 'var(--surface-2)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />

        <div className="flex items-center gap-2 ml-auto">
          {/* Reset */}
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            title="Reset to defaults"
            className="p-2 rounded-lg transition-colors hover:opacity-70"
            style={{ color: 'var(--text-secondary)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <RotateCcw size={14} />
          </button>

          <ThemeToggle mode={mode} onToggle={toggleMode} />
          <ExportButton state={state} />
        </div>
      </header>

      {/* ── Main layout ─────────────────────────────────────────────────── */}
      <main className="flex flex-1 overflow-hidden">

        {/* Left panel — controls, scrollable */}
        <div
          className="w-[420px] flex-shrink-0 overflow-y-auto"
          style={{ borderRight: '1px solid var(--border)' }}
        >
          <div className="p-6 space-y-8">

            {/* Image upload */}
            <ImageUploader onExtract={extractFromFile} isExtracting={isExtracting} />

            {/* Extraction error — shown even when no colors were extracted */}
            {extractError && (
              <p className="text-xs px-1" style={{ color: '#ef4444' }}>{extractError}</p>
            )}

            {/* Extracted colors row */}
            {extractedColors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold uppercase tracking-widest">
                    Extracted Colors
                  </h3>
                  <div className="flex gap-1.5">
                    <button
                      onClick={applyExtractedAsDataColors}
                      title="Copy extracted colors into the 8 series slots only"
                      className="text-xs px-2 py-1 rounded-md font-medium transition-colors hover:opacity-80"
                      style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
                    >
                      Series only
                    </button>
                    <button
                      onClick={applyFullThemeFromImage}
                      title="Intelligently assign extracted colors to all theme roles"
                      className="text-xs px-2 py-1 rounded-md font-medium transition-colors hover:opacity-80"
                      style={{ background: 'var(--accent)', color: '#fff' }}
                    >
                      Apply full theme
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {extractedColors.map((color, i) => (
                    <ColorSwatch
                      key={color + i}
                      color={color}
                      size="sm"
                      onAdd={() => handleColorSelect(color)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Color assign popover */}
            {pendingColor && (
              <ColorAssignPanel
                color={pendingColor}
                onAssignData={assignToDataColor}
                onAssignRole={assignToRole}
                onDismiss={() => setPendingColor(null)}
              />
            )}

            {/* Complementary suggestions — always visible, uses last-touched color */}
            <ComplementarySuggestions
              baseColor={suggestionBase}
              onColorSelect={handleColorSelect}
            />

            {/* Harmony generator */}
            <HarmonyGenerator
              onApply={colors => dispatch({ type: 'SET_ALL_DATA_COLORS', payload: colors })}
            />

            {/* Palette roles */}
            <PaletteSection state={state} dispatch={dispatch} />

            {/* Font selection */}
            <div className="space-y-4">
              <h3 style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold uppercase tracking-widest">
                Typography
              </h3>

              {/* Apply one font to all text classes */}
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

            {/* Raw JSON panel */}
            <JsonPanel state={state} />

          </div>
        </div>

        {/* Right panel — sticky preview */}
        <div
          className="flex-1 overflow-hidden"
          style={{
            position: 'sticky',
            top: HEADER_HEIGHT,
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            alignSelf: 'flex-start',
          }}
        >
          <div className="h-full overflow-auto p-6">
            <ThemePreview state={state} previewBg={previewBg} onPreviewBgChange={setPreviewBg} />
          </div>
        </div>

      </main>
    </div>
  )
}

/**
 * Small inline panel for assigning a pending color to a specific role or series slot.
 */
function ColorAssignPanel({ color, onAssignData, onAssignRole, onDismiss }) {
  const roles = ['background', 'foreground', 'tableAccent', 'maximum', 'center', 'minimum', 'null']

  return (
    <div className="rounded-xl border p-4 space-y-3"
      style={{ background: 'var(--surface)', borderColor: 'var(--accent)', boxShadow: 'var(--shadow-md)' }}>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex-shrink-0 border" style={{ background: color, borderColor: 'var(--border)' }} />
        <div className="flex-1">
          <p style={{ color: 'var(--text-primary)' }} className="text-sm font-semibold">Assign {color.toUpperCase()}</p>
          <p style={{ color: 'var(--text-secondary)' }} className="text-xs">Choose where to use this color</p>
        </div>
        <button onClick={onDismiss} style={{ color: 'var(--text-secondary)' }} className="text-xs hover:opacity-70">✕</button>
      </div>

      <div className="space-y-2">
        <p style={{ color: 'var(--text-secondary)' }} className="text-xs font-medium uppercase tracking-wide">Series slot</p>
        <div className="flex gap-1.5 flex-wrap">
          {[0,1,2,3,4,5,6,7].map(i => (
            <button
              key={i}
              onClick={() => onAssignData(i)}
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              className="w-8 h-8 rounded-lg text-xs font-semibold hover:opacity-80 transition-colors"
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p style={{ color: 'var(--text-secondary)' }} className="text-xs font-medium uppercase tracking-wide">Role</p>
        <div className="flex gap-1.5 flex-wrap">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => onAssignRole(role)}
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              className="px-2 py-1 rounded-md text-xs font-medium hover:opacity-80 transition-colors capitalize"
            >
              {role}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
