import { HEX_REGEX } from './constants.js'

/**
 * Validates a fully-assembled Power BI theme object.
 * Throws a descriptive Error if any field is wrong — never exports silently broken files.
 * Export this separately so it can be unit tested independently of buildTheme.
 */
export function validateTheme(themeObject) {
  const errors = []

  // 1. dataColors must be exactly 8 hex strings
  if (!Array.isArray(themeObject.dataColors) || themeObject.dataColors.length !== 8) {
    errors.push(
      `dataColors must be an array of exactly 8 hex strings (got ${themeObject.dataColors?.length ?? 'nothing'})`
    )
  }
  themeObject.dataColors?.forEach((color, i) => {
    if (!HEX_REGEX.test(color)) {
      errors.push(`dataColors[${i}] is not a valid hex color: "${color}"`)
    }
  })

  // 2. Top-level hex fields
  const hexFields = ['background', 'foreground', 'tableAccent', 'maximum', 'center', 'minimum', 'null']
  hexFields.forEach(field => {
    if (!HEX_REGEX.test(themeObject[field])) {
      errors.push(`"${field}" is not a valid 6-digit hex color: "${themeObject[field]}"`)
    }
  })

  // 3. textClasses fontSize must be numbers
  const textClasses = ['callout', 'title', 'header', 'label']
  textClasses.forEach(cls => {
    const tc = themeObject.textClasses?.[cls]
    if (!tc) {
      errors.push(`textClasses.${cls} is missing`)
      return
    }
    if (typeof tc.fontSize !== 'number') {
      errors.push(`textClasses.${cls}.fontSize must be a number (got ${typeof tc.fontSize}: "${tc.fontSize}")`)
    }
    if (!HEX_REGEX.test(tc.color)) {
      errors.push(`textClasses.${cls}.color is not a valid hex color: "${tc.color}"`)
    }
  })

  if (errors.length > 0) {
    throw new Error('Theme validation failed:\n• ' + errors.join('\n• '))
  }

  return true
}

/**
 * Pure function: assembles the canonical Power BI theme JSON object from app state.
 * Calls validateTheme before returning — throws if invalid.
 *
 * The `visualStyles['*']['*']` wildcard keys are literal strings, not JS globs.
 * The background value is wrapped in a mandatory array+object chain per the PBI spec.
 */
export function buildTheme(state) {
  const themeObject = {
    name: state.name,

    dataColors: [...state.dataColors],

    background:   state.background,
    foreground:   state.foreground,
    tableAccent:  state.tableAccent,

    maximum: state.maximum,
    center:  state.center,
    minimum: state.minimum,
    // 'null' is a reserved word in JS — always use bracket notation for this key
    'null':  state['null'],

    textClasses: {
      callout: {
        fontFace: state.textClasses.callout.fontFace,
        fontSize: state.textClasses.callout.fontSize,
        color:    state.textClasses.callout.fontColor,
      },
      title: {
        fontFace: state.textClasses.title.fontFace,
        fontSize: state.textClasses.title.fontSize,
        color:    state.textClasses.title.fontColor,
      },
      header: {
        fontFace: state.textClasses.header.fontFace,
        fontSize: state.textClasses.header.fontSize,
        color:    state.textClasses.header.fontColor,
      },
      label: {
        fontFace: state.textClasses.label.fontFace,
        fontSize: state.textClasses.label.fontSize,
        color:    state.textClasses.label.fontColor,
      },
    },

    // Wildcard keys are literal '*' strings per the Power BI schema.
    // The background value must be: array > object > color > solid > color (string).
    visualStyles: {
      '*': {
        '*': {
          background: [{ color: { solid: { color: state.background } } }],
        },
      },
    },
  }

  // Throws a descriptive error if anything is invalid — caught by ExportButton
  validateTheme(themeObject)

  return themeObject
}
