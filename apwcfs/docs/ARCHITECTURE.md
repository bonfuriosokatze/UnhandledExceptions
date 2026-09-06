# System Architecture — APWCFS

### Air Pollution & Weather Coupled Forecasting System (Delhi NCR)
**Team:** Unhandled Exceptions | **SIH Problem Statement:** SIH 26082

---

## 1. High-Level Architecture Overview

APWCFS is structured into three decoupled layers: the **Data Ingestion & Harmonization Layer**, the **Core Forecasting & Presentation Layer**, and the **Dual-Engine Explainable AI (XAI) Layer**.

```text
+-----------------------------------------------------------------------------------+
|                           1. DATA INGESTION & HARMONIZATION                       |
|                                                                                   |
|   +-----------------------+   +------------------------+   +------------------+   |
|   |   WAQI Ground Truth   |   |  Open-Meteo Satellite  |   | Nominatim Reverse|   |
|   |  (PM2.5, PM10, NO2,   |   |   (WRF-Chem Proxies:   |   |     Geocoder     |   |
|   |          O3)          |   |  CO, SO2, AOD, Weather)|   |   (NCR Landmark) |   |
|   +-----------+-----------+   +-----------+------------+   +--------+---------+   |
|               |                           |                         |             |
|               +---------------------+-----+-------------------------+             |
|                                     |                                             |
|                                     v                                             |
|                     Haversine Spatial Validation (< 25km)                         |
|                     Empirical Satellite Synthesis Fallback                        |
+-------------------------------------+---------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------------+
|                        2. CORE PRESENTATION & GIS LAYER                           |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   | Dynamic Adjusting Header (Sticky Glassmorphism, Scroll-Compress, Z: 9999)  |   |
|   +---------------------------------------------------------------------------+   |
|   | Leaflet Geospatial Subcontinental Heatmap (CPCB Color Breaks & Hotspots)  |   |
|   +---------------------------------------------------------------------------+   |
|   | 12-Tile Unified Telemetry Dashboard (Status Badges: Ground vs Satellite)   |   |
|   +---------------------------------------------------------------------------+   |
|   | Standards Comparator (WHO 24h Limits vs Indian CPCB National Standards)   |   |
|   +---------------------------------------------------------------------------+   |
+-------------------------------------+---------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------------+
|                      3. DUAL-ENGINE EXPLAINABLE AI (XAI)                          |
|                                                                                   |
|         +---------------------------------------------------------------+         |
|         | In-Memory Cache Check (Key: lat_2dec, lng_2dec) -> 0ms Latency|         |
|         +-------------------------------+-------------------------------+         |
|                                         |                                         |
|                   +---------------------+---------------------+                   |
|                   | (Cache Miss / Online)                     | (Offline / 429)   |
|                   v                                           v                   |
|   +-------------------------------+           +-------------------------------+   |
|   | Primary: Cloud Neural Engine  |           | Fallback: Local Atmospheric   |   |
|   | (gemini-flash-latest)         |           | Physics Engine                |   |
|   | • Token-by-Token Streaming    |           | • Deterministic Meteorology   |   |
|   | • 4-Stage Diagnostic Report   |           | • PBL Stagnation Rules        |   |
|   | • 72h Trajectory Breakdown    |           | • Deliquescence / Smog Rules  |   |
|   +---------------+---------------+           +---------------+---------------+   |
|                   |                                           |                   |
|                   +---------------------+---------------------+                   |
|                                         |                                         |
|                                         v                                         |
|                 React Portal Viewport Anchoring (z-index: 99999)                  |
|                 KaTeX Mathematical Formatting & Markdown Tables                   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Frontend Component Architecture

The web client is built with **React 19** and **Vite**, structured as follows:

- **`Navbar.jsx`**:
  - Dynamically listens to window scroll events.
  - Automatically transitions between full-height hero view and compact glassmorphism header.
  - Includes real-time status ticker (`● NCR Telemetry Live`) and active navigation pills.
  - Configured with `z-index: 9999` to cleanly layer over Leaflet map controls.

- **`Map.jsx` (`MapComponent`)**:
  - Implements Leaflet with custom OpenStreetMap cartography.
  - Generates real-time Gaussian heat circles centered on Delhi NCR.
  - Handles interactive click events, transmitting exact coordinates (`lat`, `lng`) to the parent dashboard.
  - Displays CPCB color-coded legend: Good (0-50), Satisfactory (51-100), Moderate (101-200), Poor (201-300), Very Poor (301-400), Severe (401-500).

- **`Dashboard.jsx`**:
  - Coordinates multi-source asynchronous data fetching via `Promise.all`.
  - Merges ground truth observations with atmospheric satellite models.
  - Houses the dual-engine XAI pipelines (`handleExplain` and `handlePredict`).
  - Manages `explanationCache` (in-memory hash map) and debouncing controls.
  - Mounts AI modal overlays directly to `document.body` via `createPortal`.

---

## 3. Resilience & Error Handling Architecture

1. **Station Out-of-Range Failover:**
   When the user clicks in rural or unmonitored sectors where the nearest physical station exceeds $25\text{km}$, the system automatically sets `isEstimated: true` and estimates $PM_{2.5}$ using AOD and atmospheric stability factors.

2. **Cloud API Failure Protection:**
   If Google Cloud rate limits (HTTP 429) or offline network states occur, the system catches the error silently, activates the Deterministic Local Atmospheric Physics Engine, sets the gold badge (`🔬 LOCAL ATMOSPHERIC ENGINE`), and displays a full scientific report without user-facing errors.

3. **In-Memory Cache:**
   Prevents repetitive API calls by hashing query coordinates to a 2-decimal precision key. Repeat requests for the same area load in $0\text{ms}$ with zero quota usage.
