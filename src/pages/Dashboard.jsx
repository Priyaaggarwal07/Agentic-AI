import { useEffect, useState } from 'react'
import { FiMapPin } from 'react-icons/fi'

import Sidebar from '../components/Sidebar'
import MapView from '../components/MapView'
import LayerControl from '../components/LayerControl'
import AskAI from '../components/AskAI'
import WeatherCard from '../components/WeatherCard'
import SoilCard from '../components/SoilCard'
import CropCard from '../components/CropCard'
import RecommendationCard from '../components/RecommendationCard'
import Loading from '../components/Loading'

import { getLocationIntelligence, getMapLayers } from '../services/api'

/**
 * Main dashboard page. Owns the selected coordinate + fetched intelligence and
 * wires together the sidebar, map, layer control and info cards.
 */
export default function Dashboard() {
  // --- Location & data state ---
  const [selected, setSelected] = useState(null) // { lat, lng } | null
  const [data, setData] = useState(null) // fetched intelligence bundle
  const [loading, setLoading] = useState(false)

  // --- Navigation & layers ---
  const [activePanel, setActivePanel] = useState('weather')
  const [layers, setLayers] = useState([])
  const [activeLayers, setActiveLayers] = useState(new Set())

  // Load the available map layers once, enabling them all by default.
  useEffect(() => {
    getMapLayers().then((res) => {
      setLayers(res)
      setActiveLayers(new Set(res.map((l) => l.id)))
    })
  }, [])

  // When the user clicks the map, store the coordinate and fetch intelligence.
  // Separating the fetch here keeps components free of data-fetching logic.
  const handleSelect = async ({ lat, lng }) => {
    setSelected({ lat, lng })
    setLoading(true)
    try {
      const result = await getLocationIntelligence(lat, lng)
      setData(result)
    } finally {
      setLoading(false)
    }
  }

  const toggleLayer = (id) => {
    setActiveLayers((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 shrink-0 border-r border-white/40 bg-white/50 backdrop-blur-md dark:border-white/10 dark:bg-slate-800/40 lg:w-56">
        <Sidebar active={activePanel} onSelect={setActivePanel} />
      </aside>

      {/* Main column: map on top, cards below */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Map area */}
        <div className="relative min-h-[280px] flex-1 overflow-hidden">
          <MapView
            selected={selected}
            data={data}
            layers={layers}
            activeLayers={activeLayers}
            onSelect={handleSelect}
          />
          {layers.length > 0 && (
            <LayerControl layers={layers} active={activeLayers} onToggle={toggleLayer} />
          )}

          {/* Floating AI assistant — uses the clicked coordinate */}
          <AskAI selected={selected} />

          {/* Selected-location chip */}
          {selected && (
            <div className="glass-card absolute left-3 top-3 z-[400] flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <FiMapPin className="text-emerald-600 dark:text-emerald-400" />
              {data?.location ?? 'Location'} · {selected.lat.toFixed(3)},{' '}
              {selected.lng.toFixed(3)}
            </div>
          )}
        </div>

        {/* Bottom info strip */}
        <div className="scroll-thin max-h-[42%] overflow-y-auto border-t border-white/40 p-3 dark:border-white/10">
          <BottomStrip
            selected={selected}
            data={data}
            loading={loading}
          />
        </div>
      </main>
    </div>
  )
}

/**
 * The bottom strip switches between three states:
 *  1. Empty  — no location selected yet
 *  2. Loading — skeleton cards while the mocked promise resolves
 *  3. Loaded — the five intelligence cards
 */
function BottomStrip({ selected, data, loading }) {
  const gridCls =
    'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'

  if (!selected) {
    return <EmptyState />
  }

  if (loading || !data) {
    return (
      <div className={gridCls}>
        <Loading count={4} />
      </div>
    )
  }

  return (
    <div className={gridCls}>
      <WeatherCard weather={data.weather} />
      <SoilCard soil={data.soil} />
      <CropCard crop={data.crop} />
      <RecommendationCard
        crop={data.crop}
        fertilizer={data.fertilizer}
        irrigation={data.irrigation}
        diseaseRisk={data.diseaseRisk}
      />
    </div>
  )
}

/** Shown until the user clicks a location on the map. */
function EmptyState() {
  return (
    <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-3 text-center text-slate-500 dark:text-slate-400">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-2xl text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
        <FiMapPin />
      </div>
      <div>
        <p className="text-base font-semibold text-slate-700 dark:text-slate-200">
          No location selected
        </p>
        <p className="text-sm">Click anywhere on the map to load weather intelligence.</p>
      </div>
    </div>
  )
}
