# Data Ingestion & Harmonization Pipeline — APWCFS

### Air Pollution & Weather Coupled Forecasting System
**Team:** Unhandled Exceptions | **SIH 26082**

---

## 1. Pipeline Overview

The data pipeline merges heterogeneous physical ground telemetry with satellite observations to form a unified 12-parameter telemetry vector.

```text
Coordinates Clicked (lat, lng)
             │
             ├──► [Parallel Call 1] Open-Meteo Weather API
             │       └──► Temperature, Humidity, Pressure, Wind Speed, Cloud Cover
             │
             ├──► [Parallel Call 2] Open-Meteo Air Quality API
             │       └──► AOD (550nm), Carbon Monoxide, Sulphur Dioxide
             │
             ├──► [Parallel Call 3] OpenStreetMap Nominatim
             │       └──► Landmark string (District, Sector, Colony)
             │
             └──► [Sequential Call 4] WAQI Ground API (Token-authenticated)
                     │
                     ├── Check status === 'ok'
                     │
                     └── Haversine Distance Check:
                             d = calculateDistance(userLat, userLng, stationLat, stationLng)
                             │
                             ├── If d <= 25 km:
                             │      Accept Ground Station Truth
                             │      isEstimated = false
                             │
                             └── If d > 25 km (or call fails):
                                    Activate Satellite Synthesis Equation
                                    isEstimated = true
```

---

## 2. Haversine Spatial Distance Validation

To ensure ground stations are truly representative of the local microclimate (rather than an unrepresentative station 60km away), the pipeline enforces the Haversine formula:

$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1) \cdot \cos(\phi_2) \cdot \sin^2\left(\frac{\Delta \lambda}{2}\right)$$

$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1 - a}\right)$$

$$d = R \cdot c \quad (R = 6371\text{ km})$$

If $d > 25\text{km}$, the ground station is rejected as non-local, and the system switches to Pure Satellite Estimation.

---

## 3. Empirical Radiative & Meteorological Satellite Synthesis

When ground sensors are unavailable, $PM_{2.5}$ is calculated via the empirical aerosol optical formula:

$$\widehat{PM_{2.5}} = AOD_{550} \times 120 \times K_{\text{temp}} \times K_{\text{wind}} \times K_{\text{CO}} \times K_{\text{SO}_2}$$

### Coefficient Weights:
- **Baseline Conversion:** $120\mu\text{g/m}^3$ per unit of columnar AOD at 550nm.
- **Low Temperature Inversion ($T < 15^\circ\text{C}$):** $K_{\text{temp}} = 1.25$ (accounts for nocturnal boundary layer compression).
- **Stagnation Wind ($u < 2.0\text{ m/s}$):** $K_{\text{wind}} = 1.20$ (accounts for lack of horizontal ventilation).
- **Elevated Carbon Monoxide ($CO > 300\mu\text{g/m}^3$):** $K_{\text{CO}} = 1.10$ (biomass/stubble burning tracer).
- **Elevated Sulphur Dioxide ($SO_2 > 5\mu\text{g/m}^3$):** $K_{\text{SO}_2} = 1.15$ (heavy coal/industrial combustion marker).

---

## 4. Indian National Air Quality Index (CPCB) Calculation

The platform implements the exact piecewise linear interpolation standard published by the Central Pollution Control Board (CPCB) of India for $PM_{2.5}$:

$$I = \left[\frac{I_{\text{high}} - I_{\text{low}}}{C_{\text{high}} - C_{\text{low}}}\right] \cdot (C - C_{\text{low}}) + I_{\text{low}}$$

### CPCB Breakpoint Lookup Table:

| Category | Concentration Range ($C$, $\mu\text{g/m}^3$) | AQI Index Range ($I$) | Health Impact |
|---|---|---|---|
| **Good** | $0 - 30$ | $0 - 50$ | Minimal impact |
| **Satisfactory** | $31 - 60$ | $51 - 100$ | Minor breathing discomfort to sensitive people |
| **Moderate** | $61 - 90$ | $101 - 200$ | Breathing discomfort to people with lungs, asthma and heart diseases |
| **Poor** | $91 - 120$ | $201 - 300$ | Breathing discomfort to most people on prolonged exposure |
| **Very Poor** | $121 - 250$ | $301 - 400$ | Respiratory illness on prolonged exposure |
| **Severe** | $251 - 350+$ | $401 - 500$ | Affects healthy people and seriously impacts those with existing diseases |
