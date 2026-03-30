import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toRgbString } from '../utils/colorHelpers.js'

/**
 * Interactive color swatch tile.
 * Shows the color as a block with HEX and RGB text beneath.
 * Hover reveals action buttons based on which callbacks are provided.
 *
 * Props:
 *   color    — hex string
 *   label    — optional label above the swatch
 *   onEdit   — show edit (pencil) button
 *   onAdd    — show add (+) button (for extracted/suggested colors)
 *   onDelete — show delete button
 *   size     — 'sm' | 'md' (default 'md')
 */
export default function ColorSwatch({ color, label, onEdit, onAdd, onDelete, size = 'md' }) {
  const [hovered, setHovered] = useState(false)
  const rgb = toRgbString(color)

  // Determine if we need white or black text on the swatch based on luminance
  const needsDarkText = isLightColor(color)
  const textColor = needsDarkText ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)'

  const blockSize = size === 'sm' ? 'h-20' : 'h-28'

  return (
    <div className="flex flex-col gap-1" style={{ minWidth: size === 'sm' ? 64 : 80 }}>
      {label && (
        <span style={{ color: 'var(--text-secondary)' }} className="text-xs font-medium truncate max-w-[80px]">
          {label}
        </span>
      )}

      <div
        className={`relative ${blockSize} rounded-xl cursor-pointer select-none transition-transform hover:scale-105`}
        style={{
          background: color,
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.08)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onEdit}
        title={`${color} — click to edit`}
      >
        {/* Hover action overlay */}
        {hovered && (onEdit || onAdd || onDelete) && (
          <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(1px)' }}>
            {onEdit && (
              <ActionBtn icon={<Pencil size={13} />} onClick={onEdit} title="Edit color" textColor={textColor} />
            )}
            {onAdd && (
              <ActionBtn icon={<Plus size={13} />} onClick={onAdd} title="Add to palette" textColor={textColor} />
            )}
            {onDelete && (
              <ActionBtn icon={<Trash2 size={13} />} onClick={onDelete} title="Remove" textColor={textColor} />
            )}
          </div>
        )}
      </div>

      {/* HEX + RGB labels */}
      <div className="leading-none">
        <div style={{ color: 'var(--text-primary)' }} className="text-xs font-mono font-semibold">
          {color.toUpperCase()}
        </div>
        <div style={{ color: 'var(--text-secondary)' }} className="text-[10px] font-mono mt-0.5">
          {rgb}
        </div>
      </div>
    </div>
  )
}

function ActionBtn({ icon, onClick, title, textColor }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(e) }}
      title={title}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:scale-110"
      style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
    >
      {icon}
    </button>
  )
}

/** Heuristic: treat colors above ~55% relative luminance as "light" */
function isLightColor(hex) {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return luminance > 0.55
  } catch {
    return false
  }
}
