import { useState, useCallback } from 'react'

/**
 * Extracts a diverse colour palette from an image file using the native Canvas API.
 *
 * Algorithm:
 *  1. Draw the image onto a small (≤150px) canvas for performance.
 *  2. Read every pixel, skip transparent / near-white pixels.
 *  3. Bucket pixels into a coarse colour space (5 bits per channel → 32 bins each).
 *  4. Sort buckets by population and greedily pick colours that are visually
 *     distinct from those already chosen (L1 distance > threshold).
 */

const MAX_DIM = 150       // downscale target
const SIMILARITY_L1 = 80  // minimum L1 distance between chosen colours

function extractPalette(img, count = 8) {
  const nw = img.naturalWidth  || img.width  || 0
  const nh = img.naturalHeight || img.height || 0
  if (nw === 0 || nh === 0) return null

  const scale = Math.min(1, MAX_DIM / Math.max(nw, nh))
  const w = Math.max(1, Math.round(nw * scale))
  const h = Math.max(1, Math.round(nh * scale))

  const canvas = document.createElement('canvas')
  canvas.width  = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, w, h)

  const { data } = ctx.getImageData(0, 0, w, h)

  // Bucket pixels into a quantised colour space (5 bits per channel)
  const buckets = {}
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]
    if (a < 125) continue                              // skip transparent
    const r = data[i], g = data[i + 1], b = data[i + 2]
    if (r > 250 && g > 250 && b > 250) continue       // skip near-white

    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)
    if (!buckets[key]) buckets[key] = { count: 0, r: 0, g: 0, b: 0 }
    buckets[key].count++
    buckets[key].r += r
    buckets[key].g += g
    buckets[key].b += b
  }

  const sorted = Object.values(buckets).sort((a, b) => b.count - a.count)

  // Greedily pick the most-frequent colours that are visually distinct
  const chosen = []
  for (const bucket of sorted) {
    if (chosen.length >= count) break
    const r = Math.round(bucket.r / bucket.count)
    const g = Math.round(bucket.g / bucket.count)
    const b = Math.round(bucket.b / bucket.count)

    const tooClose = chosen.some(
      ([er, eg, eb]) => Math.abs(r - er) + Math.abs(g - eg) + Math.abs(b - eb) < SIMILARITY_L1
    )
    if (!tooClose) chosen.push([r, g, b])
  }

  return chosen.length > 0 ? chosen : null
}

export function useColorExtraction() {
  const [extractedColors, setExtractedColors] = useState([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState(null)

  const extractFromFile = useCallback((file) => {
    if (!file) return
    setIsExtracting(true)
    setError(null)

    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      try {
        const palette = extractPalette(img, 8)
        if (!palette) {
          setError('Could not extract colours — try a different image.')
        } else {
          const hexColors = palette.map(([r, g, b]) => {
            const h = n => n.toString(16).padStart(2, '0')
            return '#' + h(r) + h(g) + h(b)
          })
          setExtractedColors(hexColors)
        }
      } catch (e) {
        setError('Colour extraction failed: ' + e.message)
      } finally {
        URL.revokeObjectURL(objectUrl)
        setIsExtracting(false)
      }
    }

    img.onerror = () => {
      setError('Failed to load image. Please try a different file.')
      URL.revokeObjectURL(objectUrl)
      setIsExtracting(false)
    }

    img.src = objectUrl
  }, [])

  const clearExtracted = useCallback(() => {
    setExtractedColors([])
    setError(null)
  }, [])

  return { extractedColors, isExtracting, error, extractFromFile, clearExtracted }
}
