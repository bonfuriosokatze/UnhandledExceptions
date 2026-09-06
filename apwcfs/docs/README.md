# Air Pollution – Weather Coupled Forecasting System

### Delhi NCR Focus | Smart India Hackathon – SIH 26082

**Ministry:** Ministry of Earth Sciences (MoES)
**Organization:** National Centre for Medium Range Weather Forecasting (NCMRWF)
**Category:** Software → Clean & Green Technology

## 📌 Problem Statement

Traditional Air Quality Index (AQI) forecasting models often treat **meteorology** and **air pollution dispersion** as separate processes. However, in highly polluted urban environments such as **Delhi NCR**, there is a critical two-way interaction between atmospheric conditions and pollutants.

During peak pollution periods, particularly winter:

* 🌫️ **Atmospheric temperature inversions** suppress vertical mixing and trap pollutants near the surface.
* 🔥 **Stubble-burning emissions** from surrounding regions can cause significant external pollution spikes.
* ☀️ High concentrations of aerosols such as **PM2.5** reduce incoming solar radiation.
* 🌡️ Changes in radiation can modify **surface temperature and atmospheric stability**.
* 💨 These changes influence **wind patterns and Planetary Boundary Layer (PBL) height**.
* 🧪 Changes in meteorological conditions subsequently affect chemical transport and pollutant concentrations.

Ignoring these **meteorology–chemistry feedback loops** can significantly reduce the accuracy of conventional AQI forecasting systems.

## 🎯 Objective

The goal is to develop a **high-resolution, weather–chemistry coupled forecasting system** specifically designed for **Delhi NCR** that provides actionable **72-hour air-quality forecasts**.

The system will dynamically couple atmospheric meteorology with chemical transport to predict:

* **PM2.5**
* **PM10**
* **Ground-level O₃**
* **NOₓ**
* **AQI**
* Atmospheric inversion strength
* Planetary Boundary Layer (PBL) height
* Pollution transport and dispersion
* Regional stubble-burning plume impacts

## 🌍 Proposed Solution

The proposed system will leverage an advanced open-source coupled atmospheric model such as **WRF-Chem** or a comparable weather–chemistry framework.

The model will integrate:

```text
        Meteorological Inputs
                 │
                 ▼
     ┌─────────────────────────┐
     │   Atmospheric Model      │
     │       WRF / WRF-Chem     │
     └────────────┬────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
   Weather State        Chemistry
        │                   │
        │             PM2.5 / PM10
        │             O3 / NOx
        │                   │
        └─────────┬─────────┘
                  │
                  ▼
       Two-Way Feedback Loop
                  │
                  ▼
        72-Hour AQI Forecast
                  │
                  ▼
        Delhi NCR Dashboard
```

### 🔄 Coupled Feedback Mechanism

The system will model the interaction between:

# Air Pollution and Weather Coupled Forecasting System

## Project brief

APWCFS is a proposed Delhi NCR forecasting and decision-support system for the Smart India Hackathon SIH 26082 challenge, associated with the Ministry of Earth Sciences and NCMRWF. Its central premise is that air pollution is a weather-chemistry problem: emissions, atmospheric transport, vertical mixing, and chemical transformation interact continuously.

The current repository contains the frontend prototype. The target system described here is the next stage of the project and must be implemented with measured data, reproducible model runs, and explicit uncertainty.

## Problem

An AQI value without context cannot answer the operational questions that matter:

1. Where is pollution concentrated?
2. Is it likely to worsen during the next 72 hours?
3. Are local emissions or regional transport contributing more?
4. Are weak winds, a shallow planetary boundary layer, or an inversion limiting dispersion?
5. When should people and authorities expect conditions to improve?

Delhi NCR is especially sensitive to winter stagnation, temperature inversions, humidity-driven aerosol growth, traffic and industrial emissions, and seasonal agricultural-residue burning in surrounding regions.

## Target capability

The production system should ingest meteorological, chemical, emissions, satellite, and fire data; run or consume a validated coupled forecast; calculate AQI; and expose forecast fields and explanations through a versioned API.

Target outputs include PM2.5, PM10, O3, NO2/NOx, AQI, wind, temperature, humidity, PBL height, inversion indicators, plume transport, and regional fire influence. A 72-hour horizon is a product requirement, not a capability of the current prototype.

## Scientific chain

```text
Observations and forecasts
       |
       v
Quality control and spatial/temporal alignment
       |
       v
Emissions and meteorological initialisation
       |
       v
Coupled weather-chemistry model or validated surrogate
       |
       v
Post-processing, AQI, uncertainty, and attribution
       |
       v
Versioned forecast API
       |
       v
Map, timeline, alerts, and public explanation
```

Meteorology influences transport, dispersion, deposition, and chemical rates. Aerosols can in turn modify radiation and surface energy balance. The system should describe these as modelled interactions, not claim that an individual feature proves causation.

## Regional burning

Fire detections are evidence of active fire, not proof that smoke has reached Delhi. A defensible burning-impact workflow is:

```text
Fire detections -> emissions estimate -> wind and stability -> transport model
                                                 |
                                                 v
                                  Delhi NCR concentration contribution
```

The UI must distinguish observed fire activity, estimated emissions, and modelled plume influence.

## Current versus planned

| Area | Current prototype | Target system |
| --- | --- | --- |
| Map | Leaflet regional heat visualization | Versioned gridded forecast layers |
| Air quality | WAQI station data with Open-Meteo fallback | Quality-controlled observations and model fields |
| PM2.5 fallback | Empirical AOD and weather estimate | Calibrated retrieval or model assimilation |
| Forecast | No operational 72-hour forecast | Reproducible 72-hour forecast runs |
| Explanation | Optional Gemini report and local fallback | Evidence-linked attribution and uncertainty |
| Fires and plumes | Not yet implemented | Satellite fire and trajectory layers |

## Acceptance principles

- Every value has a timestamp, unit, source, and status such as observed, estimated, or modelled.
- Forecasts are validated against held-out observations and reported with uncertainty.
- The system fails visibly when data are stale or missing.
- Sensitive provider credentials stay server-side in production.
- AQI categories follow the selected standard and are labelled with that standard.

See [architecture and responsibilities](project_roles_and_system_architecture.md), [product understanding](UNDERSTANDING.md), and [design requirements](DESIGN.md) for the working specification.
* PBL height
