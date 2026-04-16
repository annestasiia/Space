# Space

A mobile-first route generator for Weimar. Answer a few questions — get a real, walkable or rideable route on the map.

---

## What It Does

Space turns your movement preferences into an actual route through Weimar. You pick the activity, distance or time, a start point, and the vibe — the app builds a real road route using OpenStreetMap data and puts it on a map ready to navigate.

Loop routes go out in four directions (N → E → S → W → back) so the path never doubles back on itself. One-way routes take you to a park, forest, or landmark. Time estimates use realistic paces, not car speeds.

---

## Features

- **3 activity modes** — Running, Cycling, Walking
- **Distance or duration input** — e.g. "5 km" or "30 min"
- **Loop & one-way routes** — true circular loops via cardinal waypoints
- **Tag-based preferences** — quiet, green, waterside, shaded, scenic…
- **Interactive map** — full route geometry rendered with Leaflet
- **Nearby POIs** — cafés, benches, parks shown after the route ends
- **Light / dark theme** — toggleable, persisted in localStorage
- **Open in Google Maps** — one tap to start navigation

---

## Tech Stack

| Layer | Tools |
|---|---|
| Framework | Next.js 15 (App Router), TypeScript |
| Styling | Tailwind CSS, CSS custom properties |
| Map | Leaflet + React-Leaflet |
| Routing | OSRM (Project-OSRM public API) |
| POIs | Overpass API (OpenStreetMap) |
| Geocoding | Nominatim |
| Hosting | Vercel |

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/annestasiia/Space.git
cd Space

# Install dependencies
npm install

# Run locally
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
app/
├── components/
│   ├── screens/        # 8 wizard screens (Splash, Step1–6, Result)
│   └── ui/             # LeafletMap, RouteMapWrapper
├── data/
│   └── routes.ts       # Activity labels, tag mapping
├── lib/
│   ├── routing.ts      # OSRM calls, loop/one-way route builders
│   ├── weimar.ts       # Weimar places, waypoint selection, distance parser
│   ├── overpass.ts     # Nearby POI fetching
│   ├── geocoding.ts    # Address → coordinates (Nominatim)
│   └── googleMaps.ts   # Google Maps URL builder
├── types/              # AppState, RouteResult, Coordinate types
├── globals.css         # Theme variables, animations
└── page.tsx            # Root state machine
```

---

## Live Demo

[→ Open app](#)
