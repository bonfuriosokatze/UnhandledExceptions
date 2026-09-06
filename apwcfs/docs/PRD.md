# APWCFS — Product Requirements Document (PRD)

**Project:** Air Pollution – Weather Coupled Forecasting System  
**Focus:** Delhi NCR  
**Challenge:** Smart India Hackathon — SIH 26082  
**Primary outcome:** A clear, trustworthy 72-hour pollution forecasting experience combining a Delhi NCR pollution heat map, stubble-burning context, weather/atmospheric conditions, and explainable AI (XAI).

---

## 1. Product Vision

APWCFS is a public-facing environmental intelligence platform for understanding **where pollution is, where it is going, when it is expected to worsen, and why**.

The product should not feel like a generic AQI website. Its central experience is a **forecast map + explanation layer**:

> **See the pollution → move through time → understand the drivers → understand the likely impact.**

The platform will eventually use a coupled atmospheric modelling workflow such as **WRF-Chem** to produce or support high-resolution forecasts. The product layer must remain useful even while the scientific modelling backend is being iterated.

---

## 2. Product Goals

### Primary goals

1. Present Delhi NCR pollution in an immediately understandable visual form.
2. Provide a **72-hour forecast** with a time-based map experience.
3. Show the relationship between pollution, meteorology, and regional biomass burning.
4. Explain forecast changes using an XAI layer.
5. Communicate uncertainty and model limitations honestly.
6. Create a polished foundation that can later connect to a production WRF-Chem pipeline.
7. Make the system useful to citizens, researchers, and decision-makers without requiring atmospheric-science expertise.

### Secondary goals

- Provide historical context for major pollution episodes.
- Enable comparison of AQI and individual pollutants.
- Show stubble-burning activity and predicted plume movement.
- Surface inversion and PBL conditions.
- Provide model/data provenance.
- Create an architecture that can scale beyond Delhi NCR.

---

## 3. Non-Goals for the First Version

The first product release should **not** attempt to:

- Replace official regulatory air-quality measurements.
- Make medical diagnoses or personalized health recommendations.
- Claim perfect attribution of Delhi pollution to a single source.
- Build a full atmospheric chemistry research platform in the frontend.
- Expose every WRF-Chem configuration parameter to users.
- Present model output as ground truth.
- Build a nationwide forecasting system before Delhi NCR is validated.

---

# 4. Information Architecture

The initial product should be designed around **three primary pages**.

## Page 1 — Landing / Home

Purpose: establish the product and move users toward the forecast experience.

### Sections

1. Hero
2. Short problem statement
3. Product value proposition
4. Forecast preview
5. How it works
6. Why Delhi NCR
7. XAI / explainability preview
8. CTA to dashboard
9. Footer

### Hero message

The hero should communicate the core concept in one sentence.

Suggested direction:

> **Forecast the air. Understand the weather. Explain the pollution.**

Supporting statement:

> A weather–chemistry coupled forecasting platform designed to understand and predict air pollution across Delhi NCR over the next 72 hours.

Primary CTA:

> **Explore 72-Hour Forecast**

Secondary CTA:

> **How It Works**

---

# Page 2 — About / Science

Purpose: explain the challenge and the scientific approach without overwhelming users.

This page can later contain the finalized problem statement, project motivation, methodology, team information, references, and challenge details.

### Suggested sections

- Why Delhi NCR?
- The pollution problem
- Why conventional forecasting can struggle
- Weather ↔ chemistry feedback
- Temperature inversions
- Stubble-burning transport
- WRF-Chem / coupled modelling
- XAI
- Data sources
- Project / SIH context
- Limitations and responsible use

This page should be written for a technically curious general audience rather than only atmospheric scientists.

---

# Page 3 — Dashboard

Purpose: the main functional product.

The dashboard is the **primary deliverable** and should receive the highest design and engineering priority.

## Dashboard hierarchy

### A. Top-level status

Show:

- Current/selected forecast time
- AQI category
- AQI value
- PM2.5
- PM10
- O₃
- NOₓ
- Forecast confidence / quality indicator

### B. Main map

The map is the hero component.

Default layer:

> **72-hour Delhi NCR AQI / pollution heat map**

Users should be able to switch layers:

- AQI
- PM2.5
- PM10
- O₃
- NOₓ
- Inversion strength
- PBL height
- Wind
- Stubble-burning hotspots
- Predicted plume

### C. Time controller

A prominent timeline should allow:

- Now
- +6h
- +12h
- +24h
- +48h
- +72h

Prefer continuous scrubbing if technically practical.

Changing the time should update:

- Heat map
- Forecast values
- Plume position
- Wind field
- Inversion/PBL indicators
- XAI explanation

### D. Forecast trend

A compact 72-hour chart should show AQI and/or PM2.5.

The selected map time should be synchronized with the chart.

### E. Explainability panel

The dashboard should answer:

> **Why is pollution expected to increase here?**

Example explanation:

> Pollution is expected to rise over the next 8–12 hours due to weak winds, a shallow planetary boundary layer, strong near-surface stability, and an approaching regional biomass-burning plume.

Then show contributing factors.

Example:

| Driver | Direction | Relative contribution |
|---|---|---:|
| PM2.5 background | Increase | High |
| PBL height | Decrease | High |
| Wind speed | Decrease | Medium |
| Biomass-burning plume | Increase | Medium |
| Humidity | Increase | Low |

The exact contribution methodology must depend on the final model architecture.

### F. Stubble-burning panel

Show:

- Active fire hotspots
- Fire intensity / confidence where available
- Regional source areas
- Wind direction
- Estimated plume path
- Estimated arrival window
- Delhi NCR impact level

Avoid presenting source attribution as certain when the model only provides probabilistic evidence.

### G. Atmospheric conditions

Compact cards:

- Temperature
- Wind
- Relative humidity
- PBL height
- Inversion strength
- Precipitation

---

# 5. User Stories

## Citizen

> As a Delhi NCR resident, I want to see how pollution is expected to change over the next 72 hours so I can understand the severity and timing of pollution episodes.

## Researcher

> As a researcher, I want to inspect pollutant, meteorological, and plume layers together so I can understand the forecast dynamics.

## Decision-maker

> As a decision-maker, I want an early visual indication of an approaching pollution episode and its likely duration.

## Technical reviewer

> As a reviewer, I want to understand which data, models, and factors produced a forecast and what its limitations are.

---

# 6. Core Functional Requirements

## FR-01 — Current Pollution Map

The system shall display a Delhi NCR geospatial pollution map.

## FR-02 — 72-Hour Forecast

The system shall provide forecast values for the next 72 hours.

## FR-03 — Pollutant Layers

The system shall support AQI, PM2.5, PM10, O₃ and NOₓ where model data is available.

## FR-04 — Weather Layers

The system shall support temperature, wind, humidity, PBL height and inversion-related indicators.

## FR-05 — Stubble-Burning Overlay

The system shall display relevant regional fire detections and/or estimated biomass-burning influence.

## FR-06 — Plume Visualization

The system should visualize forecast pollutant transport where scientifically justified by the model output.

## FR-07 — XAI

The system shall expose interpretable drivers behind selected forecast values.

## FR-08 — Time Synchronization

Map, charts, weather, plume and XAI views should correspond to the selected forecast timestamp.

## FR-09 — Data Provenance

The system should expose the source/model timestamp for important forecast products.

## FR-10 — Uncertainty

The system should communicate forecast confidence or uncertainty where available.

---

# 7. XAI Product Requirements

XAI is not simply a technical model feature. It is a **user-facing explanation system**.

The explanation layer should answer three questions:

### What?

> AQI is forecast to reach 380 at 18:00.

### Why?

> Weak winds and a shallow PBL are reducing dispersion while a regional biomass-burning plume approaches.

### What changes next?

> Conditions are expected to improve after 06:00 as winds increase and boundary-layer mixing strengthens.

Potential XAI techniques:

- SHAP
- Feature permutation importance
- Partial dependence / response analysis
- Counterfactual explanations
- Physics-derived rule explanations
- Model ensemble spread

For the first version, prioritize **clear feature attribution + physics-grounded explanations** over complex XAI visuals.

---

# 8. Scientific Output Contract

The modelling layer should eventually expose a consistent forecast dataset containing, where possible:

```text
timestamp
latitude
longitude
AQI
PM2.5
PM10
O3
NOx
temperature
wind_speed
wind_direction
relative_humidity
PBL_height
surface_pressure
precipitation
inversion_strength
fire_activity
biomass_burning_influence
plume_probability
forecast_uncertainty
model_run_id
```

The exact schema should be finalized after the model pipeline is selected.

---

# 9. Non-Functional Requirements

### Performance

- Dashboard should load the initial view quickly.
- Map interactions should remain responsive.
- Heavy scientific processing should happen offline/asynchronously, not in the browser.

### Reliability

- Display model/data timestamps.
- Gracefully handle missing forecast runs.
- Never silently show stale data as current.

### Accessibility

- Do not rely on color alone to communicate AQI categories.
- Provide legends and numeric values.
- Ensure adequate text contrast.
- Support keyboard-accessible controls where practical.

### Explainability

Every major forecast visualization should have enough context to understand:

- What is being shown?
- When was it generated?
- What model/data produced it?
- What does it mean?

---

# 10. Success Metrics

### Product

- Users can understand current pollution status within seconds.
- Users can find the worst forecast period within 72 hours quickly.
- Users can identify major forecast drivers without reading technical documentation.

### Technical

- Forecast pipeline produces a consistent 72-hour output.
- Map and chart remain synchronized.
- Model runs are reproducible.
- Forecast data has clear timestamps and provenance.

### Scientific

Evaluation should include:

- RMSE / MAE for pollutant concentrations
- AQI-category accuracy
- Peak-event detection
- Spatial forecast error
- Temporal correlation
- Performance during inversion episodes
- Performance during biomass-burning episodes

---

# 11. MVP

The first demonstrable MVP should contain:

1. Clean landing page
2. About/science page
3. Delhi NCR dashboard
4. AQI heat map
5. 72-hour timeline
6. AQI + PM2.5 forecast chart
7. Weather cards
8. Stubble-burning hotspot overlay
9. Basic plume visualization
10. XAI explanation panel
11. Model/data timestamp
12. Responsive desktop-first UI

The MVP does **not** need a fully operational WRF-Chem production system to validate the frontend architecture.

---

# 12. Future Versions

### V1

- Interactive dashboard
- Forecast map
- Basic model output
- Stubble-burning layer
- Basic XAI

### V2

- Operational WRF-Chem workflow
- Automated data ingestion
- Ensemble forecasts
- Uncertainty visualization
- Better source attribution
- Historical event analysis

### V3

- Automated model validation
- Multi-model comparison
- Alerting
- API access
- More cities / regions
- Researcher mode

---

# 13. Product Principle

The product should always answer:

> **Where? When? Why? What next?**

**Where** — pollution heat map  
**When** — 72-hour forecast timeline  
**Why** — XAI + meteorology + emissions  
**What next** — expected evolution and impact

That should be the organizing principle of APWCFS.
