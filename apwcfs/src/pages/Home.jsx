import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3.5rem', padding: '1rem 0 3rem 0' }}>
      
      {/* SIH Hackathon Official Context Banner */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.35rem 0.95rem', borderRadius: '999px', background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.25)', color: 'var(--primary-color)', fontSize: '0.82rem', fontWeight: '700', marginBottom: '1.25rem', letterSpacing: '0.03em' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)' }}></span>
          SMART INDIA HACKATHON 2026 • PS ID: SIH 26082
        </div>

        <h1 className="hero-title" style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', marginBottom: '1.25rem', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
          Air Pollution – Weather Coupled<br />
          <span style={{ background: 'linear-gradient(90deg, #2563eb, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Forecasting System (Delhi NCR)
          </span>
        </h1>

        <p className="hero-subtitle" style={{ fontSize: 'clamp(1rem, 1.8vw, 1.25rem)', maxWidth: '820px', margin: '0 auto 2rem auto', color: 'var(--text-muted)', lineHeight: '1.7' }}>
          Developed by <strong>Team Unhandled Exceptions</strong> for the <strong>Ministry of Earth Sciences (MoES)</strong> and <strong>NCMRWF</strong>. Moving beyond static AQI numbers toward high-resolution 72-hour coupled atmospheric intelligence and Explainable AI.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/dashboard" className="btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem', fontWeight: '700', borderRadius: '10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)' }}>
            <span>Launch Live 72h Dashboard</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>

          <Link to="/science" style={{ padding: '0.9rem 1.75rem', fontSize: '1.05rem', fontWeight: '600', borderRadius: '10px', textDecoration: 'none', background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease', boxShadow: 'var(--card-shadow)' }}>
            <span>Explore The Science</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          </Link>
        </div>
      </div>

      {/* The 4 Core Impact Pillars (Directly from Slide 5) */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)', margin: '0 0 0.5rem 0', fontWeight: '700' }}>What Changes With APWCFS?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>From fragmented retrospective AQI monitoring to 72-hour proactive pollution intelligence.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          
          {/* Pillar 1 */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
              01
            </div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Earlier Awareness</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              Identify exactly when regional pollution episodes are expected to escalate across 24h, 48h, and 72h forecast horizons before air quality reaches hazardous thresholds.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
              02
            </div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Spatial Awareness</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              Continuous geospatial subcontinental heatmap pinpointing where particulate loading is likely to intensify, pool, and traverse across the Delhi NCR bounding basin.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
              03
            </div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Causal Understanding</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              Uncover the physical mechanisms: link surface spikes to boundary layer (PBL) compression, nocturnal thermal inversion traps, and upwind agricultural stubble plumes.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
              04
            </div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Informed Planning</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              A robust decision-support platform empowering citizens with exposure-mitigation timing and aiding municipal authorities with preemptive GRAP enforcement.
            </p>
          </div>

        </div>
      </div>

      {/* Two-Way Weather ↔ Chemistry Coupling Visualizer */}
      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-color)' }}>
              Scientific Coupling Paradigm
            </span>
            <h2 style={{ fontSize: '1.85rem', margin: '0.4rem 0 1rem 0', fontWeight: '800' }}>
              Why Coupled Modeling is Essential
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '0.98rem', marginBottom: '1.25rem' }}>
              Standard forecasting models treat meteorology and pollution dispersion as independent tracks. However, in Delhi NCR, severe winter episodes are driven by a violent two-way feedback loop:
            </p>
            <ul style={{ color: 'var(--text-muted)', lineHeight: '1.8', paddingLeft: '1.25rem', fontSize: '0.92rem', margin: 0 }}>
              <li><strong>Meteorology &rarr; Chemistry:</strong> Low surface winds (&lt;2 m/s) and shallow planetary boundary layers (&lt;400m) eliminate the atmosphere's ventilation volume.</li>
              <li><strong>Chemistry &rarr; Meteorology:</strong> Dense aerosol layers attenuate incoming solar radiation, reducing ground heat flux and locking nocturnal thermal inversions in place.</li>
            </ul>
          </div>

          <div style={{ background: 'var(--code-bg)', padding: '1.75rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
            <div style={{ textAlign: 'center', padding: '0.65rem', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: 'bold', color: 'var(--primary-color)' }}>
              WEATHER STATE: Temp • Wind • PBL • Humidity
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
              <span>&darr; Trapping Dynamics</span>
              <span>&uarr; Radiative Forcing</span>
            </div>
            <div style={{ textAlign: 'center', padding: '0.65rem', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: 'bold', color: '#8b5cf6' }}>
              CHEMICAL TRANSPORT: PM2.5 • PM10 • NO2 • AOD
            </div>
            <div style={{ textAlign: 'center', color: '#10b981', fontWeight: 'bold', fontSize: '0.82rem', marginTop: '0.25rem' }}>
              &harr; DUAL-WAY ATMOSPHERIC COUPLING FEEDBACK
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
