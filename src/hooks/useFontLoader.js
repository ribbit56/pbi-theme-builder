import { useCallback } from 'react'

/**
 * Previously loaded Google Fonts dynamically. Now that the font list is
 * restricted to Windows / Office system fonts (the only fonts Power BI
 * Desktop supports), there is nothing to load — the browser already has
 * access to whatever system fonts are installed.
 *
 * The hook is kept so call-sites don't need changing.
 */
export function useFontLoader() {
  const loadFont = useCallback(() => {}, [])
  return { loadFont }
}
