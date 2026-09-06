export default function About() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1050px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem', padding: '1rem 0 3rem 0' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '2.5rem clamp(1.5rem, 4vw, 3rem)', textAlign: 'center', borderRadius: '16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.35rem 0.95rem', borderRadius: '999px', background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)', color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: '700', marginBottom: '1rem', letterSpacing: '0.03em' }}>
          TEAM UNHANDLED EXCEPTIONS
        </div>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: '800', letterSpacing: '-0.02em' }}>
          About The Project & Stakeholder Impact
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '820px', margin: '0 auto', lineHeight: '1.7' }}>
          APWCFS is an end-to-end decision-support platform engineered to transform retrospective air monitoring into forward-looking, explainable 72-hour pollution intelligence for Delhi NCR.
        </p>
      </div>

      {/* Stakeholder Value Matrix (Directly from Slide 5) */}
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-color)' }}>
            Impact & Benefits
          </span>
          <h2 style={{ fontSize: '1.85rem', margin: '0.35rem 0 0 0', fontWeight: '800' }}>
            Who Benefits From APWCFS?
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          
          {/* Citizens */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '14px', borderTop: '4px solid #2563eb' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#2563eb' }}>Citizens</h3>
            <p style={{ fontWeight: '600', fontSize: '0.88rem', color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>Awareness & Preparedness</p>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Enables residents to schedule commutes, outdoor physical activities, and indoor HEPA air purification before nocturnal inversion peaks develop.
            </p>
          </div>

          {/* Authorities */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '14px', borderTop: '4px solid #8b5cf6' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#8b5cf6' }}>Authorities</h3>
            <p style={{ fontWeight: '600', fontSize: '0.88rem', color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>Planning & Response</p>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Provides municipal and environmental bodies (CPCB, CAQM) with 72-hour lead time to enact Graded Response Action Plan (GRAP) stages preemptively.
            </p>
          </div>

          {/* Researchers */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '14px', borderTop: '4px solid #10b981' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#10b981' }}>Researchers</h3>
            <p style={{ fontWeight: '600', fontSize: '0.88rem', color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>Analysis & Validation</p>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Facilitates validation of coupled numerical weather prediction frameworks against Continuous Ambient Air Quality Monitoring Station (CAAQMS) ground truth.
            </p>
          </div>

          {/* Environment */}
          <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '14px', borderTop: '4px solid #f59e0b' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#f59e0b' }}>Environment</h3>
            <p style={{ fontWeight: '600', fontSize: '0.88rem', color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>Pollution Anticipation</p>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Pinpoints regional stubble-burning plume advection paths across Punjab and Haryana, quantifying transboundary aerosol transport into Delhi.
            </p>
          </div>

        </div>
      </div>

      {/* Feasibility, Viability & Risk Strategies (Directly from Slide 4) */}
      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '16px' }}>
        <h2 style={{ fontSize: '1.65rem', marginTop: 0, marginBottom: '0.75rem', fontWeight: '800' }}>
          Feasibility, Viability & Engineering Mitigations
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          Addressing the technical and infrastructural hurdles identified during system architecture planning:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '8px' }}>
              <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>Challenge 1: Cloud API Outages & Rate Limits</strong>
              <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 'bold' }}>SOLVED</span>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>
              <strong>Strategy:</strong> Implemented a client-side Deterministic Local Atmospheric Physics Engine with in-memory 0ms response caching. If cloud endpoints fail, scientific diagnostics are generated locally with zero downtime.
            </p>
          </div>

          <div style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '8px' }}>
              <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>Challenge 2: Sparse Ground Monitoring Networks</strong>
              <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 'bold' }}>SOLVED</span>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>
              <strong>Strategy:</strong> Applied Haversine distance spatial validation (&lt;25km). Rural or unmonitored coordinates automatically downscale satellite-derived 550nm Aerosol Optical Depth (AOD) into surface-level PM2.5.
            </p>
          </div>

          <div style={{ background: 'var(--card-bg)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '8px' }}>
              <strong style={{ color: 'var(--text-main)', fontSize: '1rem' }}>Challenge 3: Complex Scientific Jargon & Public Trust</strong>
              <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 'bold' }}>SOLVED</span>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>
              <strong>Strategy:</strong> Integrated Explainable AI (XAI) feature attribution. Complex thermodynamic equations are translated into accessible plain-language diagnostics, detailing direct health risks and protective protocols.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
