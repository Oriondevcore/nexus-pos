// src/context/ThemeContext.jsx
// Dark / Light theme toggle — persists in localStorage

import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}

export const ThemeProvider = ({ children }) => {
  // Load saved theme, default to dark
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nexus-theme') || 'dark'
  })

  const isDark  = theme === 'dark'
  const isLight = theme === 'light'

  // Apply theme class to <html> and persist
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('theme-light')
      root.classList.remove('theme-dark')
    } else {
      root.classList.remove('theme-light')
      root.classList.add('theme-dark')
    }
    localStorage.setItem('nexus-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const setDark     = () => setTheme('dark')
  const setLight    = () => setTheme('light')

  return (
    <ThemeContext.Provider value={{ theme, isDark, isLight, toggleTheme, setDark, setLight }}>
      {children}
    </ThemeContext.Provider>
  )
}
