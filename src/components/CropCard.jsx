import { FaLeaf } from 'react-icons/fa'
import { CardShell } from './ui'

/**
 * Best-crop recommendation card with a confidence ring.
 * @param {object} props.crop  { name, confidence }
 */
export default function CropCard({ crop }) {
  const confidence = Number(crop.confidence) || 0

  return (
    <CardShell title="Crop Suitability" icon={<FaLeaf className="text-lg text-lime-600" />}>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-2">
        {/* Confidence ring built from a conic-gradient */}
        <div
          className="relative grid h-28 w-28 place-items-center rounded-full"
          style={{
            background: `conic-gradient(#10b981 ${confidence * 3.6}deg, rgba(148,163,184,0.25) 0deg)`,
          }}
        >
          <div className="grid h-[86px] w-[86px] place-items-center rounded-full bg-white text-center dark:bg-slate-800">
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {confidence}%
            </span>
          </div>
        </div>

        <div className="text-center">
          <div className="mb-1 flex items-center justify-center gap-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            <FaLeaf className="text-xl" />
            {crop.name}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Best-suited crop for this location
          </p>
        </div>
      </div>
    </CardShell>
  )
}
