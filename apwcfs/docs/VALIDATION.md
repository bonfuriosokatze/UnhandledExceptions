# Validation & Verification Guide — APWCFS

### Air Pollution & Weather Coupled Forecasting System
**Team:** Unhandled Exceptions | **SIH 26082**

---

## 1. Automated Build Verification

The application is validated for production compilation using Vite:

```bash
cd apwcfs
npm run build
```

### Expected Benchmark Results:
- **Build Status:** Exits with code `0`.
- **Modules Transformed:** 369+ modules.
- **Build Duration:** $< 2.0\text{ seconds}$.
- **Bundle Footprint:** Client bundle $< 950\text{ kB}$ uncompressed ($\approx 290\text{ kB}$ gzipped).

---

## 2. Telemetry Pipeline Verification

1. **Station Proximity Verification:**
   - Click on Central Delhi (e.g., Kartavya Path, Mandir Marg).
   - Expected: Telemetry shows `GROUND` badge for $PM_{2.5}$ and $PM_{10}$ with verified station landmark.
2. **Satellite Synthesis Failover:**
   - Click outside the 25km radius (e.g., remote peripheral farmlands).
   - Expected: Telemetry dynamically switches to `SAT ESTIMATE` with AOD-derived values, preventing null crashes.

---

## 3. Explainable AI (XAI) Verification

1. **Cloud Token Streaming (`gemini-flash-latest`):**
   - Click `Explain Current` or `Predict 72-Hour`.
   - Expected: Modal opens via React Portal directly in `document.body`. Step indicators (1 to 4) light up, followed by real-time token streaming with pulsating cursor indicator.
2. **In-Memory Cache (0ms Retrieval):**
   - Close the modal and immediately re-click the same action button.
   - Expected: The report displays instantly ($0\text{ms}$) with the `⚡ INSTANT CACHE (0ms)` header badge, consuming zero API quota.
3. **Deterministic Local Atmospheric Physics Fallback:**
   - Temporarily disable the Gemini API key or disconnect network.
   - Expected: The system catches the error silently, runs the local deterministic physics engine, renders the structured markdown report with ASCII/Markdown tables, and displays the `🔬 LOCAL ATMOSPHERIC ENGINE` header badge.

---

## 4. UI & Responsive Header Verification

1. **Scroll-Responsive Dynamic Header:**
   - In the browser, scroll down by $> 20\text{px}$.
   - Expected: The navbar smoothly compresses its padding from $1.05\text{rem}$ to $0.65\text{rem}$, deepens its backdrop blur, elevates its drop shadow, and maintains Leaflet map controls underneath (`z-index: 9999`).
2. **Active Route Indicators:**
   - Navigate between `/`, `/science`, and `/dashboard`.
   - Expected: The active route displays a subtle glowing pill background and border.
3. **Modal Isolation:**
   - While scrolled halfway down the page, open the XAI modal.
   - Expected: The modal remains perfectly centered on the physical viewport without header truncation or parent transform displacement.
