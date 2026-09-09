import { useEffect, useState } from 'react'
import { FiSun, FiMoon } from 'react-icons/fi'
import { FaCloudSun } from 'react-icons/fa'

/**
 * Top gradient navbar.
 * Left: logo + platform title. Right: live date/time + theme toggle.
 *
 * @param {boolean}  props.dark        current theme is dark
 * @param {Function} props.onToggleTheme  toggles light/dark
 */
export default function Navbar({ dark, onToggleTheme }) {
  const [now, setNow] = useState(new Date())

  // Tick the clock every second so the navbar time stays live.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const dateStr = now.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const timeStr = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <header className="relative z-20 flex items-center justify-between gap-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-4 py-3 text-white shadow-soft sm:px-6">
      {/* Logo + title */}
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 shadow-inner backdrop-blur">
          <FaCloudSun className="text-2xl" />
        </div>
        <div className="leading-tight">
          <h1 className="text-base font-bold tracking-tight sm:text-lg">
            AI Weather Intelligence Platform
          </h1>
          <p className="hidden text-xs text-white/80 sm:block">
            Agricultural Weather &amp; Soil Intelligence Dashboard
          </p>
        </div>
      </div>

      {/* Date / time / theme toggle */}
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden text-right leading-tight sm:block">
          <div className="text-sm font-semibold">{dateStr}</div>
          <div className="font-mono text-xs text-white/80">{timeStr}</div>
        </div>

        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-lg transition hover:scale-105 hover:bg-white/30 active:scale-95"
        >
          {dark ? <FiSun /> : <FiMoon />}
        </button>
      </div>
    </header>
  )
}
