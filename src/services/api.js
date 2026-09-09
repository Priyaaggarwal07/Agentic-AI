// ---------------------------------------------------------------------------
// API service layer.
//
// Every function returns a Promise, exactly like an Axios call would. Today
// they resolve mocked JSON; to go live against a FastAPI backend you only edit
// THIS file — swap the `mockRequest(...)` bodies for `axios.get()` /
// `axios.post()`. Components never change because they already `await` these.
//
// Example future implementation:
//   export const getWeather = (lat, lng) =>
//     axios.get(`${BASE_URL}/weather`, { params: { lat, lng } }).then(r => r.data)
// ---------------------------------------------------------------------------

import axios from 'axios'
import { mockData, mapLayers } from '../data/mockData'

// Base URL for the FastAPI backend.
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// A tiny helper that simulates network latency and resolves mocked data.
// This keeps the async contract identical to a real Axios request.
const MOCK_DELAY = 600
function mockRequest(payload, delay = MOCK_DELAY) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(payload)), delay)
  })
}

const coordsBody = (lat, lng) => ({
  latitude: lat,
  longitude: lng,
})

const normalizeWeather = (weather) => ({
  ...weather,
  rainfall: weather.rainfall ?? weather.rain ?? 0,
  wind: weather.wind ?? weather.wind_speed ?? 0,
})

const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value)

const normalizeSoil = (soil) => ({
  ...soil,
  type: soil.type && soil.type !== 'Unknown' ? soil.type : mockData.soil.type,
  ph: isFiniteNumber(soil.ph) ? soil.ph : mockData.soil.ph,
  moisture: soil.moisture ?? 'N/A',
})

const cropFromSuitability = (result) => ({
  name: result.recommended_crop,
  confidence: result.score,
  topCrops: result.top_crops,
})

const fertilizerForCrop = (soil, cropName) => {
  const amounts = soil?.fertilizer_data?.[cropName]
  if (!amounts) return mockData.fertilizer

  const parts = [
    amounts.dap && `DAP ${amounts.dap}`,
    amounts.urea && `Urea ${amounts.urea}`,
    amounts.mop && `MOP ${amounts.mop}`,
  ].filter(Boolean)

  return {
    recommendation: parts.length ? parts.join(' + ') : mockData.fertilizer.recommendation,
    amounts,
  }
}

/**
 * Fetch current weather for a coordinate.
 * @param {number} [lat]
 * @param {number} [lng]
 * @returns {Promise<object>} weather block
 */
export const getWeather = (lat, lng) =>
  USE_MOCK
    ? mockRequest(mockData.weather)
    : axios.post(`${BASE_URL}/weather`, coordsBody(lat, lng)).then((r) => normalizeWeather(r.data))

/**
 * Fetch soil profile for a coordinate.
 * @returns {Promise<object>} soil block
 */
export const getSoil = (lat, lng) =>
  USE_MOCK
    ? mockRequest(mockData.soil)
    : axios.post(`${BASE_URL}/soil`, coordsBody(lat, lng)).then((r) => normalizeSoil(r.data))

/**
 * Fetch the 3-day forecast for a coordinate.
 * @returns {Promise<Array>} forecast list
 */
export const getForecast = (lat, lng) =>
  USE_MOCK
    ? mockRequest(mockData.forecast)
    : axios.post(`${BASE_URL}/forecast`, coordsBody(lat, lng)).then((r) => r.data)

/**
 * Fetch AI recommendation bundle (crop + fertilizer + irrigation).
 * @returns {Promise<object>}
 */
export const getRecommendation = async (lat, lng) => {
  if (USE_MOCK) {
    return mockRequest({
      crop: mockData.crop,
      fertilizer: mockData.fertilizer,
      irrigation: mockData.irrigation,
    })
  }

  const [weather, soil, forecast] = await Promise.all([
    getWeather(lat, lng),
    getSoil(lat, lng),
    getForecast(lat, lng),
  ])
  const rainfall = forecast?.[0]?.rain ?? weather.rainfall ?? 0
  const result = await axios
    .post(`${BASE_URL}/crop-suitability`, {
      temperature: weather.temperature,
      humidity: weather.humidity,
      rainfall,
      soil_type: soil.type,
      ph: soil.ph,
    })
    .then((r) => r.data)
  const crop = cropFromSuitability(result)

  return {
    crop,
    fertilizer: fertilizerForCrop(soil, crop.name),
    irrigation: mockData.irrigation,
  }
}

/**
 * Fetch disease risk assessment for a coordinate.
 * @returns {Promise<object>} disease risk block
 */
export const getDiseaseRisk = (lat, lng) =>
  mockRequest(mockData.diseaseRisk)

/**
 * Ask the backend LangGraph/OpenAI agent a natural-language question.
 * @returns {Promise<string>} final assistant answer
 */
export const createChatSession = () =>
  USE_MOCK
    ? mockRequest({ session_id: crypto.randomUUID() }, 100)
    : axios.post(`${BASE_URL}/chat-sessions`).then((r) => r.data)

export const deleteChatSession = (sessionId) =>
  USE_MOCK || !sessionId
    ? mockRequest({ message: 'Chat session deleted' }, 100)
    : axios.delete(`${BASE_URL}/chat-sessions/${sessionId}`).then((r) => r.data)

export const askAgent = (question, lat, lng, sessionId) =>
  USE_MOCK
    ? mockRequest('Mock AI is enabled. Set VITE_USE_MOCK=false to call the backend agent.')
    : axios
        .post(`${BASE_URL}/ask`, {
          question,
          latitude: lat,
          longitude: lng,
          session_id: sessionId,
        })
        .then((r) => r.data.answer)

/**
 * Convenience aggregator: fetch everything needed for a selected location in
 * one call. Useful for the dashboard's initial load.
 * @returns {Promise<object>} full location intelligence bundle
 */
export const getLocationIntelligence = async (lat, lng) => {
  if (USE_MOCK) {
    const [weather, soil, forecast, recommendation, diseaseRisk] = await Promise.all([
      getWeather(lat, lng),
      getSoil(lat, lng),
      getForecast(lat, lng),
      getRecommendation(lat, lng),
      getDiseaseRisk(lat, lng),
    ])

    return {
      location: mockData.location,
      latitude: lat ?? mockData.latitude,
      longitude: lng ?? mockData.longitude,
      weather,
      soil,
      forecast,
      crop: recommendation.crop,
      fertilizer: recommendation.fertilizer,
      irrigation: recommendation.irrigation,
      diseaseRisk,
    }
  }

  const [weather, soil, forecast, diseaseRisk] = await Promise.all([
    getWeather(lat, lng),
    getSoil(lat, lng),
    getForecast(lat, lng),
    getDiseaseRisk(lat, lng),
  ])
  const rainfall = forecast?.[0]?.rain ?? weather.rainfall ?? 0
  const cropResult = await axios
    .post(`${BASE_URL}/crop-suitability`, {
      temperature: weather.temperature,
      humidity: weather.humidity,
      rainfall,
      soil_type: soil.type,
      ph: soil.ph,
    })
    .then((r) => r.data)
  const crop = cropFromSuitability(cropResult)

  return {
    location: weather.city ?? soil.district ?? mockData.location,
    latitude: lat ?? mockData.latitude,
    longitude: lng ?? mockData.longitude,
    weather,
    soil,
    forecast,
    crop,
    fertilizer: fertilizerForCrop(soil, crop.name),
    irrigation: mockData.irrigation,
    diseaseRisk,
  }
}

/**
 * Fetch the available map layers (with mocked hotspot points).
 * @returns {Promise<Array>}
 */
export const getMapLayers = () => mockRequest(mapLayers, 200)

// Re-export axios so future code can import it from a single place if desired.
export { axios }
