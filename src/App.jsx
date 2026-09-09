import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'

/**
 * Root component. Owns the light/dark theme and lays out the navbar + dashboard
 * as a full-height flex column.
 */
export default function App() {
  // Initialise theme from localStorage, falling back to the OS preference.
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('theme')
    if (stored) return stored === 'dark'
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  })

  // Reflect the theme on <html> (Tailwind's class strategy) and persist it.
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <div className="app-bg flex h-full flex-col text-slate-800 dark:text-slate-100">
      <Navbar dark={dark} onToggleTheme={() => setDark((d) => !d)} />
      <Dashboard />
    </div>
  )
}
