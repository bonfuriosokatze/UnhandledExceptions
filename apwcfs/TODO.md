# APWCFS — Project Status & Roadmap

### Smart India Hackathon (SIH 26082)
**Team:** Unhandled Exceptions  
**Platform:** Air Pollution – Weather Coupled Forecasting System (Delhi NCR)

---

## ✅ Completed Milestones

### 1. Branding & Identity
- [x] Renamed project and tab titles to **Unhandled Exceptions** / APWCFS.
- [x] Configured clean application metadata in `package.json` and `index.html`.
- [x] Styled team badge and status ticker in top navigation.

### 2. UI / UX & Responsive Design
- [x] **Dynamic Adjusting Navbar:** Sticky glassmorphism header that compresses dynamically on scroll, with active route indicator pills and mobile hamburger toggle.
- [x] **Stacking Context Fix:** Set navbar `z-index: 9999` so Leaflet map controls pass seamlessly underneath.
- [x] **Modal React Portal:** Isolated modal overlay directly into `document.body` via `createPortal` (`z-index: 99999`), eliminating parent CSS transform clipping and scroll-drift.
- [x] **Telemetry Grid Redesign:** Replaced distorted 9-item grid with a clean, balanced 12-tile telemetry dashboard with pill badges and no vertical card stretching.
- [x] **Fluid Map Container:** Responsive viewport height clamp (`clamp(300px, 38vh, 460px)`) preventing layout overflows on standard 1366x768 / 1920x1080 screens.
- [x] **Regulatory Comparison Tab:** Toggle between WHO guidelines and Indian CPCB standards with dynamic pass/fail indicators.

### 3. Data Integration & Harmonization
- [x] **WAQI Ground Truth API:** Integrated real-time physical CAAQMS station telemetry for $PM_{2.5}$, $PM_{10}$, $NO_2$, and $O_3$.
- [x] **Open-Meteo Atmospheric Satellite APIs:** Ingested 8 satellite & numerical parameters ($CO$, $SO_2$, AOD, wind speed, temperature, humidity, surface pressure, cloud cover).
- [x] **Nominatim Reverse Geocoding:** Automatically resolves coordinate clicks into human-readable landmarks across Delhi NCR.
- [x] **Haversine Distance Validation:** Validates physical station proximity; switches to satellite synthesis if nearest station is $>25\text{km}$ away.
- [x] **Empirical Radiative Synthesis:** Fallback equation estimating $PM_{2.5}$ from AOD and meteorological factors when ground sensors are missing.

### 4. Explainable AI (XAI) Architecture
- [x] **Real-Time Token Streaming:** Integrated `generateContentStream` with `gemini-flash-latest` for sub-second perceived latency.
- [x] **Dual Model Cloud Failover:** Primary `gemini-flash-latest` with background failover to `gemini-3.5-flash`.
- [x] **Deterministic Local Atmospheric Physics Engine:** 100% crash-proof offline fallback running physical rule evaluations (PBL stagnation, deliquescent hygroscopic swelling, nocturnal inversions, particulate ratios).
- [x] **Badge Transparency:** Displays `⚡ INSTANT CACHE (0ms)` and `🔬 LOCAL ATMOSPHERIC ENGINE` status indicators.
- [x] **In-Memory Cache:** Coordinate-based cache (`useRef(new Map())`) preventing duplicate API quota consumption on repeated clicks.
- [x] **Action Debouncing:** 1.2-second cooldown on action buttons protecting against quota spam.

---

## 📋 Future Roadmap & Extensions

### 1. Numerical Weather Prediction (NWP) Backend
- [ ] Dedicated WRF-Chem HPC coupling pipeline on local NCMRWF clusters.
- [ ] Automated NetCDF4 dataset ingestion via FastAPI microservices.
- [ ] Automated CAMS emissions inventory ingestion.

### 2. Advanced Spatial Features
- [ ] GeoJSON boundary overlays for all 11 Delhi NCR districts.
- [ ] 72-hour animated plume vector particle layer showing wind transport arrows.
- [ ] Stubble-burning active fire hotspot satellite overlay (VIIRS / MODIS).

### 3. Analytics & Export
- [ ] PDF diagnostic report export for municipal environmental authorities.
- [ ] Historical 30-day temporal trend charts with seasonal bias correction.
