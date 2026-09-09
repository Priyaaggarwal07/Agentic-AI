// ---------------------------------------------------------------------------
// Mocked dataset for the AI Weather Intelligence Dashboard.
//
// This single object mirrors the shape a real backend (FastAPI) would return.
// Keeping it here means components never hardcode values — they read from the
// service layer (services/api.js), which today resolves this mock and tomorrow
// can call a REST endpoint instead.
// ---------------------------------------------------------------------------

export const mockData = {
  latitude: 20.2961,
  longitude: 85.8245,

  location: 'Bhubaneswar',

  weather: {
    temperature: 31,
    humidity: 82,
    rainfall: 12,
    wind: 5,
    pressure: 1008,
  },

  soil: {
    type: 'Clay Loam',
    ph: 6.8,
    moisture: 38,
    nitrogen: 'Medium',
    phosphorus: 'Low',
    potassium: 'High',
  },

  crop: {
    name: 'Rice',
    confidence: 95,
  },

  irrigation: {
    recommendation: 'Irrigation required after 2 days',
  },

  fertilizer: {
    recommendation: 'Apply DAP + Urea',
  },

  diseaseRisk: {
    level: 'Low',
  },

  forecast: [
    { day: 'Today', temp: 31, rain: 10 },
    { day: 'Tomorrow', temp: 29, rain: 80 },
    { day: 'Friday', temp: 28, rain: 90 },
  ],
}

// ---------------------------------------------------------------------------
// Map layer definitions used by the LayerControl + MapView.
// Each layer carries mocked "hotspot" points so toggling a layer visibly
// changes the map overlay without any backend.
// ---------------------------------------------------------------------------

export const mapLayers = [
  {
    id: 'temperature',
    label: 'Temperature',
    color: '#f97316',
    unit: '°C',
    points: [
      { lat: 20.29, lng: 85.82, value: 31 },
      { lat: 19.31, lng: 84.79, value: 33 },
      { lat: 21.5, lng: 86.93, value: 29 },
      { lat: 20.95, lng: 85.1, value: 32 },
    ],
  },
  {
    id: 'rainfall',
    label: 'Rainfall',
    color: '#3b82f6',
    unit: 'mm',
    points: [
      { lat: 20.5, lng: 85.6, value: 40 },
      { lat: 19.8, lng: 85.9, value: 12 },
      { lat: 21.2, lng: 86.2, value: 65 },
      { lat: 20.1, lng: 84.9, value: 22 },
    ],
  },
  {
    id: 'humidity',
    label: 'Humidity',
    color: '#06b6d4',
    unit: '%',
    points: [
      { lat: 20.35, lng: 85.7, value: 82 },
      { lat: 19.6, lng: 85.2, value: 76 },
      { lat: 21.0, lng: 86.5, value: 88 },
    ],
  },
  {
    id: 'soil',
    label: 'Soil',
    color: '#a16207',
    unit: '',
    points: [
      { lat: 20.2, lng: 85.5, value: 'Clay Loam' },
      { lat: 19.9, lng: 86.1, value: 'Sandy' },
      { lat: 21.3, lng: 85.8, value: 'Red Soil' },
    ],
  },
  {
    id: 'crop',
    label: 'Crop Suitability',
    color: '#22c55e',
    unit: '%',
    points: [
      { lat: 20.4, lng: 85.9, value: 95 },
      { lat: 19.7, lng: 84.8, value: 78 },
      { lat: 21.1, lng: 86.4, value: 88 },
    ],
  },
  {
    id: 'disease',
    label: 'Disease Risk',
    color: '#ef4444',
    unit: '',
    points: [
      { lat: 20.6, lng: 85.4, value: 'Low' },
      { lat: 19.4, lng: 85.7, value: 'High' },
      { lat: 21.4, lng: 86.0, value: 'Medium' },
    ],
  },
]

export default mockData
