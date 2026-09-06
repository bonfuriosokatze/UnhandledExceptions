# Explainable AI (XAI) System — APWCFS

### Air Pollution & Weather Coupled Forecasting System
**Team:** Unhandled Exceptions | **SIH 26082**

---

## 1. Why Explainability (XAI) is Critical in Atmospheric Forecasting

Conventional AQI applications merely state a number (e.g. `AQI: 340`). However, environmental authorities and public health officials cannot make operational decisions without understanding **why** the spike occurred.

Did the pollution jump because of:
1. **Source Emission Escalation** (e.g., upwind stubble burning, thermal power emissions)?
2. **Boundary Layer Compression** (e.g., nocturnal temperature inversions trapping constant emissions)?
3. **Moisture Deliquescence** (e.g., high humidity converting fine aerosols into dense secondary smog)?

APWCFS provides this exact diagnostic transparency through its dual-engine XAI architecture.

---

## 2. Engine 1: Cloud Generative Neural Model (`gemini-flash-latest`)

### 2.1 Workflow Pipeline
1. Ingests all 12 standardized atmospheric parameters.
2. Formats prompt with strict scientific domain roles.
3. Consumes real-time streamed tokens (`generateContentStream`), updating UI state progressively.
4. Caches full markdown result into `explanationCache` keyed by geographic coordinate hash.

### 2.2 Diagnostic Report Structure
- **Section 1: Data Lineage & Confidence Status**
  - Clarifies ground-truth instrumentation vs satellite WRF-Chem radiometer synthesis.
- **Section 2: Chemical & Physical Drivers (Feature Importance)**
  - Identifies top 3 dominant atmospheric drivers.
  - Analyzes the particulate combustion ratio ($PM_{2.5} / PM_{10}$):
    - Ratio $> 0.6$: Fine combustion and secondary aerosol dominance (vehicular/biomass).
    - Ratio $< 0.5$: Coarse crustal dust loading.
  - Cross-references $CO$ and $SO_2$ alongside 550nm AOD to identify industrial plumes.
- **Section 3: Meteorological Mechanics & Dispersion Physics**
  - Evaluates planetary boundary layer ventilation index ($u \times h$).
  - Explains radiative cooling and nocturnal temperature inversion formation.
  - Diagnoses hygroscopic aerosol swelling ($RH > 70\%$).
- **Section 4: Diagnostic Summary & Human Impact**
  - Plain-language translational guidance for average citizens.
  - Actionable protective advisories (N95/FFP2 masks, HEPA filtration schedules, vulnerable group precautions).

---

## 3. Engine 2: Deterministic Local Atmospheric Physics Engine

To guarantee $100\%$ uptime during hackathon evaluations, live field demonstrations, and cloud outages, APWCFS includes a client-side deterministic rule engine.

### 3.1 Core Physical Rule Evaluators

#### Rule A: Planetary Boundary Layer (PBL) Stagnation
```javascript
if (wind_speed < 2.0) {
  // Severe atmospheric boundary layer stagnation.
  // Advective horizontal transport stalls, concentrating surface emissions.
}
```

#### Rule B: Nocturnal Thermal Inversion
```javascript
if (temperature < 18.0 && pressure > 1013) {
  // Radiative surface cooling creates a stable thermal inversion cap.
  // Suppresses vertical convective updrafts and traps pollutants near breathing heights.
}
```

#### Rule C: Deliquescence & Secondary Inorganic Aerosol Swelling
```javascript
if (humidity > 70.0) {
  // Particulates absorb ambient water vapor via hygroscopic growth.
  // Particle cross-section expands, compounding visual extinction and smog density.
}
```

#### Rule D: Particulate Morphology Ratio
```javascript
const pmRatio = pm25 / pm10;
if (pmRatio > 0.6) {
  // Fine combustion/secondary aerosol regime.
} else {
  // Coarse crustal dust/mechanical suspension regime.
}
```

### 3.2 72-Hour Forecast Trajectory Synthesizer
- Evaluates 3 distinct 24-hour windows:
  - **Phase 1 (Hours 00–24):** Immediate boundary layer dynamics and current ventilation rate.
  - **Phase 2 (Hours 24–48):** Diurnal nocturnal inversion trap and morning vehicular flux accumulation.
  - **Phase 3 (Hours 48–72):** Convective mixing re-establishment and synoptic atmospheric clearing.
- Computes trajectory delta ($\Delta = \text{Phase}_3 - \text{Phase}_1$) to classify trend as **Improving**, **Deteriorating**, or **Stagnant**.
- Generates a structured ASCII / Markdown comparison matrix.
- Automatically flags the report with the gold badge: `🔬 LOCAL ATMOSPHERIC ENGINE`.
