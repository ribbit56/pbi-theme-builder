import { useState, useRef } from 'react'
import { GripVertical } from 'lucide-react'

/**
 * Displays extracted colours as a draggable grid with proportion bars.
 *
 * Props:
 *   colors        — array of { hex, proportion } from useColorExtraction
 *   onReorder     — callback(newColors) after drag-drop reorder
 *   onColorSelect — callback(hex) when the + button is clicked
 */
export default function ExtractedColorGrid({ colors, onReorder, onColorSelect }) {
  const [dragFromIdx, setDragFromIdx] = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)
  const dragNode = useRef(null)

  const handleDragStart = (e, i) => {
    setDragFromIdx(i)
    dragNode.current = e.currentTarget
    // Small delay so the ghost image renders before we apply styling
    setTimeout(() => { if (dragNode.current) dragNode.current.style.opacity = '0.4' }, 0)
  }

  const handleDragEnter = (i) => {
    if (i !== dragFromIdx) setDragOverIdx(i)
  }

  const handleDragEnd = () => {
    if (dragNode.current) dragNode.current.style.opacity = ''
    dragNode.current = null

    if (dragFromIdx !== null && dragOverIdx !== null && dragFromIdx !== dragOverIdx) {
      const reordered = [...colors]
      const [moved] = reordered.splice(dragFromIdx, 1)
      reordered.splice(dragOverIdx, 0, moved)
      onReorder(reordered)
    }
    setDragFromIdx(null)
    setDragOverIdx(null)
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {colors.map(({ hex, proportion }, i) => {
        const isDragTarget = dragOverIdx === i && dragFromIdx !== i

        return (
          <div
            key={hex + i}
            draggable
            onDragStart={e => handleDragStart(e, i)}
            onDragEnter={() => handleDragEnter(i)}
            onDragOver={e => e.preventDefault()}
            onDragEnd={handleDragEnd}
            className="flex flex-col rounded-xl overflow-hidden border transition-transform select-none"
            style={{
              borderColor: isDragTarget ? 'var(--accent)' : 'rgba(0,0,0,0.08)',
              cursor: 'grab',
              boxShadow: isDragTarget ? '0 0 0 2px var(--accent)' : '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            {/* Colour block */}
            <div
              className="relative h-20 flex flex-col justify-between p-1"
              style={{ background: hex }}
            >
              {/* Drag handle */}
              <div className="flex justify-end">
                <GripVertical size={12} style={{ color: 'rgba(255,255,255,0.6)', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))' }} />
              </div>

              {/* Add button */}
              <button
                onClick={e => { e.stopPropagation(); onColorSelect(hex) }}
                title="Add to palette"
                className="self-end text-[10px] font-bold leading-none px-1.5 py-0.5 rounded-md transition-colors hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}
              >
                +
              </button>
            </div>

            {/* Proportion bar + hex label */}
            <div className="px-1.5 pt-1 pb-1.5 space-y-1" style={{ background: 'var(--surface-2)' }}>
              <div className="text-[9px] font-mono leading-none truncate" style={{ color: 'var(--text-secondary)' }}>
                {hex.toUpperCase()}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.round(proportion * 100)}%`, background: hex }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
