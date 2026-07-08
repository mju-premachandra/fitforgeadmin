export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'fitforge-theme'

export function getStoredTheme(): Theme | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return null
}

export function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveTheme(stored: Theme | null): Theme {
  return stored ?? getSystemTheme()
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function storeTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme)
}

export function getInitialTheme(): Theme {
  return resolveTheme(getStoredTheme())
}
