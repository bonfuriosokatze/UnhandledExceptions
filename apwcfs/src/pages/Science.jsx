export default function Science() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1050px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem', padding: '1rem 0 3rem 0' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '2.5rem clamp(1.5rem, 4vw, 3rem)', textAlign: 'center', borderRadius: '16px' }}>
        <div style={{ display: 'inline-block', padding: '0.25rem 0.85rem', borderRadius: '999px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.85rem', letterSpacing: '0.04em' }}>
          ATMOSPHERIC PHYSICS & NUMERICAL MODELING
        </div>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: '800', background: 'linear-gradient(90deg, var(--primary-color), #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
          The Atmospheric Science Engine
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '820px', margin: '0 auto', lineHeight: '1.7' }}>
          Delhi NCR’s air quality crisis is not governed by emissions alone. It is fundamentally dictated by <strong>Planetary Boundary Layer kinetics</strong>, <strong>thermal inversion barriers</strong>, and <strong>two-way coupled chemistry transport</strong>.
        </p>
      </div>

      {/* Dispersion Formula Section */}
      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '16px' }}>
        <h2 style={{ fontSize: '1.65rem', marginTop: 0, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          The Atmospheric Dispersion Equation
        </h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1rem', marginBottom: '1.5rem' }}>
          In urban atmospheric science, ground-level particulate concentration is governed by the box model dispersion balance:
        </p>

        <div style={{ background: 'var(--code-bg)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', margin: '1.5rem 0' }}>
          <div style={{ fontSize: '1.35rem', fontWeight: 'bold', color: 'var(--text-main)', letterSpacing: '0.04em' }}>
            Concentration (C) &prop; <span style={{ borderBottom: '2px solid var(--text-main)', paddingBottom: '2px' }}>Emissions Rate (E)</span> / <span style={{ paddingTop: '2px' }}>PBL Height (h) &times; Wind Velocity (u)</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.85rem 0 0 0' }}>
            The denominator <strong>(h &times; u)</strong> represents the <em>Ventilation Index</em>. When wind speed stalls (&lt;2 m/s) and nocturnal cooling shrinks PBL height (&lt;350m), the ventilation volume collapses by up to 85%, causing extreme pollution spikes without any increase in emission activity.
          </p>
        </div>
      </div>

      {/* Core Atmospheric Trapping Mechanisms Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem' }}>
        
        {/* Card 1: Boundary Layer Dynamics */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-color)' }}></span>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary-color)' }}>Boundary Layer Compression</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', margin: 0, fontSize: '0.94rem' }}>
            During summer, solar heating lifts the Planetary Boundary Layer (PBL) up to 2,000 meters, allowing deep vertical mixing. In winter, rapid ground radiation loss compresses the PBL to under 300 meters, forcing vehicular NO₂, dust, and smoke to concentrate inside a shallow surface ceiling.
          </p>
        </div>

        {/* Card 2: Thermal Inversion */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#8b5cf6' }}></span>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#8b5cf6' }}>Thermal Inversion Barriers</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', margin: 0, fontSize: '0.94rem' }}>
            Normally, atmospheric temperature decreases with altitude. Under clear winter skies, nocturnal radiative cooling causes surface air to cool faster than aloft air layers. This creates an inverted warm cap that suppresses turbulent updrafts, sealing pollutants in place until midday solar heating breaks the cap.
          </p>
        </div>

        {/* Card 3: Hygroscopic Swelling */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#10b981' }}>Hygroscopic Deliquescence</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', margin: 0, fontSize: '0.94rem' }}>
            Fine secondary aerosols (sulfates and nitrates) are hydrophilic. When relative humidity exceeds 70%, dry aerosols absorb ambient water molecules, swelling into larger droplets. This process multiplies light extinction, accelerates aqueous sulfate production, and produces thick secondary smog.
          </p>
        </div>

        {/* Card 4: Satellite Downscaling */}
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#f59e0b' }}>AOD Columnar Downscaling</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', margin: 0, fontSize: '0.94rem' }}>
            Satellite radiometers measure Aerosol Optical Depth (AOD) across the entire vertical column between the ground and space. Our platform utilizes empirical stability functions factoring in wind speed, temperature, and combustion proxies (CO/SO₂) to downscale total AOD into surface-level PM2.5.
          </p>
        </div>

      </div>

      {/* Academic Citations & References (Directly from Slide 6) */}
      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '16px' }}>
        <h2 style={{ fontSize: '1.5rem', marginTop: 0, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
          Academic Research & Benchmark Citations
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
          The architecture and physical parameterizations of APWCFS build upon peer-reviewed research in atmospheric modeling and Indian particulate datasets:
        </p>

        <ol style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
          <li>
            <strong style={{ color: 'var(--text-main)' }}>Advanced Research WRF Model (v4):</strong> W. C. Skamarock, J. B. Klemp, J. Dudhia, et al., <em>NCAR Technical Note NCAR/TN-556+STR</em>, National Center for Atmospheric Research, Boulder, CO.
          </li>
          <li>
            <strong style={{ color: 'var(--text-main)' }}>AirDelhi Spatio-Temporal Dataset:</strong> S. Chauhan, Z. B. Patel, S. Ranu, R. Sen, and N. Batra, <em>Advances in Neural Information Processing Systems 36 (NeurIPS 2023)</em>, Centre for Atmospheric Sciences, Indian Institute of Technology Delhi (IIT Delhi).
          </li>
          <li>
            <strong style={{ color: 'var(--text-main)' }}>Indian WRF-Chem Air Quality Optimization:</strong> I. Nandi and D. Ganguly, &ldquo;Toward reliable air quality simulations over India: Optimizing WRF-Chem through comprehensive sensitivity analysis,&rdquo; <em>Environmental Science: Atmospheres</em>, vol. 6, pp. 644–660, 2026.
          </li>
          <li>
            <strong style={{ color: 'var(--text-main)' }}>Coupled Atmospheric Frameworks:</strong> S. Maurya and P. Soni, &ldquo;Modelling uncertainty in WRF-based simulations over India: A review toward integrated atmosphere-chemistry-hydrology frameworks,&rdquo; <em>Atmospheric Research</em>, 2026.
          </li>
        </ol>
      </div>

    </div>
  );
}
