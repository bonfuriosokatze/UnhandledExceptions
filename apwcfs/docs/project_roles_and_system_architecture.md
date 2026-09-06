# Roles and system architecture

## Architectural rule

The browser is a presentation and interaction layer. Scientific computation, credentialed provider access, forecast orchestration, and data-quality decisions belong behind a backend boundary.

## Target architecture

```text
Provider APIs, stations, satellites, fires, NWP
                    |
                    v
          Ingestion and quality control
                    |
                    v
     Normalised observations and forecast inputs
                    |
                    v
        WRF-Chem or validated forecast engine
                    |
                    v
      Post-processing, AQI, uncertainty, XAI
                    |
                    v
              Versioned forecast API
                    |
                    v
                 React client
```

## Responsibilities

### Frontend

Own routing, map interaction, responsive layout, loading and error states, accessible controls, unit formatting, and rendering of source/status metadata. It should not contain provider secrets or make scientific claims from missing fields.

### Backend and data service

Own provider credentials, request caching, rate limits, retries, schema validation, station matching, spatial aggregation, and a consistent response contract. It should return timestamps, units, provenance, quality flags, and model metadata with every dataset.

### Scientific pipeline

Own emissions preparation, meteorological and chemical inputs, model configuration, run scheduling, post-processing, AQI calculation, validation, and uncertainty. Model outputs should be reproducible from a run identifier and configuration.

### Explanation service

Own feature attribution and evidence assembly. A language model can turn structured evidence into readable text, but it should not invent measurements, sources, confidence, or causal conclusions.

### Operations

Own deployment, secrets, observability, data-freshness checks, incident handling, and retention policies. A failed upstream feed should produce a visible degraded state.

## Suggested API shape

```json
{
  "location": { "lat": 28.61, "lon": 77.21 },
  "validAt": "2026-09-03T12:00:00Z",
  "run": { "id": "run-id", "model": "model-name", "version": "version" },
  "values": {
    "aqi": { "value": 180, "unit": "index", "status": "modelled" },
    "pm25": { "value": 92, "unit": "ug/m3", "status": "observed" }
  },
  "quality": { "stale": false, "confidence": "medium" }
}
```

Status, source, time, and units must be part of the contract, not optional UI decoration.

## Data states

| State | Meaning | UI treatment |
| --- | --- | --- |
| observed | Direct provider or station measurement | Show source and observation time |
| estimated | Derived from proxy or fallback logic | Show estimate badge and method |
| modelled | Produced by a forecast or transport model | Show run and valid time |
| stale | Older than the freshness policy | Show warning and timestamp |
| unavailable | No usable value | Show no-data state, never zero |

## Delivery phases

1. Stabilise the prototype: centralise API access, remove client-side secrets, add data-status badges, and test loading and failure states.
2. Build the backend contract: normalise provider data, cache responses, match stations to locations, and publish current observations.
3. Add the forecast pipeline: ingest NWP and emissions, run or consume the coupled model, calculate AQI, and store run metadata.
4. Add decision layers: fire detections, plume trajectories, uncertainty, validation views, alerts, and role-specific access.

## Risks to control

- AOD-to-surface PM2.5 conversion is sensitive to boundary-layer height, humidity, aerosol type, and calibration.
- A nearest station may not represent a clicked coordinate; distance and spatial mismatch must be visible.
- A fire detection does not establish plume arrival or source contribution.
- An LLM explanation can sound certain even when inputs are incomplete; constrain it with structured evidence and deterministic fallbacks.
- AQI formulas and category thresholds differ by standard; name the standard beside the result.
