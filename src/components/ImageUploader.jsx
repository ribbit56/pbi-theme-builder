import { useState, useRef } from 'react'
import { Upload, Image, Loader2, X } from 'lucide-react'

/**
 * Drag-and-drop image uploader. Uses native HTML5 drag events — no library.
 * On file selection, calls onExtract(file) which triggers color extraction.
 */
export default function ImageUploader({ onExtract, isExtracting }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [preview, setPreview] = useState(null)
  const [fileName, setFileName] = useState(null)
  const inputRef = useRef(null)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    setFileName(file.name)
    onExtract(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    // Only fire if leaving the entire drop zone (not a child element)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false)
    }
  }

  const handleInputChange = (e) => {
    handleFile(e.target.files[0])
  }

  const clearImage = () => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setFileName(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="h-full">
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border h-full" style={{ borderColor: 'var(--border)' }}>
          <img
            src={preview}
            alt="Uploaded"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-end p-2"
            style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.5))' }}>
            <span className="text-white text-xs font-medium truncate flex-1">{fileName}</span>
            <button
              onClick={clearImage}
              className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors text-white"
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>
          {isExtracting && (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.4)' }}>
              <div className="flex items-center gap-2 text-white text-sm font-medium">
                <Loader2 size={16} className="animate-spin" />
                Extracting colors…
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className="flex flex-col items-center justify-center gap-3 h-full rounded-xl border-2 border-dashed cursor-pointer transition-colors"
          style={{
            borderColor: isDragOver ? 'var(--accent)' : 'var(--border)',
            background: isDragOver ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'var(--surface-2)',
          }}
        >
          <div className="p-2 rounded-full" style={{ background: 'var(--border)' }}>
            {isDragOver ? <Image size={20} style={{ color: 'var(--accent)' }} /> : <Upload size={20} style={{ color: 'var(--text-secondary)' }} />}
          </div>
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm text-center px-4">
            {isDragOver ? 'Drop to extract colors' : 'Drop an image or click to browse'}
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  )
}
