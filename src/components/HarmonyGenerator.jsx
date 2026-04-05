import { useState, useMemo, useEffect, useRef } from 'react'
import { Wand2, Copy, Check, BookOpen } from 'lucide-react'
import { generateHarmony } from '../utils/colorHelpers'
import ColorTheoryModal from './ColorTheoryModal'

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
  const [displayedColors, setDisplayedColors] = useState([])
  const [dragFromIdx, setDragFromIdx] = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)
  const [showTheory, setShowTheory] = useState(false)
  const inputRef = useRef(null)
  const dragNode = useRef(null)

  const generated = useMemo(() => generateHarmony(seed, type), [seed, type])

  // Reset order whenever seed/type generates new colors
  useEffect(() => { setDisplayedColors(generated) }, [generated])

  const copyHex = (hex, e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(hex.toUpperCase())
    setCopiedHex(hex)
    setTimeout(() => setCopiedHex(h => h === hex ? null : h), 1500)
  }

  const handleDragStart = (e, i) => {
    setDragFromIdx(i)
    dragNode.current = e.currentTarget
    setTimeout(() => { if (dragNode.current) dragNode.current.style.opacity = '0.4' }, 0)
  }

  const handleDragEnter = (i) => {
    if (i !== dragFromIdx) setDragOverIdx(i)
  }

  const handleDragEnd = () => {
    if (dragNode.current) dragNode.current.style.opacity = ''
    dragNode.current = null
    if (dragFromIdx !== null && dragOverIdx !== null && dragFromIdx !== dragOverIdx) {
      const reordered = [...displayedColors]
      const [moved] = reordered.splice(dragFromIdx, 1)
      reordered.splice(dragOverIdx, 0, moved)
      setDisplayedColors(reordered)
    }
    setDragFromIdx(null)
    setDragOverIdx(null)
  }

  return (
    <div className="flex gap-4 h-full">

      {/* Left: seed color block + controls */}
      <div className="w-96 flex-shrink-0 flex flex-col gap-3 h-full">

        {/* Big seed color display — click to open picker */}
        <div
          className="flex-1 min-h-0 relative rounded-xl overflow-hidden border cursor-pointer"
          style={{ background: seed, borderColor: 'var(--border)' }}
          onClick={() => inputRef.current?.click()}
          title="Click to change seed color"
        >
          <div className="absolute inset-0 flex items-end p-3"
            style={{ background: 'linear-gradient(transparent 60%, rgba(0,0,0,0.45))' }}>
            <span className="text-white font-mono font-semibold text-sm drop-shadow">
              {seed.toUpperCase()}
            </span>
          </div>
        </div>
        <input
          ref={inputRef}
          type="color"
          value={seed}
          onChange={e => setSeed(e.target.value)}
          className="hidden"
        />

        {/* Harmony type buttons */}
        <div className="flex gap-1.5 flex-wrap flex-shrink-0">
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

        {/* Apply + theory buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onApply(displayedColors)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            <Wand2 size={12} />
            Apply to series colors
          </button>
          <button
            onClick={() => setShowTheory(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--accent)', background: 'var(--accent-subtle)', border: '1px solid var(--accent)' }}
          >
            <BookOpen size={12} />
            Color Theory Guide
          </button>
        </div>
      </div>

      {showTheory && <ColorTheoryModal onClose={() => setShowTheory(false)} />}

      {/* Right: 4×2 draggable color swatch grid */}
      <div className="flex-1 min-h-0 flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
          Generated Colors
        </h3>
        <div className="grid grid-cols-4 grid-rows-2 gap-2 flex-1 min-h-0">
          {displayedColors.map((hex, i) => {
            const isDragTarget = dragOverIdx === i && dragFromIdx !== i
            return (
              <div
                key={i}
                draggable
                onDragStart={e => handleDragStart(e, i)}
                onDragEnter={() => handleDragEnter(i)}
                onDragOver={e => e.preventDefault()}
                onDragEnd={handleDragEnd}
                className="flex flex-col rounded-xl overflow-hidden border select-none"
                style={{
                  borderColor: isDragTarget ? 'var(--accent)' : 'rgba(0,0,0,0.08)',
                  boxShadow: isDragTarget ? '0 0 0 2px var(--accent)' : '0 1px 3px rgba(0,0,0,0.08)',
                  cursor: 'grab',
                }}
              >
                {/* Color block — full drag surface */}
                <div className="flex-1 min-h-0" style={{ background: hex }} />

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
            )
          })}
        </div>
      </div>

    </div>
  )
}
