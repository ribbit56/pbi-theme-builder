/**
 * Color utility helpers used for intelligent theme generation from extracted palettes.
 */

export function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

/** WCAG relative luminance (0 = black, 1 = white) */
export function getLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** HSL saturation (0–1) */
export function getSaturation(hex) {
  const [r, g, b] = hexToRgb(hex).map(c => c / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return 0
  const d = max - min
  return l > 0.5 ? d / (2 - max - min) : d / (max + min)
}

/**
 * Given an array of extracted hex colors, intelligently assign them to all
 * Power BI theme roles.
 *
 * Strategy:
 *  - Background  → lightest color if luminance > 0.75, else white
 *  - Foreground  → darkest color if luminance < 0.10, else near-black
 *  - TableAccent → most saturated / vivid color (excluding any chosen bg)
 *  - dataColors  → all 8 slots filled by cycling through extracted colors
 *  - Maximum     → most saturated color (same as tableAccent)
 *  - Minimum     → least saturated color from the set
 *  - Center      → lightest extracted or neutral grey
 */
export function buildThemeFromColors(colors) {
  if (!colors || colors.length === 0) return {}

  const byLuminanceAsc  = [...colors].sort((a, b) => getLuminance(a) - getLuminance(b))
  const bySaturationDesc = [...colors].sort((a, b) => getSaturation(b) - getSaturation(a))

  const darkest  = byLuminanceAsc[0]
  const lightest = byLuminanceAsc[byLuminanceAsc.length - 1]

  const background = getLuminance(lightest) > 0.75 ? lightest : '#FFFFFF'
  const foreground = getLuminance(darkest)  < 0.10 ? darkest  : '#252423'

  const tableAccent = bySaturationDesc.find(c => c !== background) ?? bySaturationDesc[0]
  const maximum     = tableAccent
  const minimum     = bySaturationDesc[bySaturationDesc.length - 1] ?? darkest
  const center      = getLuminance(lightest) > 0.6 ? lightest : '#F2F2F2'

  // Fill all 8 dataColor slots by cycling through the extracted palette
  const dataColors = Array.from({ length: 8 }, (_, i) => colors[i % colors.length])

  return { background, foreground, tableAccent, dataColors, maximum, minimum, center }
}
