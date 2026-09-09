import {
  FiCloud,
  FiCalendar,
  FiSettings,
} from 'react-icons/fi'
import {
  FaSeedling,
  FaLeaf,
  FaVirus,
  FaTint,
  FaFlask,
} from 'react-icons/fa'

// Sidebar navigation items. Kept as data so the list stays declarative and
// easy to extend. `id` maps to the active-panel key used by the Dashboard.
const NAV_ITEMS = [
  { id: 'weather', label: 'Weather', icon: FiCloud },
  { id: 'soil', label: 'Soil', icon: FaSeedling },
  { id: 'crop', label: 'Crop Suitability', icon: FaLeaf },
  { id: 'forecast', label: 'Forecast', icon: FiCalendar },
  { id: 'disease', label: 'Disease Risk', icon: FaVirus },
  { id: 'irrigation', label: 'Irrigation', icon: FaTint },
  { id: 'fertilizer', label: 'Fertilizer', icon: FaFlask },
  { id: 'settings', label: 'Settings', icon: FiSettings },
]

/**
 * Left navigation rail. Collapses to icon-only on small screens.
 *
 * @param {string}   props.active     currently active nav id
 * @param {Function} props.onSelect   called with the selected nav id
 */
export default function Sidebar({ active, onSelect }) {
  return (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto p-2 sm:p-3">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            title={label}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition
              ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-soft'
                  : 'text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-700/60'
              }`}
          >
            <Icon
              className={`shrink-0 text-lg transition group-hover:scale-110 ${
                isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            />
            <span className="hidden lg:inline">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export { NAV_ITEMS }
