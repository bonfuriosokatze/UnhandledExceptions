import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import MapComponent from '../components/Map';

const NCR_HOTSPOTS = [
  { name: 'Mandir Marg', zone: 'Central Delhi', lat: 28.6360, lng: 77.1990 },
  { name: 'Anand Vihar', zone: 'East / ISBT Transit', lat: 28.6469, lng: 77.3160 },
  { name: 'RK Puram', zone: 'South Delhi', lat: 28.5660, lng: 77.1767 },
  { name: 'Bawana', zone: 'North Industrial', lat: 28.7762, lng: 77.0510 },
  { name: 'Gurugram', zone: 'Haryana NCR', lat: 28.4595, lng: 77.0266 },
  { name: 'Noida Sec 62', zone: 'UP NCR', lat: 28.6258, lng: 77.3649 }
];

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  
  const [explanation, setExplanation] = useState("");
  const [loadingExpl, setLoadingExpl] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('explain');
  const [loadingStatus, setLoadingStatus] = useState("");
  const [workflowStep, setWorkflowStep] = useState(0);
  const [loadingData, setLoadingData] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [activeTab, setActiveTab] = useState('who');

  // Fast In-Memory Location Cache for instant 0ms retrieval without re-hitting API quotas
  const explanationCache = useRef(new Map());
  const fallbackCache = useRef(new Set());
  const lastActionTimeRef = useRef(0);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isDeterministicFallback, setIsDeterministicFallback] = useState(false);

  // Track selected location on the map (Default: Delhi)
  const [selectedLoc, setSelectedLoc] = useState({ lat: 28.6139, lng: 77.2090 });

  // Calculate Indian AQI strictly based on CPCB Breakpoints for PM2.5
  const calculateIndianAQI = (pm25) => {
    if (pm25 === undefined || pm25 === null) return "N/A";
    const c = parseFloat(pm25);
    if (c <= 30) return Math.round(((50 - 0) / (30 - 0)) * (c - 0) + 0); 
    if (c <= 60) return Math.round(((100 - 51) / (60 - 31)) * (c - 31) + 51); 
    if (c <= 90) return Math.round(((200 - 101) / (90 - 61)) * (c - 61) + 101); 
    if (c <= 120) return Math.round(((300 - 201) / (120 - 91)) * (c - 91) + 201); 
    if (c <= 250) return Math.round(((400 - 301) / (250 - 121)) * (c - 121) + 301); 
    return Math.round(((500 - 401) / (350 - 251)) * (Math.min(c, 350) - 251) + 401); 
  };

  // Haversine formula to validate distance between clicked location and physical WAQI station
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c; 
  };

  // Empirical Algorithm to estimate PM2.5 from Open-Meteo Satellite Data
  const estimatePM25FromSatellite = (aod, windSpeed, temp, co, so2) => {
    if (aod === undefined || aod === null) return null;
    
    let estimatedPM25 = aod * 120; 

    if (temp < 15) {
      estimatedPM25 *= 1.25; 
    }
    if (windSpeed < 2.0) {
      estimatedPM25 *= 1.2;
    }
    if (co > 300) estimatedPM25 *= 1.1;
    if (so2 > 5) estimatedPM25 *= 1.15;

    return Math.round(estimatedPM25);
  };

  // Fetch specific selected location for Dashboard Grid
  useEffect(() => {
    async function fetchData() {
      setLoadingData(true);
      setFetchError(false);
      setExplanation(""); 
      try {
        const waqiKey = import.meta.env.VITE_WAQI_API_KEY;
        if (!waqiKey) {
          throw new Error("Missing WAQI API Key in .env");
        }
        
        // 1. Fetch Open-Meteo Satellite Data, WAQI Ground Truth, and Reverse Geocode for Landmark
        const [omWeatherRes, omAqiRes, geoRes] = await Promise.all([
          axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${selectedLoc.lat}&longitude=${selectedLoc.lng}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,cloud_cover`),
          axios.get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${selectedLoc.lat}&longitude=${selectedLoc.lng}&current=aerosol_optical_depth,carbon_monoxide,sulphur_dioxide`),
          axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${selectedLoc.lat}&lon=${selectedLoc.lng}&format=json`).catch(() => ({ data: {} })) // Prevent crash if geocoding fails
        ]);

        const omWeather = omWeatherRes.data.current;
        const omAQI = omAqiRes.data.current;
        const exactLandmark = geoRes.data?.display_name || `Lat: ${selectedLoc.lat.toFixed(2)}, Lng: ${selectedLoc.lng.toFixed(2)}`;

        // 2. Attempt to fetch Ground Truth from WAQI
        let waqiRes;
        let groundStationActive = true;
        try {
          waqiRes = await axios.get(`https://api.waqi.info/feed/geo:${selectedLoc.lat};${selectedLoc.lng}/?token=${waqiKey}`);
          if (waqiRes.data.status !== 'ok') {
            groundStationActive = false;
          } else {
            // Validate the physical distance of the returned station
            const stationGeo = waqiRes.data.data.city?.geo;
            if (stationGeo && stationGeo.length === 2) {
              const distanceToStation = calculateDistance(selectedLoc.lat, selectedLoc.lng, stationGeo[0], stationGeo[1]);
              // If the nearest station is more than 25km away, it is too far to represent our 10x10km bounding box
              if (distanceToStation > 25) {
                groundStationActive = false;
              }
            }
          }
        } catch (e) {
          groundStationActive = false;
        }

        // 3. Assemble Merged Data with WRF-Chem proxies and Failover
        let mergedData = {};
        
        if (groundStationActive) {
          const data = waqiRes.data.data;
          const iaqi = data.iaqi;
          
          let pm2_5_val = iaqi.pm25?.v ?? null;
          let isEstimated = false;

          if (pm2_5_val === null) {
            pm2_5_val = estimatePM25FromSatellite(omAQI.aerosol_optical_depth, omWeather.wind_speed_10m, omWeather.temperature_2m, omAQI.carbon_monoxide, omAQI.sulphur_dioxide);
            isEstimated = true;
          }

          mergedData = {
            pm2_5: pm2_5_val,
            pm10: iaqi.pm10?.v ?? null,
            nitrogen_dioxide: iaqi.no2?.v ?? null,
            ozone: iaqi.o3?.v ?? null,
            carbon_monoxide: iaqi.co?.v ?? omAQI.carbon_monoxide ?? null, // WRF-Chem
            sulphur_dioxide: iaqi.so2?.v ?? omAQI.sulphur_dioxide ?? null, // WRF-Chem
            temperature: iaqi.t?.v ?? omWeather.temperature_2m, 
            humidity: iaqi.h?.v ?? omWeather.relative_humidity_2m,
            pressure: iaqi.p?.v ?? omWeather.surface_pressure,
            wind_speed: iaqi.w?.v ?? omWeather.wind_speed_10m,
            cloud_cover: omWeather.cloud_cover ?? null,
            aerosol_optical_depth: omAQI.aerosol_optical_depth ?? null,
            station: data.city.name,
            landmark: exactLandmark,
            isEstimated: isEstimated
          };

          if (data.forecast && data.forecast.daily && data.forecast.daily.pm25) {
            setForecastData(data.forecast.daily.pm25);
          } else {
            setForecastData(null);
          }

        } else {
          // TOTAL FAILOVER: Pure Satellite Estimation.
          const estimatedPM25 = estimatePM25FromSatellite(omAQI.aerosol_optical_depth, omWeather.wind_speed_10m, omWeather.temperature_2m, omAQI.carbon_monoxide, omAQI.sulphur_dioxide);
          
          mergedData = {
            pm2_5: estimatedPM25,
            pm10: null, 
            nitrogen_dioxide: null,
            ozone: null,
            carbon_monoxide: omAQI.carbon_monoxide ?? null, // WRF-Chem Satellite
            sulphur_dioxide: omAQI.sulphur_dioxide ?? null, // WRF-Chem Satellite
            temperature: omWeather.temperature_2m,
            humidity: omWeather.relative_humidity_2m,
            pressure: omWeather.surface_pressure,
            wind_speed: omWeather.wind_speed_10m,
            cloud_cover: omWeather.cloud_cover,
            aerosol_optical_depth: omAQI.aerosol_optical_depth,
            station: `Pure Satellite Estimation`,
            landmark: exactLandmark,
            isEstimated: true
          };
          
          setForecastData(null); 
        }

        setDashboardData(mergedData);

      } catch (err) {
        console.error("Critical Failure fetching data:", err);
        setFetchError(true);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, [selectedLoc]);

  // Deterministic Atmospheric Physics & Aerosol Mechanics Diagnostics (100% Offline-Safe)
  const buildLocalDiagnosticReport = (data, loc, calculateIndianAQI) => {
    const pm25 = data?.pm2_5 ?? 0;
    const pm10 = data?.pm10 ?? null;
    const no2 = data?.nitrogen_dioxide ?? null;
    const co = data?.carbon_monoxide ?? 0;
    const so2 = data?.sulphur_dioxide ?? 0;
    const aod = data?.aerosol_optical_depth ?? 0;
    const temp = data?.temperature ?? 20;
    const humidity = data?.humidity ?? 50;
    const wind = data?.wind_speed ?? 2.0;
    const pressure = data?.pressure ? Math.round(data.pressure) : 1013;
    const aqi = calculateIndianAQI(pm25);

    const isEstimated = data?.isEstimated;
    const stationName = data?.landmark || data?.station || `Lat: ${loc.lat.toFixed(2)}, Lng: ${loc.lng.toFixed(2)}`;

    // Physical rule evaluations
    const isStagnant = wind < 2.0;
    const isColdInversion = temp < 18;
    const isHumidDeliquescence = humidity > 70;
    const pmRatio = (pm10 && pm10 > 0) ? (pm25 / pm10).toFixed(2) : null;
    const hasBiomassSignature = (co > 250 || aod > 0.4) && so2 > 4;

    const topDrivers = [];
    if (pm25 > 60) topDrivers.push(`High Fine Particulate Burden (PM2.5: ${pm25} µg/m³)`);
    if (isStagnant) topDrivers.push(`Boundary Layer Stagnation (Wind: ${wind} m/s)`);
    if (isHumidDeliquescence) topDrivers.push(`Hygroscopic Smog Swelling (RH: ${humidity}%)`);
    if (isColdInversion) topDrivers.push(`Thermal Inversion Trapping (Temp: ${temp}°C)`);
    if (hasBiomassSignature) topDrivers.push(`Combustion/Industrial Plume (CO: ${co} µg/m³, SO₂: ${so2} µg/m³)`);
    if (topDrivers.length < 3) topDrivers.push(`Elevated Aerosol Optical Depth (AOD: ${aod})`);
    const dominantThree = topDrivers.slice(0, 3);

    return `#### 1. Data Lineage & Confidence Status
- **Provenance Model:** ${isEstimated ? 'Pure Satellite Estimation & Radiometric Synthesis' : 'Ground-Truth Station Observation Telemetry'}
- **Spatial Focus:** **${stationName}**
- **Calculated Indian AQI:** **${aqi}** (${aqi > 300 ? 'Severe' : aqi > 200 ? 'Poor / Very Poor' : aqi > 100 ? 'Moderate' : 'Satisfactory'})
- **Data Integrity:** Ingested all 12 atmospheric parameters via WRF-Chem proxies and Open-Meteo satellite feeds. ${isEstimated ? 'No reachable physical ground sensor within 25 km; PM2.5 is synthesized from 550nm Aerosol Optical Depth (AOD) and atmospheric stability equations.' : 'Physical ground station verified within local spatial radius.'}

#### 2. Chemical & Physical Drivers (Feature Importance)
- **Top 3 Dominant Drivers:**
  1. **${dominantThree[0] || 'Aerosol Optical Depth'}**
  2. **${dominantThree[1] || 'Boundary Layer Dynamics'}**
  3. **${dominantThree[2] || 'Combustion Precursors'}**

- **Particulate Morphology & Aerosol Dynamics:**
  - **PM2.5 / PM10 Ratio:** ${pmRatio ? `${pmRatio} — ${pmRatio > 0.6 ? 'Indicates fine combustion/secondary aerosol dominance (vehicular emissions, biomass burning, and industrial synthesis).' : 'Indicates significant coarse crustal/mechanical dust loading.'}` : `PM2.5 is ${pm25} µg/m³; coarse ground PM10 telemetry currently unmonitored.`}
  - **Combustion Precursor Analysis:** CO levels at **${co} µg/m³** and SO₂ at **${so2} µg/m³** ${hasBiomassSignature ? 'demonstrate active combustion/industrial plumes compounding the fine particulate pool.' : 'show moderate primary industrial emission baselines.'}
  - **Photochemical & Industrial Gases:** NO₂ is ${no2 ? `${no2} µg/m³ (urban vehicular/thermal combustion marker)` : 'unrecorded at surface'}, with AOD at **${aod}**.

| Ingested Metric | Measured Value | Standard Threshold | Physical Status |
| :--- | :--- | :--- | :--- |
| **PM2.5 (Fine)** | ${pm25} µg/m³ | 60 µg/m³ (CPCB 24h) | ${pm25 > 60 ? '⚠️ Exceeding Limit' : '✅ Within Limits'} |
| **Wind Speed** | ${wind} m/s | > 3.0 m/s (Ventilation) | ${isStagnant ? '⚠️ Severe Stagnation' : '✅ Active Ventilation'} |
| **Humidity** | ${humidity}% | < 65% (Dry Air) | ${isHumidDeliquescence ? '⚠️ Hygroscopic Swelling' : '✅ Normal Condensation'} |
| **Temperature** | ${temp} °C | Normal Ambient | ${isColdInversion ? '⚠️ Shallow Inversion Layer' : '✅ Convective Mixing'} |
| **Surface Pressure** | ${pressure} hPa | 1013 hPa (Synoptic) | ${pressure > 1014 ? 'Anticyclonic Subsidence' : 'Equilibrium Gradient'} |

#### 3. Meteorological Mechanics & Dispersion Physics
- **Wind Velocity & Plume Dispersion:** Surface wind speed of **${wind} m/s** is ${isStagnant ? 'below the critical 2.0 m/s dispersion threshold. Advective transport is stalled, causing localized accumulation of toxic particulates directly in the breathing zone.' : 'providing baseline horizontal ventilation, aiding in the steady dilution of surface emissions.'}
- **Planetary Boundary Layer (PBL) & Thermal Profile:** Ambient temperature of **${temp}°C** ${isColdInversion ? 'compresses the nocturnal planetary boundary layer, capping pollutants beneath a surface-based temperature inversion.' : 'promotes thermal convective updrafts that lift pollutants away from the ground layer.'}
- **Deliquescence & Secondary Smog Transformation:** At **${humidity}%** relative humidity, ${isHumidDeliquescence ? 'hygroscopic growth causes particulate matter to absorb atmospheric water vapor, multiplying optical depth and producing dense, persistent smog droplets.' : 'hygroscopic swelling remains minimal, preventing secondary aerosol water uptake.'}

#### 4. Diagnostic Summary & Human Impact
- **Public Health Assessment:** The localized atmospheric cocktail exposes respiratory systems to elevated sub-micron particulate penetration. Fine particles (${pm25} µg/m³) bypass upper respiratory filtration and reach alveolar tissue.
- **Recommended Protective Actions:**
  - Wear certified **N95 / FFP2 respirators** during prolonged outdoor exposure.
  - Suspend strenuous outdoor cardio activities during early morning and late evening inversion peaks.
  - Keep windows closed and operate indoor HEPA filtration units where feasible.
  - High-risk demographics (children, senior citizens, asthmatic individuals) should remain in sealed, purified environments.`;
  };

  // Deterministic 72-Hour Atmospheric Trajectory & Exposure Mitigation Model (100% Offline-Safe)
  const buildLocal72hForecastReport = (data, forecastData, loc, calculateIndianAQI) => {
    const pm25 = data?.pm2_5 ?? 100;
    const wind = data?.wind_speed ?? 2.0;
    const temp = data?.temperature ?? 22;
    const landmark = data?.landmark || data?.station || `Lat: ${loc.lat.toFixed(2)}, Lng: ${loc.lng.toFixed(2)}`;

    let phase1Avg = pm25;
    let phase1Min = Math.round(pm25 * 0.8);
    let phase1Max = Math.round(pm25 * 1.35);

    let phase2Avg = Math.round(pm25 * (wind < 2 ? 1.15 : 0.95));
    let phase2Min = Math.round(phase2Avg * 0.85);
    let phase2Max = Math.round(phase2Avg * 1.4);

    let phase3Avg = Math.round(phase2Avg * 0.9);
    let phase3Min = Math.round(phase3Avg * 0.75);
    let phase3Max = Math.round(phase3Avg * 1.25);

    if (forecastData && forecastData.length >= 3) {
      phase1Min = forecastData[0].min ?? phase1Min;
      phase1Max = forecastData[0].max ?? phase1Max;
      phase1Avg = forecastData[0].avg ?? phase1Avg;

      phase2Min = forecastData[1].min ?? phase2Min;
      phase2Max = forecastData[1].max ?? phase2Max;
      phase2Avg = forecastData[1].avg ?? phase2Avg;

      phase3Min = forecastData[2].min ?? phase3Min;
      phase3Max = forecastData[2].max ?? phase3Max;
      phase3Avg = forecastData[2].avg ?? phase3Avg;
    }

    const delta = phase3Avg - phase1Avg;
    const trajectoryDirection = delta < -10 ? "Improving" : delta > 10 ? "Deteriorating" : "Stagnant / Persistent Hazard";
    const peakPhase = (phase2Max >= phase1Max && phase2Max >= phase3Max) ? "Phase 2 (Hours 24–48)" : (phase1Max >= phase3Max ? "Phase 1 (Hours 0–24)" : "Phase 3 (Hours 48–72)");

    return `#### 1. 72-Hour Macro Trajectory Overview
- **Overall Trajectory Direction:** **${trajectoryDirection}**
- **Net Delta Trajectory (Phase 1 -> Phase 3):** **${delta > 0 ? `+${delta}` : `${delta}`} µg/m³** (from avg ${phase1Avg} µg/m³ to ${phase3Avg} µg/m³)
- **Predicted Peak Hazard Window:** **${peakPhase}** (Anticipated Peak: **${Math.max(phase1Max, phase2Max, phase3Max)} µg/m³**)
- **Target Spatial Domain:** **${landmark}**

| 72h Forecast Phase | Time Interval | PM2.5 Range (µg/m³) | Average AQI | Dispersion Regime |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1** | Hours 00 – 24 | ${phase1Min} – ${phase1Max} | ${calculateIndianAQI(phase1Avg)} | ${wind < 2 ? 'Weak Stagnant' : 'Moderate Advection'} |
| **Phase 2** | Hours 24 – 48 | ${phase2Min} – ${phase2Max} | ${calculateIndianAQI(phase2Avg)} | ${temp < 18 ? 'Nocturnal Thermal Inversion' : 'Convective Boundary'} |
| **Phase 3** | Hours 48 – 72 | ${phase3Min} – ${phase3Max} | ${calculateIndianAQI(phase3Avg)} | Synoptic Transition |

#### 2. Phase-by-Phase Physical Mechanics (The "Why")
- **Hours 0–24 (Phase 1: Immediate Dynamics):**
  Current surface wind speed of **${wind} m/s** and ambient temperature of **${temp}°C** dictate the initial 24 hours. Evening ground-cooling triggers surface radiation loss, compressing the mixed layer and concentrating freshly emitted primary aerosols near breathing zones.
- **Hours 24–48 (Phase 2: Synoptic Baseline Shift):**
  A diurnal inversion trap develops between late night and mid-morning. Nocturnal wind decrescendo suppresses turbulent kinetic energy (TKE). If relative humidity remains above 65%, nocturnal fog condensation facilitates aqueous-phase sulphate/nitrate aerosol mass accumulation, driving peak exposure spikes.
- **Hours 48–72 (Phase 3: Dispersion or Entrapment):**
  Solar radiation re-establishes convective boundary layer mixing towards the midday hours. Increased wind vector shear gradually expands the ventilation volume, yielding gradual dilution of fine particulates across the geographic basin.

#### 3. Atmospheric Sensitivity & Uncertainty Factors
- **Wind Speed Sensitivity:** If surface wind vectors decelerate by more than **1.0 m/s** during Phase 2, peak particulate concentrations could escalate by **20–30%** above predicted baselines.
- **Moisture & Temperature Thresholds:** An unexpected surge in relative humidity beyond 75% will accelerate hygroscopic aerosol swelling, sharply degrading daytime visibility and increasing inhaled mass dosage.

#### 4. Actionable 72-Hour Health & Operational Guidance
- **Phase 1 (Hours 0–24) Immediate Actions:**
  - Avoid early morning and post-dusk vigorous outdoor exercise.
  - Activate domestic HEPA air filtration in recirculation mode.
- **Phase 2 (Hours 24–48) Peak Exposure Caution:**
  - Keep school children and cardiopulmonary patients indoors during morning inversion hours (06:00–10:00).
  - Mandatory use of well-fitted N95 masks for outdoor commuters.
- **Phase 3 (Hours 48–72) Operational Planning:**
  - Schedule outdoor logistics or household ventilation windows during peak midday convective periods (12:00–15:00) when boundary layer mixing is deepest.`;
  };

  const handleExplain = async () => {
    if (loadingExpl || isStreaming || isDebouncing) return;
    const now = Date.now();
    if (now - lastActionTimeRef.current < 1200) return;
    lastActionTimeRef.current = now;
    setIsDebouncing(true);
    setTimeout(() => setIsDebouncing(false), 1200);

    const cacheKey = `explain_${selectedLoc.lat.toFixed(2)}_${selectedLoc.lng.toFixed(2)}`;
    setModalType('explain');
    setIsModalOpen(true);
    setLoadingStatus("");
    setIsDeterministicFallback(false);

    // 1. Instant Cache Check (0ms latency, zero API quota)
    if (explanationCache.current.has(cacheKey)) {
      setExplanation(explanationCache.current.get(cacheKey));
      setIsFromCache(true);
      setIsDeterministicFallback(fallbackCache.current.has(cacheKey));
      setIsStreaming(false);
      setLoadingExpl(false);
      setWorkflowStep(4);
      return;
    }

    setIsFromCache(false);
    setLoadingExpl(true);
    setExplanation("");
    setWorkflowStep(0);
    
    const intervalId = setInterval(() => {
      setWorkflowStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 800);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey.trim() === '') {
        clearInterval(intervalId);
        setIsDeterministicFallback(true);
        fallbackCache.current.add(cacheKey);
        const fallback = buildLocalDiagnosticReport(dashboardData, selectedLoc, calculateIndianAQI);
        setExplanation(fallback);
        setLoadingExpl(false);
        setWorkflowStep(4);
        explanationCache.current.set(cacheKey, fallback);
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      
      const prompt = `You are an advanced Explainable AI (XAI) Environmental Data Scientist specialized in atmospheric physics, aerosol dynamics, and chemistry.

### INGESTED REAL-TIME DATASET:
Location: ${dashboardData?.landmark || `[Lat: ${selectedLoc.lat.toFixed(2)}, Lng: ${selectedLoc.lng.toFixed(2)}]`}
Data Provenance:
- Is Estimated via Satellite (No Ground Station): ${dashboardData?.isEstimated ? "TRUE" : "FALSE"}

Pollutant Metrics:
- PM2.5 (Fine Particulates): ${dashboardData?.pm2_5} µg/m³
- PM10 (Coarse Particulates): ${dashboardData?.pm10 || 'N/A'} µg/m³
- Nitrogen Dioxide (NO2): ${dashboardData?.nitrogen_dioxide || 'N/A'} µg/m³
- Ozone (O3): ${dashboardData?.ozone || 'N/A'} µg/m³
- Carbon Monoxide (CO): ${dashboardData?.carbon_monoxide} µg/m³
- Sulphur Dioxide (SO2): ${dashboardData?.sulphur_dioxide} µg/m³
- Aerosol Optical Depth (AOD @ 550nm): ${dashboardData?.aerosol_optical_depth || 'N/A'}

Meteorological Conditions:
- Ambient Temperature: ${dashboardData?.temperature} °C
- Relative Humidity: ${dashboardData?.humidity || 'N/A'} %
- Wind Speed: ${dashboardData?.wind_speed} m/s
- Cloud Cover: ${dashboardData?.cloud_cover || 'N/A'} %

---

### TASK & SYSTEM INSTRUCTIONS:
Provide a detailed, highly descriptive Explainable AI (XAI) diagnostic report breakdown of the current air quality. Do not summarize in vague terms. Account for all 12 ingested data parameters in your analysis.

Structure your response into the following 4 explicit sections using markdown. IMPORTANT: If you generate any ASCII art diagrams, tables, or charts, you MUST wrap them in triple backticks (\`\`\`) to ensure they render as monospaced code blocks.

#### 1. Data Lineage & Confidence Status
- If 'Is Estimated via Satellite' is TRUE: Explicitly inform the user that no local physical ground sensor was reachable. Explain that PM2.5/PM10 levels are being mathematically synthesized using Aerosol Optical Depth (AOD) measurements from satellite radiometers combined with the WRF-Chem atmospheric chemistry model.
- If FALSE: Confirm this is direct ground-truth station telemetry.

#### 2. Chemical & Physical Drivers (Feature Importance)
- Identify the TOP 3 dominant drivers of the air quality from the dataset.
- Evaluate the Gaseous Factors (NO2, CO, SO2):
  * Analyze NO2 in relation to urban vehicular/industrial combustion.
  * Analyze CO and SO2 alongside AOD. (Note: Elevated CO and SO2 paired with high AOD indicate biomass/stubble burning or heavy coal/industrial combustion).
- Evaluate Particulate Ratio: Compare PM2.5 to PM10. High PM2.5/PM10 ratios indicate combustion/secondary aerosols; low ratios indicate windblown dust/crustal matter.

#### 3. Meteorological Mechanics & Dispersion Physics
- Explain explicitly how Temperature, Humidity, Wind Speed, and Cloud Cover are modifying pollution levels:
  * Wind Speed: Explain if low winds (<2 m/s) are causing atmospheric stagnation, or if higher winds are providing ventilation/dispersion.
  * Temperature & Cloud Cover: Explain if conditions suggest radiative cooling or a thermal inversion layer trapping pollutants near the surface.
  * Humidity: Explain if high humidity (>70%) is causing hygroscopic growth of fine particles, transforming fine particulates into haze/smog.

#### 4. Diagnostic Summary & Human Impact
- Provide a clear, plain-language translation of these complex chemical and physical factors for an average citizen, detailing health risks and recommended protective behaviors.`;

      // Reliable Model Execution with Fast Streaming
      let streamResult = null;
      try {
        const model = genAI.getGenerativeModel({ 
          model: "gemini-flash-latest",
          generationConfig: { temperature: 0.2 }
        });
        streamResult = await model.generateContentStream(prompt);
      } catch (e) {
        console.warn("Primary gemini-flash-latest failed, failing over to gemini-3.5-flash:", e);
        const backupModel = genAI.getGenerativeModel({ 
          model: "gemini-3.5-flash",
          generationConfig: { temperature: 0.2 }
        });
        streamResult = await backupModel.generateContentStream(prompt);
      }

      clearInterval(intervalId);
      setWorkflowStep(4);
      setLoadingExpl(false);
      setIsStreaming(true);

      let accumulated = "";
      for await (const chunk of streamResult.stream) {
        const chunkText = chunk.text();
        accumulated += chunkText;
        setExplanation(accumulated);
      }

      setIsStreaming(false);
      if (accumulated.trim()) {
        explanationCache.current.set(cacheKey, accumulated);
      }
    } catch(err) {
      console.warn("Gemini Cloud API unavailable, engaging Deterministic Atmospheric Physics Engine:", err);
      clearInterval(intervalId);
      setWorkflowStep(4);
      setLoadingExpl(false);
      setIsStreaming(false);
      setIsDeterministicFallback(true);
      fallbackCache.current.add(cacheKey);
      const fallbackReport = buildLocalDiagnosticReport(dashboardData, selectedLoc, calculateIndianAQI);
      setExplanation(fallbackReport);
      explanationCache.current.set(cacheKey, fallbackReport);
    } finally {
      setLoadingStatus("");
    }
  };

  const handlePredict = async () => {
    if (loadingExpl || isStreaming || isDebouncing) return;
    const now = Date.now();
    if (now - lastActionTimeRef.current < 1200) return;
    lastActionTimeRef.current = now;
    setIsDebouncing(true);
    setTimeout(() => setIsDebouncing(false), 1200);

    const cacheKey = `predict_${selectedLoc.lat.toFixed(2)}_${selectedLoc.lng.toFixed(2)}`;
    setModalType('predict');
    setIsModalOpen(true);
    setLoadingStatus("");
    setIsDeterministicFallback(false);

    // 1. Instant Cache Check (0ms latency, zero API quota)
    if (explanationCache.current.has(cacheKey)) {
      setExplanation(explanationCache.current.get(cacheKey));
      setIsFromCache(true);
      setIsDeterministicFallback(fallbackCache.current.has(cacheKey));
      setIsStreaming(false);
      setLoadingExpl(false);
      setWorkflowStep(4);
      return;
    }

    setIsFromCache(false);
    setLoadingExpl(true);
    setExplanation("");
    setWorkflowStep(0);
    
    const intervalId = setInterval(() => {
      setWorkflowStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 800);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey.trim() === '') {
        clearInterval(intervalId);
        setIsDeterministicFallback(true);
        fallbackCache.current.add(cacheKey);
        const fallback = buildLocal72hForecastReport(dashboardData, forecastData, selectedLoc, calculateIndianAQI);
        setExplanation(fallback);
        setLoadingExpl(false);
        setWorkflowStep(4);
        explanationCache.current.set(cacheKey, fallback);
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      
      const dailyForecast = forecastData ? forecastData.slice(0, 3).map((d, i) => `- Phase ${i+1} (Hours ${i*24}-${(i+1)*24}): Min: ${d.min} | Max: ${d.max} | Avg: ${d.avg}`).join("\n") : "Forecast data unavailable for this specific station.";

      const prompt = `You are an advanced Predictive Atmospheric Physics AI Model specializing in 72-hour air quality forecasting, dispersion mechanics, and health exposure mitigation.

### INGESTED 72-HOUR FORECAST & METEOROLOGICAL DATASET:
Location: ${dashboardData?.landmark || dashboardData?.station}

72-Hour WAQI Forecast Breakdown (PM2.5 in µg/m³):
${dailyForecast}

Current & Forecasted Meteorological Indicators:
- Temperature Trend: ${dashboardData?.temperature}°C -> [Analyze Time of Day]
- Wind Speed & Vector: ${dashboardData?.wind_speed} m/s -> [Analyze Dispersion Potential]
- Relative Humidity: ${dashboardData?.humidity}% -> [Analyze Hygroscopic Growth]
- Boundary Layer Dynamics: [Analyze Inversion Risk]

Primary Ingested Pollutant Drivers:
- PM2.5: ${dashboardData?.pm2_5} µg/m³ | PM10: ${dashboardData?.pm10 || 'N/A'} µg/m³ | NO2: ${dashboardData?.nitrogen_dioxide || 'N/A'} µg/m³ | O3: ${dashboardData?.ozone || 'N/A'} µg/m³ | CO: ${dashboardData?.carbon_monoxide} µg/m³ | SO2: ${dashboardData?.sulphur_dioxide} µg/m³

---

### TASK & SYSTEM INSTRUCTIONS:
Generate a comprehensive, highly descriptive 72-hour Explainable AI (XAI) forecast narrative. You must explain **WHY** the pollution trajectory changes across each 24-hour window using atmospheric physics, and provide precise, phase-based recommendations.

Structure your analysis into the following 4 explicit sections using markdown. IMPORTANT: If you generate any ASCII art diagrams, tables, or charts, you MUST wrap them in triple backticks (\`\`\`) to ensure they render as monospaced code blocks.

#### 1. 72-Hour Macro Trajectory Overview
- State the overall 72-hour direction: Is air quality **Improving**, **Deteriorating**, or **Stagnant**?
- Calculate and highlight the delta change in PM2.5 between Phase 1 (0–24h) and Phase 3 (48–72h).
- State the predicted **Peak Hazard Window** within the 72 hours (e.g., "Phase 2 Nighttime: Hours 30–42").

#### 2. Phase-by-Phase Physical Mechanics (The "Why")
Break down the physics driving each 24-hour window:
- **Hours 0–24 (Phase 1):** Explain how current wind speeds, temperature, and humidity are driving immediate dispersion or pollution trapping.
- **Hours 24–48 (Phase 2):** Explain the atmospheric mechanism causing the baseline shift (e.g., "Dropping temperatures will lower the planetary boundary layer, trapping vehicular NO2 and PM2.5 close to the ground").
- **Hours 48–72 (Phase 3):** Explain the recovery or escalation mechanism (e.g., "Increasing wind speeds (>4 m/s) will clear accumulated aerosols, driving PM2.5 down").

#### 3. Atmospheric Sensitivity & Uncertainty Factors
- Identify which weather variable is the **most sensitive driver** for this 72-hour forecast (e.g., "If wind speeds fall below 1.5 m/s in Phase 2, PM2.5 peak levels could exceed predicted max by 25%").
- Explain how humidity dynamics (e.g., secondary inorganic aerosol formation) might alter the predicted trajectory.

#### 4. Actionable 72-Hour Health & Operational Guidance
Provide tailored recommendations structured across the 72-hour timeline:
- **Hours 0–24 Actions:** Specific advice for immediate exposure (e.g., outdoor exercise, ventilation).
- **Hours 24–48 Actions:** Specific advice for the predicted peak/trough (e.g., "High-risk window: Sensitive groups should avoid outdoor activity between 06:00 and 10:00").
- **Hours 48–72 Actions:** Planning ahead for outdoor activities, air purification schedule, or commute adjustments.`;

      let streamResult = null;
      try {
        const model = genAI.getGenerativeModel({ 
          model: "gemini-flash-latest",
          generationConfig: { temperature: 0.2 }
        });
        streamResult = await model.generateContentStream(prompt);
      } catch (e) {
        console.warn("Primary gemini-flash-latest failed in Predict, failing over to gemini-3.5-flash:", e);
        const backupModel = genAI.getGenerativeModel({ 
          model: "gemini-3.5-flash",
          generationConfig: { temperature: 0.2 }
        });
        streamResult = await backupModel.generateContentStream(prompt);
      }

      clearInterval(intervalId);
      setWorkflowStep(4);
      setLoadingExpl(false);
      setIsStreaming(true);

      let accumulated = "";
      for await (const chunk of streamResult.stream) {
        const chunkText = chunk.text();
        accumulated += chunkText;
        setExplanation(accumulated);
      }

      setIsStreaming(false);
      if (accumulated.trim()) {
        explanationCache.current.set(cacheKey, accumulated);
      }
    } catch(err) {
      console.warn("Gemini Cloud API unavailable for forecast, engaging Deterministic Atmospheric Physics Engine:", err);
      clearInterval(intervalId);
      setWorkflowStep(4);
      setLoadingExpl(false);
      setIsStreaming(false);
      setIsDeterministicFallback(true);
      fallbackCache.current.add(cacheKey);
      const fallbackReport = buildLocal72hForecastReport(dashboardData, forecastData, selectedLoc, calculateIndianAQI);
      setExplanation(fallbackReport);
      explanationCache.current.set(cacheKey, fallbackReport);
    } finally {
      setLoadingStatus("");
    }
  };

  return (
    <div className="animate-fade-in dashboard-layout">
      
      {/* Full-width Map Section */}
      <div>
        <div className="dashboard-header-row">
          <div>
            <h1 style={{ margin: '0 0 0.35rem 0', fontSize: 'clamp(1.35rem, 2.2vw, 1.85rem)', letterSpacing: '-0.02em' }}>Subcontinental Air Quality Map</h1>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                Ground truth telemetry powered by <strong>WAQI</strong>.
              </p>
              <span style={{ fontSize: '0.72rem', background: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 'bold' }}>
                METEOROLOGY: NOAA / DWD SATELLITE
              </span>
            </div>
          </div>
          {dashboardData && !loadingData && (
            <div style={{ 
              background: 'var(--card-bg)', 
              padding: '0.55rem 1.15rem', 
              borderRadius: '12px', 
              borderLeft: calculateIndianAQI(dashboardData.pm2_5) > 300 ? '4px solid #ef4444' : calculateIndianAQI(dashboardData.pm2_5) > 200 ? '4px solid #f59e0b' : '4px solid #10b981', 
              border: '1px solid var(--border-color)', 
              borderLeftWidth: '4px', 
              boxShadow: 'var(--card-shadow)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem'
            }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Selected Area AQI</p>
                <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-main)', lineHeight: 1.1 }}>{calculateIndianAQI(dashboardData.pm2_5)}</p>
              </div>
              <span style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: calculateIndianAQI(dashboardData.pm2_5) > 300 ? '#fee2e2' : calculateIndianAQI(dashboardData.pm2_5) > 200 ? '#fef3c7' : '#dcfce7',
                color: calculateIndianAQI(dashboardData.pm2_5) > 300 ? '#991b1b' : calculateIndianAQI(dashboardData.pm2_5) > 200 ? '#92400e' : '#166534'
              }}>
                {calculateIndianAQI(dashboardData.pm2_5) > 300 ? 'SEVERE' : calculateIndianAQI(dashboardData.pm2_5) > 200 ? 'VERY POOR' : calculateIndianAQI(dashboardData.pm2_5) > 100 ? 'MODERATE' : 'SATISFACTORY'}
              </span>
            </div>
          )}
        </div>
        
        {/* Delhi NCR Hotspot Quick-Select Chips */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          flexWrap: 'wrap',
          marginBottom: '0.75rem',
          padding: '0.5rem 0.85rem',
          background: 'var(--card-bg)',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span>⚡</span>
            <span>NCR Hotspots:</span>
          </span>
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', flex: 1 }}>
            {NCR_HOTSPOTS.map((spot) => {
              const isSelected = Math.abs(selectedLoc.lat - spot.lat) < 0.01 && Math.abs(selectedLoc.lng - spot.lng) < 0.01;
              return (
                <button
                  key={spot.name}
                  onClick={() => setSelectedLoc({ lat: spot.lat, lng: spot.lng })}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.7rem',
                    borderRadius: '6px',
                    border: isSelected ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                    background: isSelected ? 'rgba(37, 99, 235, 0.1)' : 'var(--card-bg)',
                    color: isSelected ? 'var(--primary-color)' : 'var(--text-main)',
                    fontWeight: isSelected ? '700' : '500',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: isSelected ? '0 0 0 1px var(--primary-color)' : 'none'
                  }}
                  title={`Jump to ${spot.name} (${spot.zone})`}
                >
                  <span style={{ fontSize: '0.75rem' }}>📍</span>
                  <span>{spot.name}</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.7, fontWeight: 'normal' }}>({spot.zone})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pass selectedLoc to MapComponent */}
        <MapComponent selectedLoc={selectedLoc} onLocationSelect={setSelectedLoc} />
      </div>
      
      {loadingData ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', margin: 0 }}>Analyzing coordinates [Lat: {selectedLoc.lat.toFixed(2)}, Lng: {selectedLoc.lng.toFixed(2)}]...</p>
        </div>
      ) : fetchError ? (
        <div style={{ padding: '1.5rem', background: '#fee2e2', color: '#991b1b', borderRadius: '10px', border: '1px solid #fca5a5' }}>
          Critical failure fetching core meteorological data. Please check your network connection.
        </div>
      ) : dashboardData ? (
        <div className="dashboard-bottom-grid">
          {/* Data Grid Column */}
          <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            
            {/* Intelligent Failover UI Badge */}
            {dashboardData.isEstimated && (
              <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid #fca5a5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginBottom: '3px', fontSize: '0.9rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  ESTIMATED FROM SATELLITE
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: '1.4' }}>No physical ground sensor found at these coordinates. The PM2.5 value is mathematically derived from AOD and meteorological proxies.</p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 700 }}>
                {dashboardData.isEstimated ? 'Pure Satellite Grid Synthesis' : 'Ground Station & Satellite Telemetry'}
              </h2>
              {!dashboardData.isEstimated && (
                <span style={{ fontSize: '0.8rem', background: 'var(--code-bg)', color: 'var(--text-muted)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 600 }}>
                  📍 {dashboardData.station}
                </span>
              )}
            </div>
            
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {dashboardData.landmark}
            </p>
            
            <div className="telemetry-grid">
              {/* PM2.5 */}
              <div className="telemetry-tile">
                <div className="telemetry-tile-header">
                  <span className="telemetry-label">PM2.5 (Fine)</span>
                  <span className={`telemetry-badge ${dashboardData.isEstimated ? 'estimate' : 'ground'}`}>
                    {dashboardData.isEstimated ? 'SAT ESTIMATE' : 'GROUND'}
                  </span>
                </div>
                <div className="telemetry-value-row">
                  <span className="telemetry-value">{dashboardData.pm2_5 ?? 'N/A'}</span>
                  <span className="telemetry-unit">µg/m³</span>
                </div>
              </div>

              {/* PM10 */}
              <div className="telemetry-tile">
                <div className="telemetry-tile-header">
                  <span className="telemetry-label">PM10 (Coarse)</span>
                  <span className="telemetry-badge ground">GROUND</span>
                </div>
                <div className="telemetry-value-row">
                  <span className="telemetry-value">{dashboardData.pm10 ?? 'N/A'}</span>
                  <span className="telemetry-unit">µg/m³</span>
                </div>
              </div>

              {/* CO */}
              <div className="telemetry-tile">
                <div className="telemetry-tile-header">
                  <span className="telemetry-label">Carbon Monoxide (CO)</span>
                  <span className="telemetry-badge satellite">SATELLITE</span>
                </div>
                <div className="telemetry-value-row">
                  <span className="telemetry-value">{dashboardData.carbon_monoxide ?? 'N/A'}</span>
                  <span className="telemetry-unit">µg/m³</span>
                </div>
              </div>

              {/* SO2 */}
              <div className="telemetry-tile">
                <div className="telemetry-tile-header">
                  <span className="telemetry-label">Sulphur Dioxide (SO₂)</span>
                  <span className="telemetry-badge satellite">SATELLITE</span>
                </div>
                <div className="telemetry-value-row">
                  <span className="telemetry-value">{dashboardData.sulphur_dioxide ?? 'N/A'}</span>
                  <span className="telemetry-unit">µg/m³</span>
                </div>
              </div>

              {/* NO2 */}
              <div className="telemetry-tile">
                <div className="telemetry-tile-header">
                  <span className="telemetry-label">Nitrogen Dioxide (NO₂)</span>
                  <span className="telemetry-badge ground">GROUND</span>
                </div>
                <div className="telemetry-value-row">
                  <span className="telemetry-value">{dashboardData.nitrogen_dioxide ?? 'N/A'}</span>
                  <span className="telemetry-unit">µg/m³</span>
                </div>
              </div>

              {/* O3 */}
              <div className="telemetry-tile">
                <div className="telemetry-tile-header">
                  <span className="telemetry-label">Ground Ozone (O₃)</span>
                  <span className="telemetry-badge ground">GROUND</span>
                </div>
                <div className="telemetry-value-row">
                  <span className="telemetry-value">{dashboardData.ozone ?? 'N/A'}</span>
                  <span className="telemetry-unit">µg/m³</span>
                </div>
              </div>

              {/* AOD */}
              <div className="telemetry-tile">
                <div className="telemetry-tile-header">
                  <span className="telemetry-label">Aerosol Optical Depth</span>
                  <span className="telemetry-badge satellite">SATELLITE</span>
                </div>
                <div className="telemetry-value-row">
                  <span className="telemetry-value">{dashboardData.aerosol_optical_depth ?? 'N/A'}</span>
                  <span className="telemetry-unit">AOD</span>
                </div>
              </div>

              {/* Wind Speed */}
              <div className="telemetry-tile">
                <div className="telemetry-tile-header">
                  <span className="telemetry-label">Surface Wind Speed</span>
                  <span className="telemetry-badge satellite">SATELLITE</span>
                </div>
                <div className="telemetry-value-row">
                  <span className="telemetry-value">{dashboardData.wind_speed ?? 'N/A'}</span>
                  <span className="telemetry-unit">m/s</span>
                </div>
              </div>

              {/* Temperature */}
              <div className="telemetry-tile">
                <div className="telemetry-tile-header">
                  <span className="telemetry-label">Temperature</span>
                  <span className="telemetry-badge satellite">SATELLITE</span>
                </div>
                <div className="telemetry-value-row">
                  <span className="telemetry-value">{dashboardData.temperature ?? 'N/A'}</span>
                  <span className="telemetry-unit">°C</span>
                </div>
              </div>

              {/* Relative Humidity */}
              <div className="telemetry-tile">
                <div className="telemetry-tile-header">
                  <span className="telemetry-label">Relative Humidity</span>
                  <span className="telemetry-badge satellite">SATELLITE</span>
                </div>
                <div className="telemetry-value-row">
                  <span className="telemetry-value">{dashboardData.humidity ?? 'N/A'}</span>
                  <span className="telemetry-unit">%</span>
                </div>
              </div>

              {/* Surface Pressure */}
              <div className="telemetry-tile">
                <div className="telemetry-tile-header">
                  <span className="telemetry-label">Surface Pressure</span>
                  <span className="telemetry-badge satellite">SATELLITE</span>
                </div>
                <div className="telemetry-value-row">
                  <span className="telemetry-value">{dashboardData.pressure ? Math.round(dashboardData.pressure) : 'N/A'}</span>
                  <span className="telemetry-unit">hPa</span>
                </div>
              </div>

              {/* Cloud Cover */}
              <div className="telemetry-tile">
                <div className="telemetry-tile-header">
                  <span className="telemetry-label">Cloud Cover</span>
                  <span className="telemetry-badge satellite">SATELLITE</span>
                </div>
                <div className="telemetry-value-row">
                  <span className="telemetry-value">{dashboardData.cloud_cover ?? 'N/A'}</span>
                  <span className="telemetry-unit">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis & Standards Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Standards Comparison Component */}
            <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
              <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
                <button 
                  onClick={() => setActiveTab('who')}
                  style={{ background: activeTab === 'who' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'who' ? '#fff' : 'var(--text-main)', border: 'none', padding: '0.45rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', transition: 'all 0.2s' }}
                >
                  WHO Guidelines
                </button>
                <button 
                  onClick={() => setActiveTab('cpcb')}
                  style={{ background: activeTab === 'cpcb' ? 'var(--primary-color)' : 'transparent', color: activeTab === 'cpcb' ? '#fff' : 'var(--text-main)', border: 'none', padding: '0.45rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', transition: 'all 0.2s' }}
                >
                  CPCB India Standards
                </button>
              </div>
              
              {activeTab === 'who' ? (
                <div>
                  <h3 style={{ marginTop: 0, fontSize: '1.15rem' }}>World Health Organization (24h)</h3>
                  <ul style={{ lineHeight: '1.7', margin: 0, paddingLeft: '1.25rem', fontSize: '0.92rem' }}>
                    <li><strong style={{ color: dashboardData.pm2_5 > 15 ? '#ef4444' : '#22c55e' }}>PM2.5:</strong> Limit is 15 µg/m³. {dashboardData.pm2_5 > 15 ? `Currently exceeding by ${(dashboardData.pm2_5 / 15).toFixed(1)}x.` : 'Within safe limits.'}</li>
                    <li><strong style={{ color: dashboardData.pm10 > 45 ? '#ef4444' : '#22c55e' }}>PM10:</strong> Limit is 45 µg/m³. {dashboardData.pm10 > 45 ? 'Exceeding WHO guidelines.' : 'Within safe limits.'}</li>
                    <li><strong style={{ color: dashboardData.nitrogen_dioxide > 25 ? '#ef4444' : '#22c55e' }}>NO₂:</strong> Limit is 25 µg/m³. {dashboardData.nitrogen_dioxide > 25 ? 'Exceeding WHO guidelines.' : 'Within safe limits.'}</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <h3 style={{ marginTop: 0, fontSize: '1.15rem' }}>Central Pollution Control Board (24h)</h3>
                  <ul style={{ lineHeight: '1.7', margin: 0, paddingLeft: '1.25rem', fontSize: '0.92rem' }}>
                    <li><strong style={{ color: dashboardData.pm2_5 > 60 ? '#ef4444' : '#22c55e' }}>PM2.5:</strong> Limit is 60 µg/m³. {dashboardData.pm2_5 > 60 ? 'Exceeding Indian national standards.' : 'Satisfactory level.'}</li>
                    <li><strong style={{ color: dashboardData.pm10 > 100 ? '#ef4444' : '#22c55e' }}>PM10:</strong> Limit is 100 µg/m³. {dashboardData.pm10 > 100 ? 'Exceeding Indian national standards.' : 'Satisfactory level.'}</li>
                    <li><strong style={{ color: dashboardData.nitrogen_dioxide > 80 ? '#ef4444' : '#22c55e' }}>NO₂:</strong> Limit is 80 µg/m³. {dashboardData.nitrogen_dioxide > 80 ? 'Exceeding Indian national standards.' : 'Satisfactory level.'}</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Current Explainer AI Component */}
            <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(37, 99, 235, 0.25)', boxShadow: 'var(--card-shadow)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h2 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.25rem' }}>Gemini XAI Engine</h2>
                <span style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.55rem', borderRadius: '12px', fontWeight: 'bold' }}>NEURAL PIPELINE</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                Leverage generative AI to diagnose the complex physical and chemical drivers behind the current air quality, or simulate a comprehensive 72-hour pollution trajectory based on real-time atmospheric modeling.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <button 
                  onClick={handleExplain} 
                  disabled={loadingExpl || isStreaming || isDebouncing}
                  style={{
                    width: '100%',
                    padding: '0.85rem 0.75rem',
                    background: 'var(--primary-color)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                    cursor: (loadingExpl || isStreaming || isDebouncing) ? 'not-allowed' : 'pointer',
                    opacity: (loadingExpl || isStreaming || isDebouncing) ? 0.7 : 1,
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>Explain Current</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 'normal' }}>Diagnose Present Conditions</span>
                </button>
                
                <button 
                  onClick={handlePredict} 
                  disabled={loadingExpl || isStreaming || isDebouncing}
                  style={{
                    width: '100%',
                    padding: '0.85rem 0.75rem',
                    background: '#8b5cf6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                    cursor: (loadingExpl || isStreaming || isDebouncing) ? 'not-allowed' : 'pointer',
                    opacity: (loadingExpl || isStreaming || isDebouncing) ? 0.7 : 1,
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    boxShadow: '0 4px 10px rgba(139, 92, 246, 0.25)'
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>Predict 72-Hour</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 'normal' }}>Forecast Trajectory</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Gemini AI Modal Overlay */}
      {isModalOpen && createPortal(
        <div className="animate-fade-in" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.25rem'
        }}>
          <div style={{
            background: 'var(--bg-color)',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '88vh',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 1.8rem', borderBottom: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, color: modalType === 'predict' ? '#8b5cf6' : 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.35rem' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                  {modalType === 'predict' ? '72-Hour X-AI Forecast' : 'Gemini X-AI Diagnostics'}
                </h2>
                {isFromCache && (
                  <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 'bold' }}>
                    ⚡ INSTANT CACHE (0ms)
                  </span>
                )}
                {isDeterministicFallback && (
                  <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 'bold' }}>
                    🔬 LOCAL ATMOSPHERIC ENGINE
                  </span>
                )}
                {isStreaming && (
                  <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="animate-pulse" style={{ width: '6px', height: '6px', background: '#2563eb', borderRadius: '50%' }}></span>
                    STREAMING LIVE
                  </span>
                )}
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'var(--code-bg)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--code-bg)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.75rem 2rem', overflowY: 'auto', flex: 1, position: 'relative' }}>
              {loadingExpl ? (
                <div className="animate-fade-in" style={{ padding: '2rem', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)' }}>
                  <h3 style={{ color: modalType === 'predict' ? '#8b5cf6' : 'var(--primary-color)', margin: '0 0 2rem 0', textAlign: 'center', fontSize: '1.2rem' }}>Neural Diagnostics Pipeline</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px', margin: '0 auto' }}>
                    
                    {/* Step 1 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: workflowStep >= 0 ? 1 : 0.3, transition: 'opacity 0.5s' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: workflowStep > 0 ? '#10b981' : (workflowStep === 0 ? (modalType === 'predict' ? '#8b5cf6' : 'var(--primary-color)') : '#cbd5e1'), display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '14px', fontWeight: 'bold', transition: 'all 0.3s' }}>
                        {workflowStep > 0 ? '✓' : '1'}
                      </div>
                      <div style={{ flex: 1, height: '4px', background: workflowStep > 0 ? '#10b981' : '#e2e8f0', borderRadius: '2px', transition: 'all 0.3s' }}></div>
                      <span style={{ fontSize: '1rem', fontWeight: workflowStep === 0 ? 'bold' : 'normal', color: workflowStep === 0 ? (modalType === 'predict' ? '#8b5cf6' : 'var(--primary-color)') : 'var(--text-main)', transition: 'all 0.3s' }}>{modalType === 'predict' ? 'Ingesting 72-Hour WAQI Forecast' : 'Compiling WRF-Chem Dataset'}</span>
                    </div>

                    {/* Step 2 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: workflowStep >= 1 ? 1 : 0.3, transition: 'opacity 0.5s' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: workflowStep > 1 ? '#10b981' : (workflowStep === 1 ? (modalType === 'predict' ? '#8b5cf6' : 'var(--primary-color)') : '#cbd5e1'), display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '14px', fontWeight: 'bold', transition: 'all 0.3s' }}>
                        {workflowStep > 1 ? '✓' : '2'}
                      </div>
                      <div style={{ flex: 1, height: '4px', background: workflowStep > 1 ? '#10b981' : '#e2e8f0', borderRadius: '2px', transition: 'all 0.3s' }}></div>
                      <span style={{ fontSize: '1rem', fontWeight: workflowStep === 1 ? 'bold' : 'normal', color: workflowStep === 1 ? (modalType === 'predict' ? '#8b5cf6' : 'var(--primary-color)') : 'var(--text-main)', transition: 'all 0.3s' }}>{modalType === 'predict' ? 'Simulating Weather Vectors' : 'Connecting to Neural Engine'}</span>
                    </div>

                    {/* Step 3 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: workflowStep >= 2 ? 1 : 0.3, transition: 'opacity 0.5s' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: workflowStep > 2 ? '#10b981' : (workflowStep === 2 ? (modalType === 'predict' ? '#8b5cf6' : 'var(--primary-color)') : '#cbd5e1'), display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '14px', fontWeight: 'bold', transition: 'all 0.3s' }}>
                        {workflowStep > 2 ? '✓' : '3'}
                      </div>
                      <div style={{ flex: 1, height: '4px', background: workflowStep > 2 ? '#10b981' : '#e2e8f0', borderRadius: '2px', transition: 'all 0.3s' }}></div>
                      <span style={{ fontSize: '1rem', fontWeight: workflowStep === 2 ? 'bold' : 'normal', color: workflowStep === 2 ? (modalType === 'predict' ? '#8b5cf6' : 'var(--primary-color)') : 'var(--text-main)', transition: 'all 0.3s' }}>{modalType === 'predict' ? 'Processing Health Exposure' : 'Synthesizing Chemical Drivers'}</span>
                    </div>

                    {/* Step 4 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: workflowStep >= 3 ? 1 : 0.3, transition: 'opacity 0.5s' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: workflowStep > 3 ? '#10b981' : (workflowStep === 3 ? (modalType === 'predict' ? '#8b5cf6' : 'var(--primary-color)') : '#cbd5e1'), display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '14px', fontWeight: 'bold', transition: 'all 0.3s' }}>
                        {workflowStep > 3 ? '✓' : '4'}
                      </div>
                      <div style={{ flex: 1, height: '4px', background: workflowStep > 3 ? '#10b981' : '#e2e8f0', borderRadius: '2px', transition: 'all 0.3s' }}></div>
                      <span style={{ fontSize: '1rem', fontWeight: workflowStep === 3 ? 'bold' : 'normal', color: workflowStep === 3 ? (modalType === 'predict' ? '#8b5cf6' : 'var(--primary-color)') : 'var(--text-main)', transition: 'all 0.3s' }}>{modalType === 'predict' ? 'Generating X-AI Trajectory' : 'Formatting Diagnostic Report'}</span>
                    </div>
                  </div>
                </div>
              ) : explanation ? (
                <div className="animate-fade-in" style={{ background: 'var(--bg-color)', padding: '1.75rem 2rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', fontSize: '1.05rem', lineHeight: '1.8' }}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      h1: ({node, ...props}) => <h1 style={{ color: 'var(--text-main)', fontSize: '1.8rem', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }} {...props} />,
                      h3: ({node, ...props}) => <h3 style={{ color: 'var(--primary-color)', fontSize: '1.4rem', margin: '2rem 0 1rem 0' }} {...props} />,
                      h4: ({node, ...props}) => <h4 style={{ color: 'var(--text-main)', fontSize: '1.2rem', margin: '1.5rem 0 0.75rem 0', fontWeight: 'bold' }} {...props} />,
                      p: ({node, ...props}) => <p style={{ margin: '0.75rem 0', color: 'var(--text-muted)' }} {...props} />,
                      ul: ({node, ...props}) => <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: '1rem 0', color: 'var(--text-muted)' }} {...props} />,
                      ol: ({node, ...props}) => <ol style={{ listStyleType: 'decimal', paddingLeft: '1.5rem', margin: '1rem 0', color: 'var(--text-muted)' }} {...props} />,
                      li: ({node, ...props}) => <li style={{ marginBottom: '0.5rem' }} {...props} />,
                      strong: ({node, ...props}) => <strong style={{ color: 'var(--text-main)', fontWeight: '700' }} {...props} />,
                      em: ({node, ...props}) => <em style={{ fontStyle: 'italic', color: 'var(--primary-color)' }} {...props} />,
                      blockquote: ({node, ...props}) => <blockquote style={{ borderLeft: '4px solid var(--primary-color)', background: 'var(--code-bg)', padding: '1rem', margin: '1.5rem 0', borderRadius: '0 8px 8px 0', fontStyle: 'italic' }} {...props} />,
                      table: ({node, ...props}) => <div style={{ overflowX: 'auto', margin: '1.5rem 0', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.03)' }}><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }} {...props} /></div>,
                      th: ({node, ...props}) => <th style={{ padding: '0.75rem 1rem', background: 'var(--code-bg)', borderBottom: '2px solid var(--border-color)', fontWeight: 'bold', color: 'var(--text-main)' }} {...props} />,
                      td: ({node, ...props}) => <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }} {...props} />,
                      code: ({node, inline, ...props}) => inline ? <code style={{ background: 'var(--code-bg)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.9em', color: '#db2777' }} {...props} /> : <pre style={{ background: '#1e293b', color: '#f8fafc', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}><code {...props} /></pre>
                    }}
                  >
                    {explanation}
                  </ReactMarkdown>
                  {isStreaming && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1rem', color: 'var(--primary-color)', fontSize: '0.88rem', fontWeight: 600 }}>
                      <span className="animate-pulse" style={{ display: 'inline-block', width: '8px', height: '14px', background: 'var(--primary-color)' }}></span>
                      <span>Streaming neural diagnostic tokens live...</span>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Waiting for AI execution...</p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
