import { FaSeedling, FaFlask, FaTint, FaLeaf, FaVial, FaMountain } from 'react-icons/fa'
import { CardShell, StatRow, Badge, levelTone } from './ui'

/**
 * Soil profile card.
 * @param {object} props.soil  { type, ph, moisture, nitrogen, phosphorus, potassium }
 */
export default function SoilCard({ soil }) {
  return (
    <CardShell title="Soil" icon={<FaSeedling className="text-lg text-amber-600" />}>
      <StatRow icon={<FaMountain />} label="Soil Type" value={soil.type} />
      <StatRow icon={<FaFlask />} label="pH" value={soil.ph} />
      <StatRow icon={<FaTint />} label="Moisture" value={`${soil.moisture}%`} />

      <StatRow
        icon={<FaLeaf />}
        label="Nitrogen (N)"
        value={<Badge tone={levelTone(soil.nitrogen)}>{soil.nitrogen}</Badge>}
      />
      <StatRow
        icon={<FaVial />}
        label="Phosphorus (P)"
        value={<Badge tone={levelTone(soil.phosphorus)}>{soil.phosphorus}</Badge>}
      />
      <StatRow
        icon={<FaVial />}
        label="Potassium (K)"
        value={<Badge tone={levelTone(soil.potassium)}>{soil.potassium}</Badge>}
      />
    </CardShell>
  )
}
