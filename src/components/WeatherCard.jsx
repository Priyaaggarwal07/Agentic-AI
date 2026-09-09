import {
  WiThermometer,
  WiHumidity,
  WiRain,
  WiStrongWind,
  WiBarometer,
  WiDaySunny,
} from 'react-icons/wi'
import { CardShell, StatRow } from './ui'

/**
 * Current-conditions card.
 * @param {object} props.weather  { temperature, humidity, rainfall, wind, pressure }
 */
export default function WeatherCard({ weather }) {
  return (
    <CardShell title="Weather" icon={<WiDaySunny className="text-xl text-emerald-500" />}>
      <StatRow
        icon={<WiThermometer />}
        label="Temperature"
        value={`${weather.temperature}°C`}
      />
      <StatRow icon={<WiHumidity />} label="Humidity" value={`${weather.humidity}%`} />
      <StatRow icon={<WiRain />} label="Rainfall" value={`${weather.rainfall} mm`} />
      <StatRow icon={<WiStrongWind />} label="Wind Speed" value={`${weather.wind} km/h`} />
      <StatRow icon={<WiBarometer />} label="Pressure" value={`${weather.pressure} hPa`} />
    </CardShell>
  )
}
