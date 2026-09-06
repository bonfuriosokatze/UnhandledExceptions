# APWCFS — Air Pollution & Weather Coupled Forecasting System

### Smart India Hackathon (SIH 26082)
**Team:** Unhandled Exceptions  
**Ministry:** Ministry of Earth Sciences (MoES)  
**Organization:** National Centre for Medium Range Weather Forecasting (NCMRWF)  
**Domain:** Software → Clean & Green Technology  
**Geographic Domain:** Delhi NCR (Subcontinental High-Resolution Bounding Basin)

---

## 📌 Executive Summary & Problem Statement

Traditional Air Quality Index (AQI) forecasting models often treat **ambient meteorology** and **particulate chemical transport** as isolated phenomena. However, in heavily burdened geographical basins like **Delhi NCR**, complex two-way coupling exists between atmospheric dynamics and pollution:

- 🌫️ **Thermal Inversion Trapping:** Rapid nocturnal ground radiation cools surface air, producing a shallow Planetary Boundary Layer (PBL < 400m) that traps vehicular and industrial emissions directly in citizen breathing zones.
- 🔥 **Regional Biomass & Stubble Transboundary Plumes:** Upwind emissions from agricultural fires interact with synoptic wind vectors, compounding local particulate burdens.
- ☀️ **Aerosol Direct Radiative Forcing:** Dense concentrations of fine particulates ($PM_{2.5}$) attenuate solar insolation, altering surface heat flux, weakening vertical convective turbulence, and prolonging atmospheric stagnation.
- 💧 **Deliquescence & Secondary Smog Formation:** Elevated relative humidity ($>70\%$) induces hygroscopic aerosol growth, transforming fine particles into dense secondary aerosol smog droplets.

Ignoring these **meteorology ↔ chemistry feedback loops** leads conventional statistical models to fail catastrophically during critical pollution events.

**APWCFS** addresses this challenge through a **Coupled Real-Time Diagnostic and 72-Hour Explainable Forecasting Platform**, integrating physical ground observations, satellite radiometry, explainable AI (Gemini Flash streaming tokens), and an offline deterministic atmospheric physics engine.

---

## 🏗️ System Architecture

```text
                                  DATA SOURCES LAYER
          ┌───────────────────────────────┼───────────────────────────────┐
          ▼                               ▼                               ▼
    WAQI Ground Truth             Open-Meteo Satellite            Nominatim Geocoder
(Direct CAAQMS Sensors)      (WRF-Chem Proxies & NOAA/DWD)    (Reverse Spatial Landmark)
          │                               │                               │
          └───────────────────────┬───────┴───────────────────────────────┘
                                  ▼
                    DATA HARMONIZATION & MERGE ENGINE
        • 12 Real-Time Physical & Chemical Atmospheric Parameters
        • Spatial Radius Validation (Haversine distance <= 25km)
        • Satellite Estimation Failover via Empirical Radiative Equations
                                  │
                                  ▼
                   CORE PRESENTATION & FORECAST LAYER
                 (React 19 + Vite + Leaflet Heat GIS)
        • Dynamic Adjusting Glassmorphism Header (Scroll-Responsive)
        • Subcontinental Air Quality Heatmap with CPCB Scale
        • 12-Tile Balanced Telemetry Grid with Status Badging
        • WHO & CPCB Regulatory Compliance Comparator
                                  │
                                  ▼
                  DUAL-ENGINE EXPLAINABLE AI (XAI) LAYER
          ┌───────────────────────────────────────────────────────────────┐
          │ PRIMARY: Cloud Neural Engine (Google Gemini Flash Latest)     │
          │ • Token-by-Token Real-Time Streaming Output                   │
          │ • 4-Stage Diagnostic Pipeline & Trajectory Synthesizer        │
          ├───────────────────────────────────────────────────────────────┤
          │ FALLBACK: Deterministic Local Atmospheric Physics Engine      │
          │ • 100% Offline-Safe, Zero-Latency, Crash-Proof Failover       │
          │ • Evaluates PBL Stagnation, Deliquescence & Inversions       │
          └───────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                   PERFORMANCE & RESILIENCE CONTROLS
        • In-Memory Fast Cache (0ms instant re-query, 0 API quota)
        • UI Debouncing Cooldown (1.2s rapid-click protection)
        • React Portal Viewport Anchoring (z-index 99999)
```

---

## 🔬 Ingested 12-Parameter Telemetry Matrix

The harmonization pipeline merges station telemetry with satellite atmospheric models:

| # | Ingested Parameter | Source Channel | Meteorological & Chemical Significance |
|---|---|---|---|
| 1 | **$PM_{2.5}$ (Fine)** | WAQI Ground / Sat | Alveolar-penetrating fine combustion particulates ($<2.5\mu\text{m}$) |
| 2 | **$PM_{10}$ (Coarse)** | WAQI Ground Truth | Crustal matter, road dust, and mechanical aerosol loading |
| 3 | **$NO_2$ (Nitrogen Dioxide)** | WAQI Ground Truth | Primary vehicular combustion and thermal emission marker |
| 4 | **$O_3$ (Ground Ozone)** | WAQI Ground Truth | Secondary photochemical oxidant formed via $VOC + NO_x + h\nu$ |
| 5 | **$CO$ (Carbon Monoxide)** | Satellite WRF-Chem | Incomplete combustion and biomass burning tracer |
| 6 | **$SO_2$ (Sulphur Dioxide)** | Satellite WRF-Chem | Coal combustion, brick kilns, and industrial point sources |
| 7 | **AOD (550nm)** | Satellite Radiometer | Columnar aerosol optical depth measuring atmospheric attenuation |
| 8 | **Wind Speed ($10\text{m}$)** | NOAA / DWD Satellite | Advective horizontal transport and ventilation index |
| 9 | **Ambient Temperature** | NOAA / DWD Satellite | Planetary boundary layer height and nocturnal thermal inversion marker |
| 10 | **Relative Humidity** | NOAA / DWD Satellite | Deliquescence, aerosol swelling, and aqueous-phase sulfate formation |
| 11 | **Surface Pressure** | NOAA / DWD Satellite | Synoptic anticyclonic subsidence vs cyclonic dispersion |
| 12 | **Cloud Cover** | NOAA / DWD Satellite | Solar insolation attenuation and nocturnal radiative cooling trap |

---

## ⚡ Explainable AI (XAI) & Dual-Engine Architecture

### 1. Primary Cloud Neural Engine
- **Model:** `gemini-flash-latest` (with automatic background failover to `gemini-3.5-flash`).
- **Real-Time Token Streaming:** Renders tokens directly as they are generated by the neural network (`generateContentStream`), delivering sub-second perceived response times.
- **In-Memory Cache (0ms Latency):** Caches generated reports by coordinate bounding boxes, eliminating redundant API quota consumption on repeat location clicks.
- **Click Debouncing:** Enforces a 1.2-second safety buffer across action buttons to protect against quota exhaustion.

### 2. Deterministic Local Atmospheric Physics Engine
If internet connectivity drops or Gemini API limits (HTTP 429) are encountered, the system activates its internal physical rule engine:
- **PBL Stagnation Rule:** Identifies wind speeds $< 2.0\text{ m/s}$ as severe advective transport stalls.
- **Hygroscopic Deliquescence Rule:** Flags humidity $> 70\%$ as active aerosol water absorption and secondary smog thickening.
- **Thermal Inversion Profiling:** Evaluates ambient temperatures $< 18^\circ\text{C}$ alongside high surface pressure as shallow inversion layers.
- **Combustion Ratio Analysis:** Evaluates $PM_{2.5} / PM_{10}$ ratio ($>0.6$ indicates secondary combustion aerosols; $<0.5$ indicates coarse mechanical dust).
- **Trajectory Forecast Synthesis:** Computes 3-phase 24-hour pollutant escalation, peak nocturnal hazard windows, and exposure mitigations.

---

## 🎨 User Experience & Design Features

- **Dynamic Adjusting Navbar:** Sticky glassmorphism header that monitors scroll position, dynamically compressing its height, deepening blur, and elevating shadow on scroll.
- **Active Navigation Pills:** Visually highlights active routes (`About`, `Science`, `Dashboard`) with glowing indicator pills.
- **Live Status Ticker:** Displays a continuous live pulsing telemetry indicator (`● NCR Telemetry Live`).
- **Subcontinental Map:** Integrated Leaflet map with custom CPCB gradient heat circles and interactive point selection across Delhi NCR.
- **Modal React Portal:** Renders AI diagnostic modals via `createPortal` directly into `document.body` at `z-index: 99999`, completely eliminating scroll drift and parent transform clipping bugs.

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/apwcfs.git
cd apwcfs-main/apwcfs
```

### 2. Configure Environment Variables
Create a `.env` file in the `apwcfs/` directory:
```env
# World Air Quality Index API Key (Get free key from https://aqicn.org/data-platform/token/)
VITE_WAQI_API_KEY=your_waqi_api_key_here

# Google Gemini API Key (Get free key from https://aistudio.google.com/)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Launch Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` (or `http://localhost:5173/dashboard`).

### 5. Production Build
```bash
npm run build
```

---

## 👥 Project Team

**Team Name:** Unhandled Exceptions  
**Competition:** Smart India Hackathon (SIH 26082)  
**Target Organization:** National Centre for Medium Range Weather Forecasting (NCMRWF), Ministry of Earth Sciences (MoES)
