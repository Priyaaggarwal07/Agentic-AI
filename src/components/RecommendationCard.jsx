import { FaLeaf, FaFlask, FaTint, FaVirus } from 'react-icons/fa'
import { CardShell, Badge, levelTone } from './ui'

/**
 * AI recommendation summary card.
 * @param {object} props.crop         { name }
 * @param {object} props.fertilizer   { recommendation }
 * @param {object} props.irrigation   { recommendation }
 * @param {object} props.diseaseRisk  { level }
 */
export default function RecommendationCard({ crop, fertilizer, irrigation, diseaseRisk }) {
  const rows = [
    {
      icon: <FaLeaf className="text-lime-600" />,
      label: 'Recommended Crop',
      value: <Badge tone="green">{crop.name}</Badge>,
    },
    {
      icon: <FaFlask className="text-amber-600" />,
      label: 'Fertilizer',
      value: <Badge tone="blue">{fertilizer.recommendation}</Badge>,
    },
    {
      icon: <FaTint className="text-sky-600" />,
      label: 'Irrigation',
      value: <Badge tone="blue">{irrigation.recommendation}</Badge>,
    },
    {
      icon: <FaVirus className="text-rose-600" />,
      label: 'Disease Risk',
      value: <Badge tone={levelTone(diseaseRisk.level)}>{diseaseRisk.level}</Badge>,
    },
  ]

  return (
    <CardShell title="Recommendation" icon={<FaLeaf className="text-lg text-emerald-500" />}>
      {rows.map((r) => (
        <div
          key={r.label}
          className="flex items-center justify-between gap-3 rounded-xl bg-white/50 px-3 py-2 dark:bg-slate-700/40"
        >
          <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="text-lg">{r.icon}</span>
            {r.label}
          </span>
          <span className="text-right">{r.value}</span>
        </div>
      ))}
    </CardShell>
  )
}
