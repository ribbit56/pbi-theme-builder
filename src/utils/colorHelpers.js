import chroma from 'chroma-js'
import { HEX_REGEX, MIN_CONTRAST_RATIO } from './constants.js'

/** Safely convert any chroma-parseable value to a 6-digit hex string, or null on failure. */
export function toHex(color) {
  try {
    return chroma(color).hex()
  } catch {
    return null
  }
}

/** Returns an "rgb(R, G, B)" string for display under a swatch. */
export function toRgbString(hexColor) {
  try {
    const [r, g, b] = chroma(hexColor).rgb()
    return `rgb(${r}, ${g}, ${b})`
  } catch {
    return ''
  }
}

/** Returns { r, g, b } integer parts. */
export function toRgbParts(hexColor) {
  try {
    const [r, g, b] = chroma(hexColor).rgb()
    return { r: Math.round(r), g: Math.round(g), b: Math.round(b) }
  } catch {
    return { r: 0, g: 0, b: 0 }
  }
}

/**
 * WCAG contrast ratio between two colors (1–21).
 * Uses chroma's built-in relative luminance calculation.
 */
export function getContrast(fg, bg) {
  try {
    return chroma.contrast(fg, bg)
  } catch {
    return 1
  }
}

/** Returns true if the contrast ratio meets WCAG AA normal text (4.5:1). */
export function isAccessible(fg, bg) {
  return getContrast(fg, bg) >= MIN_CONTRAST_RATIO
}

/**
 * Returns the complementary color — opposite on the color wheel (hue + 180°).
 * chroma uses `.set('hsl.h', value)` to update a single HSL channel.
 */
export function getComplementary(hexColor) {
  try {
    const hue = chroma(hexColor).get('hsl.h')
    return chroma(hexColor).set('hsl.h', (hue + 180) % 360).hex()
  } catch {
    return hexColor
  }
}

/**
 * Returns analogous colors — adjacent on the wheel at ±offset degrees.
 * Default gives 4 colors at ±30° and ±60°.
 */
export function getAnalogous(hexColor, offsets = [30, 60, -30, -60]) {
  try {
    const hue = chroma(hexColor).get('hsl.h')
    return offsets.map(offset =>
      chroma(hexColor).set('hsl.h', ((hue + offset) % 360 + 360) % 360).hex()
    )
  } catch {
    return []
  }
}

/**
 * Returns triadic colors — equally spaced at 120° intervals around the wheel.
 * Returns exactly 2 additional colors (the original + these 2 = full triad).
 */
export function getTriadic(hexColor) {
  try {
    const hue = chroma(hexColor).get('hsl.h')
    return [
      chroma(hexColor).set('hsl.h', (hue + 120) % 360).hex(),
      chroma(hexColor).set('hsl.h', (hue + 240) % 360).hex(),
    ]
  } catch {
    return []
  }
}

/**
 * Builds a smooth diverging color scale between three anchor colors.
 * Uses chroma.scale for perceptually even steps.
 */
export function buildDivergingScale(minColor, centerColor, maxColor, steps = 9) {
  try {
    return chroma.scale([minColor, centerColor, maxColor]).colors(steps)
  } catch {
    return []
  }
}

/**
 * Generates 8 harmonious colors from a seed color and a harmony type.
 * The seed hue anchors the palette; saturation and lightness are preserved
 * and gently varied to produce contrast within the set.
 *
 * Supported types: 'analogous' | 'triadic' | 'split-complementary' | 'tetradic' | 'monochromatic'
 */
export function generateHarmony(seedHex, type = 'analogous') {
  try {
    const seed = chroma(seedHex)
    const hue  = seed.get('hsl.h')
    // Keep original saturation but clamp so colors stay vivid without going neon
    const sat  = Math.min(0.9, Math.max(0.4, seed.get('hsl.s') || 0.65))
    // Clamp lightness so the seed sits mid-range and variants can go lighter/darker
    const seedL = Math.min(0.70, Math.max(0.30, seed.get('hsl.l') || 0.50))
    const lHi  = Math.min(0.80, seedL + 0.22)
    const lLo  = Math.max(0.20, seedL - 0.18)

    // Build a color at (hue + offset)°, with given lightness + saturation
    const c = (hOff, l = seedL, s = sat) =>
      chroma.hsl(((hue + hOff) % 360 + 360) % 360,
        Math.min(1, Math.max(0, s)),
        Math.min(0.9, Math.max(0.1, l))
      ).hex()

    switch (type) {
      case 'analogous':
        // 8 hues spanning ±75°, alternating between two lightness values
        return [-75, -50, -25, -8, 8, 25, 50, 75]
          .map((o, i) => c(o, i % 2 === 0 ? seedL : lHi))

      case 'triadic':
        // Three base hues at 0°, 120°, 240°; two lightness variants each + 2 mid-fills
        return [
          c(0, seedL), c(0, lHi),
          c(120, seedL), c(120, lHi),
          c(240, seedL), c(240, lHi),
          c(60, seedL), c(180, seedL),
        ]

      case 'split-complementary':
        // Seed + two colors flanking the complement (±30° from 180°)
        return [
          c(0, seedL), c(0, lHi),
          c(150, seedL), c(150, lHi),
          c(210, seedL), c(210, lHi),
          c(75, seedL), c(285, seedL),
        ]

      case 'tetradic':
        // Four hues 90° apart; base lightness then light variant
        return [
          c(0, seedL),   c(90, seedL),
          c(180, seedL), c(270, seedL),
          c(0, lHi),     c(90, lHi),
          c(180, lHi),   c(270, lHi),
        ]

      case 'monochromatic': {
        // Same hue, eight lightness steps spanning ±35% around seed
        const min = Math.max(0.10, seedL - 0.35)
        const max = Math.min(0.88, seedL + 0.35)
        const step = (max - min) / 7
        return Array.from({ length: 8 }, (_, i) => c(0, min + step * i))
      }

      default:
        return Array(8).fill(seedHex)
    }
  } catch {
    return Array(8).fill(seedHex)
  }
}

/** Returns true if the string matches the 6-digit hex pattern. */
export function validateHex(value) {
  return HEX_REGEX.test(value)
}

/** Normalise a raw string to a valid hex: prepend # if missing, lowercase accepted. */
export function normaliseHexInput(raw) {
  const withHash = raw.startsWith('#') ? raw : '#' + raw
  return withHash.slice(0, 7) // clamp to #RRGGBB length
}
