import { FiLayers } from 'react-icons/fi'

/**
 * Floating map layer control. Purely presentational — the parent owns the
 * `active` set and toggles it. Toggling updates the mocked overlays on the map.
 *
 * @param {Array}   props.layers    [{ id, label, color }]
 * @param {Set}     props.active    set of enabled layer ids
 * @param {Function} props.onToggle called with a layer id
 */
export default function LayerControl({ layers, active, onToggle }) {
  return (
    <div className="glass-card absolute right-3 top-3 z-[400] w-52 p-3 shadow-glass">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        <FiLayers className="text-emerald-600 dark:text-emerald-400" />
        Map Layers
      </div>

      <ul className="space-y-1">
        {layers.map((layer) => {
          const checked = active.has(layer.id)
          return (
            <li key={layer.id}>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-600 transition hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-700/50">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(layer.id)}
                  className="h-4 w-4 accent-emerald-600"
                />
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: layer.color }}
                />
                {layer.label}
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
