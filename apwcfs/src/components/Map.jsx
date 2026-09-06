import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Fix missing Leaflet marker icons when using Vite/Webpack
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Haversine formula to calculate distance in km between two lat/lng coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
};

const DELHI_COORDS = { lat: 28.6139, lng: 77.2090 };
const MAX_RADIUS_KM = 600;

export default function Map({ selectedLoc, onLocationSelect }) {
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);
  const markerRef = useRef(null);
  const peripheryRef = useRef(null);
  const [regionalScore, setRegionalScore] = useState(250); // Default baseline
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);
  const showToastRef = useRef(null);

  const showToast = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  showToastRef.current = showToast;

  // Fetch Regional Baseline (Delhi) ONCE on mount for the static Map Cloud
  useEffect(() => {
    async function fetchRegionalBaseline() {
      try {
        const waqiKey = import.meta.env.VITE_WAQI_API_KEY || '2f9b8c281df6881c1c3fdb6b0cf92f3987be7ab9';
        const [omRes, waqiRes] = await Promise.all([
          fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${DELHI_COORDS.lat}&longitude=${DELHI_COORDS.lng}&current=aerosol_optical_depth,carbon_monoxide,sulphur_dioxide`).then(res => res.json()),
          fetch(`https://api.waqi.info/feed/geo:${DELHI_COORDS.lat};${DELHI_COORDS.lng}/?token=${waqiKey}`).then(res => res.json())
        ]);
        
        let score = waqiRes.data?.iaqi?.pm25?.v || 250;
        
        // Apply WRF-Chem penalties based on regional center
        const co = omRes.current?.carbon_monoxide || 0;
        const so2 = omRes.current?.sulphur_dioxide || 0;
        if (co > 300) score *= 1.1;
        if (so2 > 5) score *= 1.15;
        
        setRegionalScore(score);
      } catch (err) {
        console.error("Failed to fetch regional baseline for map", err);
      }
    }
    fetchRegionalBaseline();
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      
      const maxLatOffset = 600 / 111.32; // 600km in degrees lat
      const maxLngOffset = 600 / (111.32 * Math.cos(DELHI_COORDS.lat * (Math.PI / 180)));
      
      const bounds = L.latLngBounds(
        [DELHI_COORDS.lat - maxLatOffset, DELHI_COORDS.lng - maxLngOffset], // SW
        [DELHI_COORDS.lat + maxLatOffset, DELHI_COORDS.lng + maxLngOffset]  // NE
      );

      // Initialize Leaflet Map Centered on Delhi and locked to 600km bounds
      mapRef.current = L.map('map', {
        center: [DELHI_COORDS.lat, DELHI_COORDS.lng],
        zoom: 6,
        maxBounds: bounds, // Lock panning to the 600kmx600km visual grid
        maxBoundsViscosity: 1.0,
        minZoom: 5
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(mapRef.current);

      // Handle Map Clicks for specific WAQI coordinate lookups with Radius Restriction
      mapRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        
        const dist = calculateDistance(DELHI_COORDS.lat, DELHI_COORDS.lng, lat, lng);
        
        if (dist > MAX_RADIUS_KM) {
          showToastRef.current?.(`⚠️ Out of Monitoring Bounds: Selected point is ${Math.round(dist)}km from Delhi (Monitoring radius limit: ${MAX_RADIUS_KM}km).`);
          return;
        }

        if (onLocationSelect) {
          onLocationSelect({ lat, lng });
        }
      });
      
      // Draw the Dotted Periphery Circle (600km monitoring radius)
      peripheryRef.current = L.circle([DELHI_COORDS.lat, DELHI_COORDS.lng], {
        color: '#000000', // Black dotted line as requested
        fillColor: 'transparent',
        weight: 3,
        dashArray: '10, 15', // Dotted line effect
        radius: MAX_RADIUS_KM * 1000 // Convert km to meters
      }).addTo(mapRef.current);
    }
  }, [onLocationSelect]);

  // Handle selected location by drawing a 5x5km Bounding Box (Satellite/WRF Grid size)
  useEffect(() => {
    if (mapRef.current && selectedLoc) {
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
      }
      
      // Calculate 5x5km bounding box (2.5km offset in all 4 directions from center)
      const lat = selectedLoc.lat;
      const lng = selectedLoc.lng;
      
      const latOffset = 2.5 / 111.32; // 1 degree of latitude = ~111.32 km
      const lngOffset = 2.5 / (111.32 * Math.cos(lat * (Math.PI / 180))); 

      const bounds = [
        [lat - latOffset, lng - lngOffset], // SouthWest
        [lat + latOffset, lng + lngOffset]  // NorthEast
      ];

      markerRef.current = L.rectangle(bounds, {
        color: "#ef4444", // Red border
        weight: 2,
        fillColor: "#ef4444",
        fillOpacity: 0.15 // Semi-transparent fill
      }).addTo(mapRef.current);
    }
  }, [selectedLoc]);

  // Render Static Heatmap driven by Regional Baseline (No drastically changing on click)
  useEffect(() => {
    if (mapRef.current && regionalScore) {
      if (heatLayerRef.current) {
        mapRef.current.removeLayer(heatLayerRef.current);
      }

      const heatPoints = [];
      
      // Generate a highly optimized blanket of points for the 600km grid
      // Reduced from 2000 to 600 to massively improve canvas rendering performance on zoom
      for (let i = 0; i < 600; i++) { 
        const angle = Math.random() * Math.PI * 2;
        const radialDistDegrees = Math.pow(Math.random(), 2) * 5.4; 
        
        const pointLat = DELHI_COORDS.lat + Math.sin(angle) * radialDistDegrees;
        const pointLng = DELHI_COORDS.lng + Math.cos(angle) * radialDistDegrees;
        
        const decay = Math.max(0.1, 1 - (radialDistDegrees / 5.4)); 
        
        // Ensure intensity strictly matches the AQI scale without density stacking
        const intensity = regionalScore * decay * (0.8 + Math.random() * 0.4); // Add slight organic variation
        
        if (intensity > 20) {
          heatPoints.push([pointLat, pointLng, intensity]);
        }
      }

      heatLayerRef.current = L.heatLayer(heatPoints, {
        radius: 60, // Fixed, wider radius for smoother blending without dynamic recalculation
        blur: 70,
        maxZoom: 12, 
        max: 500, // Strictly set to CPCB max so colors map to absolute intensity, not relative density
        minOpacity: 0.3,
        gradient: {
          0.12: '#22c55e', // 60/500 = Satisfactory
          0.18: '#eab308', // 90/500 = Moderate
          0.24: '#f97316', // 120/500 = Poor
          0.50: '#ef4444', // 250/500 = Very Poor
          1.00: '#8b0000'  // 500/500 = Severe
        }
      }).addTo(mapRef.current);
    }
  }, [regionalScore]);

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Non-blocking in-app Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'absolute',
          top: '14px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(185, 28, 28, 0.95)',
          backdropFilter: 'blur(8px)',
          color: '#ffffff',
          padding: '0.6rem 1.15rem',
          borderRadius: '9999px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          zIndex: 1002,
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.85rem',
          fontWeight: '600',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          maxWidth: '92%',
          textAlign: 'center',
          pointerEvents: 'auto'
        }}>
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 'bold',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              lineHeight: 1
            }}
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      <div id="map" className="map-container" style={{ width: '100%', height: 'clamp(300px, 38vh, 460px)', borderRadius: '12px', cursor: 'crosshair' }}></div>
      
      {/* Legend Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '12px 18px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '0.85rem' }}>CPCB AQI Scale</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '15px', height: '15px', background: '#8b0000', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '0.8rem' }}>Severe (&gt;250)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '15px', height: '15px', background: '#ef4444', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '0.8rem' }}>Very Poor (121-250)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '15px', height: '15px', background: '#f97316', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '0.8rem' }}>Poor (91-120)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '15px', height: '15px', background: '#eab308', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '0.8rem' }}>Moderate (61-90)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '15px', height: '15px', background: '#22c55e', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '0.8rem' }}>Satisfactory (0-60)</span>
        </div>
      </div>
    </div>
  );
}
