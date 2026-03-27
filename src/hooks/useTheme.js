import { useReducer, useState, useEffect } from 'react'
import { DEFAULT_THEME_STATE } from '../utils/constants.js'

function themeReducer(state, action) {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload }

    case 'SET_DATA_COLOR': {
      const dataColors = [...state.dataColors]
      dataColors[action.payload.index] = action.payload.value
      return { ...state, dataColors }
    }

    case 'SET_ALL_DATA_COLORS':
      // Expects exactly 8 colors; caller is responsible for length
      return { ...state, dataColors: action.payload.slice(0, 8) }

    case 'APPLY_IMAGE_THEME':
      // payload = { background, foreground, tableAccent, dataColors, maximum, minimum, center }
      return { ...state, ...action.payload }

    case 'SET_ROLE_COLOR':
      // role = 'background' | 'foreground' | 'tableAccent' | 'maximum' | 'center' | 'minimum' | 'null'
      return { ...state, [action.payload.role]: action.payload.value }

    case 'SET_TEXT_CLASS': {
      // cls = 'callout' | 'title' | 'header' | 'label'
      // field = 'fontFace' | 'fontSize' | 'fontColor'
      const { cls, field, value } = action.payload
      return {
        ...state,
        textClasses: {
          ...state.textClasses,
          [cls]: { ...state.textClasses[cls], [field]: value },
        },
      }
    }

    case 'RESET':
      return DEFAULT_THEME_STATE

    default:
      return state
  }
}

export function useTheme() {
  const [state, dispatch] = useReducer(themeReducer, DEFAULT_THEME_STATE)

  // Light/dark mode — persisted to localStorage, applied to <html> via data-theme attribute
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem('pbi-theme-mode') || 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
    try {
      localStorage.setItem('pbi-theme-mode', mode)
    } catch {
      // localStorage unavailable — silently ignore
    }
  }, [mode])

  const toggleMode = () => setMode(m => (m === 'light' ? 'dark' : 'light'))

  return { state, dispatch, mode, toggleMode }
}
