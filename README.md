# 🌾 AI Weather Intelligence Platform

A modern, production-quality **frontend-only** dashboard for an AI-powered
Agricultural Weather Intelligence system. Built with React + Vite, Leaflet,
Tailwind CSS and mocked APIs — designed so real REST endpoints can be dropped
in later with **zero changes to components**.

![stack](https://img.shields.io/badge/React-Vite-blue) ![style](https://img.shields.io/badge/TailwindCSS-3-38bdf8) ![map](https://img.shields.io/badge/Leaflet-1.9-green)

## ✨ Features

- **Gradient navbar** with live date/time and light/dark theme toggle.
- **Sidebar** navigation (Weather, Soil, Crop, Forecast, Disease Risk, Irrigation, Fertilizer, Settings).
- **Interactive Leaflet map** centered on India — click to drop a marker, pan, zoom and open a rich popup.
- **Floating layer control** — toggle Temperature / Rainfall / Humidity / Soil / Crop Suitability / Disease Risk overlays (mocked hotspots).
- **Info cards** — Weather, Soil, Crop, 3-Day Forecast and AI Recommendation with coloured badges.
- **Glassmorphism UI**, soft shadows, rounded cards, smooth animations and hover effects.
- **Skeleton loaders** while data loads, plus an **empty state** until a location is chosen.
- Fully **responsive** and **light/dark** themed.

## 🚀 Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically <http://localhost:5173>).

Build for production:

```bash
npm run build
npm run preview
```

## 🗂 Project structure

```
src/
  components/
    Navbar.jsx          # gradient navbar + clock + theme toggle
    Sidebar.jsx         # icon navigation rail
    MapView.jsx         # Leaflet map, marker, popup, layer overlays
    WeatherCard.jsx
    SoilCard.jsx
    CropCard.jsx
    ForecastCard.jsx
    RecommendationCard.jsx
    LayerControl.jsx    # floating layer checkboxes
    Loading.jsx         # skeleton loaders
    ui.jsx              # shared StatRow / Badge / CardShell primitives
  pages/
    Dashboard.jsx       # composes the whole dashboard
  services/
    api.js              # mocked API functions (Promise-based)
  data/
    mockData.js         # mocked JSON dataset + map layers
  App.jsx               # theme + layout
  main.jsx              # entry point
```

## 🔌 Connecting a real backend (FastAPI)

All data access lives in **`src/services/api.js`**. Each function already
returns a `Promise`, exactly like Axios. To go live, replace the mocked body
with a real request — components stay untouched:

```js
// Before (mocked)
export const getWeather = (lat, lng) => mockRequest(mockData.weather)

// After (real)
export const getWeather = (lat, lng) =>
  axios.get(`${BASE_URL}/weather`, { params: { lat, lng } }).then((r) => r.data)
```

Set the backend URL via an env file (see `.env.example`):

```
VITE_API_URL=http://localhost:8000/api
```

## 🧱 Tech stack

React (Vite) · JavaScript · Leaflet.js · React Leaflet · Axios · Tailwind CSS · React Icons
