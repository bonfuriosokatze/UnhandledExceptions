# APWCFS — Design Specification

## 1. Design Direction

APWCFS should feel like a **modern environmental intelligence platform**, not a conventional government dashboard and not a generic weather app.

Design keywords:

- Clean
- Scientific
- Calm
- Data-driven
- Trustworthy
- Spatial
- Explainable
- Premium
- Minimal

The interface should make complex atmospheric information feel understandable without hiding scientific depth.

---

# 2. Design System

## Typography

Use a modern sans-serif typeface.

Recommended:

- Inter
- Geist
- IBM Plex Sans

Use a strong hierarchy:

```text
Display → Page title → Section title → Metric → Body → Metadata
```

Avoid excessive font weights.

---

# 3. Color Philosophy

The product must distinguish between:

### Brand/UI colors

Used for:

- Navigation
- Buttons
- Cards
- UI states

### Scientific visualization colors

Used specifically for:

- AQI severity
- pollutant concentration
- temperature
- wind
- plume intensity

Do not use the same semantic color for unrelated concepts.

For the heat map, use a scientifically understandable sequential/diverging scale and provide a legend.

Never make red/green the only way to communicate status.

---

# 4. Landing Page

## Layout

```text
┌───────────────────────────────────────────────┐
│ Logo        Forecast   Science   About        │
├───────────────────────────────────────────────┤
│                                               │
│         FORECAST THE AIR.                    │
│         UNDERSTAND THE WEATHER.              │
│         EXPLAIN THE POLLUTION.               │
│                                               │
│      Short project description               │
│                                               │
│      [ Explore Forecast ]                    │
│                                               │
│              Forecast Preview                │
│                                               │
├───────────────────────────────────────────────┤
│ Why Delhi NCR?                               │
├───────────────────────────────────────────────┤
│ Weather ↔ Chemistry                          │
├───────────────────────────────────────────────┤
│ 72-hour Forecast Preview                     │
├───────────────────────────────────────────────┤
│ Explainable AI                               │
├───────────────────────────────────────────────┤
│ CTA                                           │
└───────────────────────────────────────────────┘
```

The landing page should avoid putting a giant amount of technical information above the fold.

---

# 5. About / Science Page

The About page should be more editorial.

Suggested structure:

```text
Hero
  ↓
The Delhi NCR Problem
  ↓
Why Weather Matters
  ↓
The Coupled Feedback
  ↓
Stubble Burning
  ↓
Our Forecasting Approach
  ↓
XAI
  ↓
Data & Models
  ↓
Limitations
  ↓
Project / SIH
```

Use diagrams and short explanations rather than long walls of text.

---

# 6. Dashboard

The dashboard should be **map-first**.

Recommended desktop layout:

```text
┌──────────────────────────────────────────────────────────┐
│ NAVIGATION                         28 Aug 2026 18:00      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────────────────────────────────────────┐ ┌──────────┐ │
│ │                                          │ │ AQI      │ │
│ │                                          │ │  386     │ │
│ │             DELHI NCR MAP               │ ├──────────┤ │
│ │                                          │ │ PM2.5    │ │
│ │       Pollution Heat Map                │ │ 245      │ │
│ │                                          │ ├──────────┤ │
│ │       🔥 →→→ pollution plume             │ │ PBL      │ │
│ │                                          │ │ 280 m    │ │
│ └──────────────────────────────────────────┘ └──────────┘ │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ 00  06  12  18  24  30  36  48  60  72 HOURS            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Forecast Trend                     Why is it changing?   │
│ ┌─────────────────────────────┐    ┌───────────────────┐ │
│ │             AQI             │    │ PBL Height    ↑   │ │
│ │       ╭──╮                  │    │ Wind          ↓   │ │
│ │   ╭───╯  ╰───╮              │    │ Inversion     ↑   │ │
│ │───╯          ╰────          │    │ Fire plume    ↑   │ │
│ └─────────────────────────────┘    └───────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

# 7. Map Requirements

The map should be the visual anchor.

## Default

**AQI / PM2.5 heat map**

## Controls

A compact layer switcher:

```text
Pollution
[ AQI ] [ PM2.5 ] [ PM10 ] [ O₃ ]

Atmosphere
[ Wind ] [ PBL ] [ Inversion ]

Sources
[ Fires ] [ Plume ]
```

Avoid showing every layer simultaneously by default.

---

# 8. Map Interaction

Users should be able to:

- Zoom
- Pan
- Hover/click regions
- Select forecast time
- Toggle layers
- Inspect local values
- View plume direction
- Compare time periods

Clicking a location should open a contextual panel:

```text
Delhi — 18:00

AQI
386

PM2.5
245 µg/m³

PBL
280 m

Wind
1.2 m/s → SE

Inversion
Strong

Forecast
↑ 18% next 6h
```

---

# 9. Time Slider

The time slider is a core interaction, not a secondary chart control.

Requirements:

- Current time marker
- Forecast horizon
- Play/pause
- Drag/scrub
- Major time labels
- Selected timestamp

When the user moves the slider, all relevant dashboard elements should update together.

---

# 10. XAI Design

The XAI panel should avoid overwhelming users with technical plots.

### Default view

```text
WHY IS POLLUTION HIGH?

Strong pollution accumulation is expected because:

PBL height       ███████████████  High impact
Wind speed       ███████████      High impact
Fire plume       █████████         Medium
Inversion        █████████████     High impact
Humidity         ████              Low
```

Then:

> **Interpretation**

> Low wind speeds and a shallow boundary layer are limiting pollutant dispersion. A regional biomass-burning plume is also projected to influence the region.

### Advanced view

A researcher mode can expose:

- SHAP values
- Feature values
- Model confidence
- Ensemble spread
- Model run ID
- Input timestamp

---

# 11. Stubble-Burning Visualization

Avoid simply showing fire icons.

The intended visual story is:

```text
Fire activity
      ↓
Emission source
      ↓
Wind field
      ↓
Transport
      ↓
Delhi NCR exposure
```

Potential UI:

- Fire hotspot markers
- Animated plume
- Wind arrows
- Source-region label
- Estimated arrival window
- Impact score

The UI should clearly distinguish **observed fire activity** from **modelled plume influence**.

---

# 12. AQI Communication

The interface should show both:

- Numeric AQI
- Human-readable category

Example:

```text
386
Very Poor
```

The legend should remain visible when using the heat map.

For technical users, provide pollutant concentration alongside AQI because AQI alone hides useful information.

---

# 13. Responsive Design

Desktop is the primary target because the dashboard is information-dense.

### Desktop

Map + side panels.

### Tablet

Map + collapsible panels.

### Mobile

Prioritize:

1. AQI
2. Map
3. Time slider
4. Forecast
5. XAI
6. Detailed layers

Avoid attempting to fit the desktop dashboard into a narrow viewport.

---

# 14. UI States

Design explicitly for:

### Loading

Show map skeleton + model status.

### No data

Explain:

> No forecast run is currently available for this timestamp.

### Stale data

Clearly label:

> Last model update: 2h 15m ago

### Model failure

Do not silently show an old forecast as current.

### Uncertainty

Use a visible but unobtrusive uncertainty indicator.

---

# 15. Visual Story

The entire dashboard should tell one continuous story:

```text
OBSERVE
   ↓
Where is pollution?
   ↓
FORECAST
   ↓
Where is it going?
   ↓
EXPLAIN
   ↓
Why is it happening?
   ↓
CONTEXT
   ↓
Is regional burning / weather contributing?
   ↓
OUTLOOK
   ↓
What happens over the next 72 hours?
```

This should guide both UX and component architecture.

---

# 16. Recommended Frontend Structure

Potential implementation:

```text
src/
├── app/
│   ├── page
│   ├── about/
│   ├── science/
│   └── dashboard/
│
├── components/
│   ├── map/
│   ├── forecast/
│   ├── xai/
│   ├── plume/
│   ├── weather/
│   ├── charts/
│   └── ui/
│
├── lib/
│   ├── api/
│   ├── geo/
│   ├── forecast/
│   └── formatting/
│
└── types/
    └── forecast/
```

The scientific backend should not leak model-specific implementation details into UI components.

---

# 17. Design Principle

**Make the complexity available, not mandatory.**

A citizen should understand the map in seconds.

A researcher should be able to drill down into the same forecast and inspect the scientific context.

That is the core design challenge.
