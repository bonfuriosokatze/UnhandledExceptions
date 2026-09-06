# APWCFS — Atmospheric Model Options

## 1. Purpose

This document describes candidate scientific modelling approaches for the APWCFS forecasting system.

The product requirement is a **72-hour Delhi NCR air-quality forecast** that can represent the interaction between meteorology and atmospheric chemistry.

The frontend should therefore be designed around a **model-agnostic forecast contract**.

---

# 2. Recommended Direction

## Primary candidate: WRF-Chem

**WRF-Chem** is the strongest candidate for the core coupled modelling requirement because it combines meteorological simulation with atmospheric chemistry processes within the Weather Research and Forecasting framework.

It is suitable for exploring:

- Meteorology
- Aerosol transport
- Gas-phase chemistry
- Emissions
- Aerosol–radiation interactions
- Aerosol–cloud interactions depending on configuration
- Regional pollution transport

However, WRF-Chem is scientifically and computationally complex. It should be treated as a **research/forecasting backend**, not as something the web application runs directly.

---

# 3. Proposed Architecture

```text
External Data
    │
    ├── Weather / NWP
    ├── Satellite
    ├── Fire detections
    ├── Emissions
    └── Observations
             │
             ▼
      Pre-processing
             │
             ▼
       WRF-Chem Run
             │
             ▼
      Post-processing
             │
      ┌──────┴────────┐
      ▼               ▼
Forecast Dataset   Diagnostics
      │               │
      └──────┬────────┘
             ▼
      Forecast API / Files
             │
             ▼
         APWCFS
         Dashboard
```

---

# 4. What WRF-Chem Does in This Project

At a high level, the system would use WRF-Chem to simulate:

### Meteorology

- Temperature
- Pressure
- Wind
- Humidity
- Boundary-layer structure
- Radiation
- Precipitation

### Chemistry

- PM2.5
- PM10 / aerosol species depending on mechanism
- O₃
- NOx
- Other chemical species depending on selected chemistry mechanism

### Coupled effects

Depending on configuration, aerosols can interact with radiation and clouds, while meteorology controls transport and dispersion.

This is the scientific basis for the project's **weather ↔ chemistry** story.

---

# 5. Delhi NCR Domain Strategy

Do not begin with an extremely high-resolution operational domain.

Start with a manageable nested-domain experiment.

Conceptually:

```text
D01 — North India / regional transport
        ↓
D02 — Delhi NCR / surrounding region
        ↓
D03 — optional high-resolution urban domain
```

The exact domain size, resolution, nesting and vertical configuration should be determined through scientific experimentation and available compute.

The regional domain matters because Delhi pollution is not only a local phenomenon.

---

# 6. Why Regional Context Matters

The model should capture transport from surrounding regions.

Important processes include:

- Agricultural burning
- Regional emissions
- Synoptic wind patterns
- Boundary-layer evolution
- Temperature inversions
- Atmospheric stagnation
- Chemical transformation during transport

The dashboard should therefore not draw an artificial boundary around Delhi and ignore the surrounding atmosphere.

---

# 7. Stubble-Burning Workflow

A proposed pipeline:

```text
Satellite Active Fire Data
          │
          ▼
   Fire Detection / QC
          │
          ▼
 Emission Estimation
          │
          ▼
   Chemical Emission Input
          │
          ▼
       WRF-Chem
          │
          ▼
Regional Pollution Transport
          │
          ▼
Delhi NCR Concentration
```

The system should preserve the distinction between:

**Observed**

- Fire detection

and

**Modelled**

- Emission estimate
- Plume transport
- Delhi NCR contribution

This distinction is important for scientific credibility.

---

# 8. Temperature Inversion

The model/output processing layer should derive indicators of atmospheric stability and inversion conditions.

Potential outputs:

- Vertical temperature profile
- Surface temperature
- Temperature at selected pressure/height levels
- PBL height
- Inversion strength
- Inversion-layer altitude

A product-level "inversion strength" score can then be created for the dashboard.

However, the exact formula should be defined scientifically rather than chosen only for visualization.

---

# 9. PBL Height

PBL height is especially important for the product because it provides an intuitive connection between atmospheric dynamics and pollution concentration.

Example interpretation:

```text
Shallow PBL
     ↓
Less vertical mixing
     ↓
Pollutants remain concentrated near surface
     ↓
Higher surface PM concentration
```

The dashboard should expose PBL height both numerically and as an explanatory driver.

---

# 10. XAI Architecture

XAI should sit **after model inference**, not inside the core atmospheric solver.

```text
WRF-Chem
   │
   ▼
Forecast Features
   │
   ├── Meteorology
   ├── Chemistry
   ├── Fire/plume indicators
   └── Historical/observational features
             │
             ▼
      Forecast / Correction Model
             │
             ▼
          XAI Layer
             │
             ▼
      Feature Attribution
             │
             ▼
       Human Explanation
```

A practical architecture may use a machine-learning correction/downscaling model on top of physical model output.

For example:

```text
WRF-Chem + observations
          │
          ▼
 ML bias correction / downscaling
          │
          ▼
       Final forecast
          │
          ▼
        SHAP/XAI
```

This can be easier to explain than attempting to generate SHAP values directly from the entire WRF-Chem numerical system.

---

# 11. Candidate Model Stack

## Option A — WRF-Chem only

```text
Weather + Chemistry → WRF-Chem → AQI
```

### Advantages

- Strong physical basis
- Directly aligned with the challenge
- Coupled meteorology/chemistry

### Disadvantages

- Computationally expensive
- Difficult to operate
- Large configuration space
- More difficult to iterate quickly

### Recommendation

Best as the core scientific model if adequate compute and domain expertise are available.

---

# Option B — WRF-Chem + ML Correction

```text
WRF-Chem
   +
Observations
   ↓
ML correction
   ↓
Final forecast
   ↓
XAI
```

### Advantages

- Can correct systematic model bias
- Better product-level accuracy potential
- XAI is easier to implement
- Strong hybrid physics + ML story

### Disadvantages

- More complex pipeline
- Requires sufficient historical observations
- Risk of overfitting

### Recommendation

**Strong long-term architecture.**

---

# Option C — WRF + Separate Chemistry/CTM

```text
WRF
 ↓
Meteorology
 ↓
Chemical Transport Model
 ↓
Pollution Forecast
```

Examples of compatible regional chemical-transport approaches can be evaluated if WRF-Chem becomes impractical.

### Advantages

- Modular
- Components can be replaced independently
- Useful for experimentation

### Disadvantages

- Does not provide the same integrated coupling story as WRF-Chem
- More complex integration

### Recommendation

Good fallback architecture.

---

# Option D — ML Forecasting Baseline

Use:

- Historical AQI/PM observations
- Weather
- Satellite/fire indicators
- Temporal features
- Regional pollutant features

to build an ML forecast.

Candidate models:

- XGBoost
- LightGBM
- Random Forest
- Temporal neural networks

### Purpose

This should be treated as a **baseline and benchmark**, not necessarily the final scientific system.

It is extremely useful for answering:

> Does the coupled physical model actually improve the forecast?

---

# 12. Recommended Experimental Roadmap

## Phase 1 — Baseline

Build:

```text
Observed pollution
+
Weather
+
Fire indicators
       ↓
ML baseline
       ↓
72h forecast
```

This provides a fast working benchmark.

## Phase 2 — WRF

Run meteorological modelling for the Delhi NCR domain.

Validate:

- Temperature
- Wind
- PBL
- Humidity
- Precipitation

## Phase 3 — WRF-Chem

Add chemical transport and emissions.

Validate:

- PM2.5
- PM10
- O₃
- NOx
- Major pollution episodes

## Phase 4 — Biomass-burning experiments

Compare scenarios:

```text
Normal emissions
        vs
Normal + biomass-burning emissions
```

This can help quantify the modelled influence of regional fires.

## Phase 5 — ML correction

Train a correction layer against observations.

## Phase 6 — XAI

Expose the most important forecast drivers.

## Phase 7 — Operational pipeline

Automate:

```text
Data ingestion
 → preprocessing
 → model run
 → postprocessing
 → validation
 → API
 → dashboard
```

---

# 13. Forecast Data Contract

The frontend should consume a model-independent schema.

Example:

```json
{
  "run_id": "2026-08-28T00:00Z",
  "valid_time": "2026-08-29T12:00Z",
  "location": {
    "lat": 28.6139,
    "lon": 77.2090
  },
  "pollution": {
    "aqi": 286,
    "pm25": 182,
    "pm10": 291,
    "o3": 64,
    "nox": 81
  },
  "meteorology": {
    "temperature": 18.4,
    "wind_speed": 1.4,
    "wind_direction": 320,
    "humidity": 72,
    "pbl_height": 310
  },
  "atmosphere": {
    "inversion_strength": 0.82
  },
  "sources": {
    "fire_activity": 0.68,
    "biomass_burning_influence": 0.54
  },
  "uncertainty": {
    "aqi": 31
  }
}
```

This is an illustrative schema, not a finalized scientific data definition.

---

# 14. Model Validation

Validation must be part of the product architecture.

Potential reference observations:

- Ground monitoring stations
- Official AQI measurements
- Meteorological observations
- Satellite observations
- Relevant fire products

Metrics:

### Continuous

- MAE
- RMSE
- Bias
- Correlation

### Categorical

- AQI category accuracy
- Confusion matrix
- Episode detection

### Spatial

- Spatial correlation
- Grid/station comparison

### Event-based

Evaluate specifically during:

- Severe winter pollution episodes
- Temperature inversion events
- High biomass-burning periods
- Strong wind-clearing events

---

# 15. Important Scientific Caveat

Do not claim that WRF-Chem automatically produces an accurate forecast simply because it is a coupled model.

Accuracy depends on:

- Initial/boundary conditions
- Emission inventories
- Fire emission estimates
- Chemistry mechanism
- Aerosol representation
- Meteorological parameterizations
- Resolution
- Data assimilation
- Model configuration
- Computational resources
- Validation

The product should communicate this honestly.

---

# 16. Recommended Final Architecture

For APWCFS, the strongest long-term concept is:

```text
                 OBSERVATIONS
                      │
      ┌───────────────┼────────────────┐
      ▼               ▼                ▼
 Weather/NWP      Satellite        Ground AQ
      │               │                │
      └───────────────┼────────────────┘
                      ▼
                PREPROCESSING
                      │
                      ▼
                   WRF-Chem
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
 Meteorological                 Chemistry
 outputs                        outputs
        │                           │
        └─────────────┬─────────────┘
                      ▼
               POST-PROCESSING
                      │
                      ▼
              ML CORRECTION
                (optional)
                      │
                      ▼
               FINAL FORECAST
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
      HEAT MAP                  XAI
          │                       │
          └───────────┬───────────┘
                      ▼
                APWCFS
                 DASHBOARD
```

This architecture preserves the physical-model story while allowing the product to improve accuracy and explainability over time.
