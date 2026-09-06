# API Specification — APWCFS

### Air Pollution & Weather Coupled Forecasting System
**Team:** Unhandled Exceptions | **SIH 26082**

---

## 1. External APIs Ingested

### 1.1 World Air Quality Index (WAQI) Ground Telemetry
- **Endpoint:** `https://api.waqi.info/feed/geo:{lat};{lng}/?token={VITE_WAQI_API_KEY}`
- **Method:** `GET`
- **Purpose:** Ingest direct Continuous Ambient Air Quality Monitoring Station (CAAQMS) sensor measurements.
- **Key Response Fields:**
  ```json
  {
    "status": "ok",
    "data": {
      "aqi": 182,
      "city": { "name": "Mandir Marg, Delhi", "geo": [28.62, 77.20] },
      "iaqi": {
        "pm25": { "v": 98.4 },
        "pm10": { "v": 165.2 },
        "no2": { "v": 32.1 },
        "o3": { "v": 14.8 }
      },
      "forecast": {
        "daily": {
          "pm25": [
            { "day": "2026-09-06", "min": 85, "max": 140, "avg": 112 },
            { "day": "2026-09-07", "min": 110, "max": 185, "avg": 145 },
            { "day": "2026-09-08", "min": 95, "max": 160, "avg": 128 }
          ]
        }
      }
    }
  }
  ```

---

### 1.2 Open-Meteo Satellite Atmospheric & Weather API
- **Endpoint:** `https://api.open-meteo.com/v1/forecast`
- **Parameters:**
  - `latitude`: Selected latitude
  - `longitude`: Selected longitude
  - `current`: `temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,cloud_cover`
- **Method:** `GET`
- **Purpose:** Planetary boundary layer parameters, surface wind vectors, temperature, and moisture.

---

### 1.3 Open-Meteo Air Quality & WRF-Chem Chemical Proxy API
- **Endpoint:** `https://air-quality-api.open-meteo.com/v1/air-quality`
- **Parameters:**
  - `latitude`: Selected latitude
  - `longitude`: Selected longitude
  - `current`: `aerosol_optical_depth,carbon_monoxide,sulphur_dioxide`
- **Method:** `GET`
- **Purpose:** Columnar Aerosol Optical Depth (AOD at 550nm) and trace combustion gases ($CO$, $SO_2$).

---

### 1.4 OpenStreetMap Nominatim Reverse Geocoder
- **Endpoint:** `https://nominatim.openstreetmap.org/reverse`
- **Parameters:**
  - `lat`: Selected latitude
  - `lon`: Selected longitude
  - `format`: `json`
- **Method:** `GET`
- **Purpose:** Resolves GPS coordinates into localized Delhi NCR landmarks and district names.

---

## 2. Google Gemini Generative AI Neural Pipeline

### 2.1 Model Specification
- **Primary:** `gemini-flash-latest`
- **Secondary Failover:** `gemini-3.5-flash`
- **Generation Config:** `temperature: 0.2` (enforces deterministic scientific rigor).
- **Execution Mode:** `generateContentStream` for real-time token streaming.

### 2.2 Ingested Prompt Schema (Diagnostic Explain)
```text
SYSTEM: Explainable AI Environmental Data Scientist
INPUT PARAMETERS:
- Location Landmark
- Data Provenance (Ground Station vs Satellite Radiometer)
- PM2.5, PM10, NO2, O3, CO, SO2, AOD
- Temperature, Relative Humidity, Wind Speed, Cloud Cover, Pressure
OUTPUT SECTIONS:
1. Data Lineage & Confidence Status
2. Chemical & Physical Drivers (Feature Importance)
3. Meteorological Mechanics & Dispersion Physics
4. Diagnostic Summary & Human Impact
```

### 2.3 Ingested Prompt Schema (72-Hour Forecast Trajectory)
```text
SYSTEM: Predictive Atmospheric Physics AI Model
INPUT PARAMETERS:
- Location Landmark
- 72-Hour Daily WAQI Forecast Breakdown (Phase 1, Phase 2, Phase 3)
- Boundary Layer Dynamics, Wind Vector, Hygroscopic Growth
OUTPUT SECTIONS:
1. 72-Hour Macro Trajectory Overview
2. Phase-by-Phase Physical Mechanics (Hours 0-24, 24-48, 48-72)
3. Atmospheric Sensitivity & Uncertainty Factors
4. Actionable 72-Hour Health & Operational Guidance
```

---

## 3. Internal In-Memory Cache Key Schema

```text
explain_{lat.toFixed(2)}_{lng.toFixed(2)}  --> String (Markdown Diagnostic Report)
predict_{lat.toFixed(2)}_{lng.toFixed(2)}  --> String (Markdown 72h Trajectory Report)
```
- **Hit Latency:** $\approx 0\text{ms}$
- **Quota Cost:** 0 API units.
