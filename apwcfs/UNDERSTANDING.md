# APWCFS — Technical & Scientific Understanding

### Smart India Hackathon (SIH 26082)
**Team:** Unhandled Exceptions  
**Ministry:** Ministry of Earth Sciences (MoES)  
**Organization:** National Centre for Medium Range Weather Forecasting (NCMRWF)

---

## 1. Core Paradigm: Weather ↔ Chemistry Coupling

Delhi NCR air pollution cannot be solved by tracking emissions alone. The exact same mass of particulate emissions produces radically different surface concentrations depending on atmospheric state variables:

$$\text{Surface Concentration } C \propto \frac{\text{Emissions } (E)}{\text{PBL Height } (h) \times \text{Wind Speed } (u)}$$

When the Planetary Boundary Layer ($h$) collapses from $1500\text{m}$ (midday summer) to $<300\text{m}$ (nocturnal winter inversion), the effective atmospheric volume available for dispersion contracts by over $80\%$. Combined with wind stalls ($u < 2\text{ m/s}$), dangerous particulates stagnate directly at human respiratory heights.

Furthermore, fine aerosols ($PM_{2.5}$) exert a direct negative radiative forcing on surface heat flux, cooling the ground and delaying the daytime breakup of inversion layers. This creates a self-reinforcing **stagnation trap**.

---

## 2. Ingested Atmospheric & Chemical Telemetry

The platform aggregates 12 real-time parameters combining physical ground sensors and atmospheric satellite models:

```text
GROUND-TRUTH STATIONS (WAQI)             SATELLITE & NUMERICAL MODELS (Open-Meteo)
├── PM2.5 (Fine Particulates)            ├── Carbon Monoxide (WRF-Chem proxy)
├── PM10 (Coarse Particulates)           ├── Sulphur Dioxide (WRF-Chem proxy)
├── Nitrogen Dioxide (NO2)               ├── Aerosol Optical Depth (AOD @ 550nm)
└── Ground-level Ozone (O3)              ├── Wind Speed at 10m (NOAA/DWD)
                                         ├── Ambient Temperature at 2m
                                         ├── Relative Humidity at 2m
                                         ├── Surface Pressure
                                         └── Cloud Cover Percentage
```

### Fallback Empirical Satellite Synthesis
If a queried coordinate is beyond $25\text{km}$ from any verified ground station (or if station sensors are offline), the system activates its empirical satellite synthesis equation:

$$\widehat{PM_{2.5}} = AOD_{550} \times 120 \times f(T) \times f(u) \times f(CO, SO_2)$$

Where:
- $f(T) = 1.25$ if $T < 15^\circ\text{C}$ (thermal inversion factor)
- $f(u) = 1.20$ if $u < 2.0\text{ m/s}$ (stagnation accumulation factor)
- $f(CO) = 1.10$ if $CO > 300\mu\text{g/m}^3$ (combustion plume factor)
- $f(SO_2) = 1.15$ if $SO_2 > 5\mu\text{g/m}^3$ (industrial emission factor)

---

## 3. Dual-Engine XAI (Explainable AI) Architecture

The platform provides multi-layered explanations of pollution events through two complementary engines:

```text
                              USER REQUEST
                        ("Explain" or "Predict")
                                   │
                                   ▼
                         IN-MEMORY CACHE CHECK
                       Key: [lat_round, lng_round]
                                   │
                    ┌──────────────┴──────────────┐
             Cache Hit (0ms)               Cache Miss
                    │                             │
                    ▼                             ▼
            INSTANT RETURN              PRIMARY NEURAL ENGINE
        (No API quota consumed)         (gemini-flash-latest)
                                                  │
                                     ┌────────────┴────────────┐
                                 Success                     Failure
                                     │                       (429 / offline)
                                     ▼                             │
                           STREAMING TOKENS                        ▼
                       (generateContentStream)         LOCAL ATMOSPHERIC ENGINE
                                                       (Deterministic Rules & Equations)
                                                                   │
                                                                   ▼
                                                       CRASH-PROOF REPORT
                                                       (Gold Badge Displayed)
```

### Engine 1: Cloud Generative AI (`gemini-flash-latest`)
- **Diagnostic Generation:** Breaks down 4 explicit analytical sections:
  1. *Data Lineage & Confidence Status* (Provenance of ground vs satellite synthesis).
  2. *Chemical & Physical Drivers* (Feature importance of top 3 pollutants, $PM_{2.5}/PM_{10}$ combustion ratio, precursor gases).
  3. *Meteorological Mechanics & Dispersion Physics* (PBL ventilation, thermal inversions, hygroscopic deliquescence).
  4. *Diagnostic Summary & Human Impact* (Plain-language health advisories and protective actions).
- **72-Hour Forecast Trajectory:** Synthesizes 3-phase progression (Hours 0-24, Hours 24-48, Hours 48-72), forecasting diurnal inversion traps, peak nocturnal windows, and atmospheric clearing regimes.
- **Streaming Pipeline:** Tokens are rendered progressively to the user, eliminating perceived latency.

### Engine 2: Deterministic Local Atmospheric Physics Engine
- 100% offline-safe fallback that executes entirely client-side.
- Evaluates real meteorological thresholds:
  - **Wind Speed $< 2.0\text{ m/s}$:** Declares severe atmospheric boundary layer stagnation.
  - **Temperature $< 18^\circ\text{C}$:** Flags shallow nocturnal temperature inversion caps.
  - **Relative Humidity $> 70\%$:** Diagnoses deliquescent aerosol particle swelling and secondary smog creation.
  - **Combustion Ratio ($PM_{2.5}/PM_{10} > 0.6$):** Flags fine combustion and biomass emissions.
- Automatically sets the UI badge: `🔬 LOCAL ATMOSPHERIC ENGINE`.

---

## 4. Performance & UX Architecture

1. **Dynamic Adjusting Navbar:**
   - Detects window scroll events (`window.scrollY > 20`).
   - Dynamically compresses header height and expands backdrop blur on scroll.
   - Includes live telemetry indicator (`● NCR Telemetry Live`) and active navigation pills.
   - Fixed `z-index: 9999` to ensure Leaflet map controls pass smoothly underneath.

2. **React Portal Viewport Isolation:**
   - Modals are rendered via `createPortal(..., document.body)` with `z-index: 99999`.
   - Immune to ancestor CSS transforms (`transform: translateY(...)`), preventing scroll drift and header clipping bugs.

3. **In-Memory Telemetry Cache:**
   - Coordinate-based hash map retains generated diagnostic outputs.
   - Navigating between Delhi locations and returning retrieves the report in 0ms with zero network requests.

4. **Action Debouncing:**
   - 1.2-second safety lockout prevents accidental multi-clicks or automated quota throttling.
