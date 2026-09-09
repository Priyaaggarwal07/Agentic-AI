import {
  FaSun,
  FaCloud,
  FaCloudRain,
  FaTemperatureHigh,
  FaTint,
  FaCalendarAlt,
} from 'react-icons/fa'
import { CardShell } from './ui'

// Pick a weather icon based on rain probability (mocked heuristic).
function iconForRain(rain) {
  if (rain >= 70) return <FaCloudRain className="text-3xl text-sky-500" />
  if (rain >= 30) return <FaCloud className="text-3xl text-slate-400" />
  return <FaSun className="text-3xl text-amber-400" />
}

/**
 * 3-day forecast card. Renders one mini-card per forecast day.
 * @param {Array} props.forecast  [{ day, temp, rain }]
 */
export default function ForecastCard({ forecast }) {
  return (
    <CardShell title="Forecast" icon={<FaCalendarAlt className="text-base text-sky-500" />}>
      <div className="grid flex-1 grid-cols-3 gap-2">
        {forecast.map((f) => (
          <div
            key={f.day}
            className="flex flex-col items-center justify-between gap-2 rounded-xl bg-white/60 p-2 text-center transition hover:-translate-y-0.5 hover:shadow-soft dark:bg-slate-700/40"
          >
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {f.day}
            </span>
            {iconForRain(f.rain)}
            <span className="flex items-center gap-1 text-sm font-bold text-slate-800 dark:text-slate-100">
              <FaTemperatureHigh className="text-xs text-rose-500" />
              {f.temp}°
            </span>
            <span className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400">
              <FaTint className="text-xs" />
              {f.rain}%
            </span>
          </div>
        ))}
      </div>
    </CardShell>
  )
}
