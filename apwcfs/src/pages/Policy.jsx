import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

export default function Policy() {
  // Policy Simulator Interactive State
  const [baseAqi, setBaseAqi] = useState(385); // Default Very Poor / Severe threshold
  const [trafficBan, setTrafficBan] = useState(true);
  const [constructionBan, setConstructionBan] = useState(true);
  const [mistCanons, setMistCanons] = useState(false);
  const [industrialShift, setIndustrialShift] = useState(false);
  const [oddEvenRule, setOddEvenRule] = useState(false);

  // Calculate simulated AQI reduction based on source apportionment coefficients (TERI/IIT Kanpur studies)
  const simulationResults = useMemo(() => {
    let reductionPercent = 0;
    let pm25Reduction = 0;
    let pm10Reduction = 0;
    let no2Reduction = 0;

    if (trafficBan) {
      reductionPercent += 14;
      pm25Reduction += 22;
      no2Reduction += 28;
    }
    if (constructionBan) {
      reductionPercent += 16;
      pm10Reduction += 35;
      pm25Reduction += 12;
    }
    if (mistCanons) {
      reductionPercent += 7;
      pm10Reduction += 18;
      pm25Reduction += 8;
    }
    if (industrialShift) {
      reductionPercent += 11;
      pm25Reduction += 15;
      no2Reduction += 20;
    }
    if (oddEvenRule) {
      reductionPercent += 9;
      pm25Reduction += 14;
      no2Reduction += 18;
    }

    // Dampen maximum possible short-term meteorological mitigation (max 48% due to regional background & meteorology)
    const effectiveReduction = Math.min(48, reductionPercent);
    const simulatedAqi = Math.round(baseAqi * (1 - effectiveReduction / 100));

    // Determine GRAP stage for both base and simulated
    const getGrapStage = (aqi) => {
      if (aqi > 450) return { stage: 'Stage IV', label: 'Severe+', color: '#7f1d1d', border: '#ef4444', desc: 'Emergency protocols, diesel truck bans, school closures' };
      if (aqi > 400) return { stage: 'Stage III', label: 'Severe', color: '#991b1b', border: '#f87171', desc: 'Construction halt, BS-III petrol & BS-IV diesel bans' };
      if (aqi > 300) return { stage: 'Stage II', label: 'Very Poor', color: '#c2410c', border: '#fb923c', desc: 'Diesel generator bans, parking fee hikes, power grid dispatch' };
      if (aqi > 200) return { stage: 'Stage I', label: 'Poor', color: '#ca8a04', border: '#facc15', desc: 'Mechanized road sweeping, anti-dust water sprinkling' };
      return { stage: 'Normal', label: 'Moderate / Satisfactory', color: '#15803d', border: '#4ade80', desc: 'Baseline emission standards, continuous CAAQMS monitoring' };
    };

    return {
      effectiveReduction,
      simulatedAqi,
      baseStage: getGrapStage(baseAqi),
      simulatedStage: getGrapStage(simulatedAqi),
      pm25Reduction: Math.min(55, pm25Reduction),
      pm10Reduction: Math.min(60, pm10Reduction),
      no2Reduction: Math.min(50, no2Reduction),
      livesProtectedEst: Math.round((baseAqi - simulatedAqi) * 12.5),
    };
  }, [baseAqi, trafficBan, constructionBan, mistCanons, industrialShift, oddEvenRule]);

  return (
    <div className="policy-page" style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 1rem',
          borderRadius: '9999px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          color: '#ef4444',
          fontSize: '0.85rem',
          fontWeight: '600',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: '1rem'
        }}>
          <span>⚖️ Governance & Policy Decision Support</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: '800', lineHeight: 1.2, marginBottom: '1rem', color: 'var(--text-main)' }}>
          GRAP Emergency Action Engine & <span style={{ color: 'var(--primary-color)' }}>Policy Simulator</span>
        </h1>
        <p style={{ maxWidth: '820px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Moving beyond passive observation. APWCFS transforms 72-hour weather–chemistry forecasts into actionable statutory enforcement under the Commission for Air Quality Management (CAQM) Graded Response Action Plan.
        </p>
      </div>

      {/* Interactive Simulator Card */}
      <div style={{
        background: 'var(--card-bg, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        marginBottom: '3.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0, color: 'var(--text-main)' }}>
              🧪 "What-If" Policy Mitigation Sandbox
            </h2>
            <p style={{ margin: '0.3rem 0 0', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Simulate municipal interventions to project air quality recovery before executing costly city-wide orders.
            </p>
          </div>

          {/* Baseline Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.02)', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-main)' }}>Baseline Forecast AQI:</span>
            <input 
              type="range" 
              min="150" 
              max="490" 
              step="5" 
              value={baseAqi} 
              onChange={(e) => setBaseAqi(Number(e.target.value))}
              style={{ cursor: 'pointer', width: '130px' }}
            />
            <span style={{ fontWeight: '800', fontSize: '1.1rem', color: simulationResults.baseStage.border }}>
              {baseAqi}
            </span>
          </div>
        </div>

        {/* Levers and Projected Outcome Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Column 1: Policy Levers */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🎛️ Municipal Enforcement Levers</span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: `1px solid ${trafficBan ? 'var(--primary-color)' : 'var(--border-color, #e2e8f0)'}`,
                background: trafficBan ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-main)' }}>Heavy Diesel Commercial Truck Entry Ban</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Halts non-essential commercial vehicles entering Delhi borders</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={trafficBan} 
                  onChange={(e) => setTrafficBan(e.target.checked)} 
                  style={{ transform: 'scale(1.25)', cursor: 'pointer' }}
                />
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: `1px solid ${constructionBan ? 'var(--primary-color)' : 'var(--border-color, #e2e8f0)'}`,
                background: constructionBan ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-main)' }}>Full Construction & Demolition Moratorium</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stops high-particulate excavation, drilling, and stone crushing</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={constructionBan} 
                  onChange={(e) => setConstructionBan(e.target.checked)} 
                  style={{ transform: 'scale(1.25)', cursor: 'pointer' }}
                />
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: `1px solid ${mistCanons ? 'var(--primary-color)' : 'var(--border-color, #e2e8f0)'}`,
                background: mistCanons ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-main)' }}>Anti-Smog Guns & Road Mist Water Canons</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Intensive arterial street washing & high-pressure misting</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={mistCanons} 
                  onChange={(e) => setMistCanons(e.target.checked)} 
                  style={{ transform: 'scale(1.25)', cursor: 'pointer' }}
                />
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: `1px solid ${industrialShift ? 'var(--primary-color)' : 'var(--border-color, #e2e8f0)'}`,
                background: industrialShift ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-main)' }}>Industrial PNG Fuel Shift & Plant De-rating</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Forces non-conforming industrial units to piped natural gas</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={industrialShift} 
                  onChange={(e) => setIndustrialShift(e.target.checked)} 
                  style={{ transform: 'scale(1.25)', cursor: 'pointer' }}
                />
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                border: `1px solid ${oddEvenRule ? 'var(--primary-color)' : 'var(--border-color, #e2e8f0)'}`,
                background: oddEvenRule ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-main)' }}>Odd-Even Private Vehicle Rationing</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Halves 4-wheeler personal fleet on alternate days</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={oddEvenRule} 
                  onChange={(e) => setOddEvenRule(e.target.checked)} 
                  style={{ transform: 'scale(1.25)', cursor: 'pointer' }}
                />
              </label>
            </div>
          </div>

          {/* Column 2: Projected Impact Card */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(37, 99, 235, 0.03), rgba(16, 185, 129, 0.04))',
            border: '1px solid rgba(37, 99, 235, 0.15)',
            borderRadius: '14px',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.75rem' }}>
                Simulated 48h Mitigation Impact
              </div>

              {/* Before vs After AQI Display */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', margin: '1.5rem 0', padding: '1.25rem', background: 'var(--card-bg, #ffffff)', borderRadius: '12px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Forecast AQI</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: '800', color: simulationResults.baseStage.border }}>
                    {baseAqi}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: simulationResults.baseStage.border, background: 'rgba(0,0,0,0.03)', padding: '0.2rem 0.5rem', borderRadius: '4px', marginTop: '0.25rem' }}>
                    {simulationResults.baseStage.stage}
                  </div>
                </div>

                <div style={{ fontSize: '1.8rem', color: 'var(--text-muted)' }}>➔</div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>With Policy Levers</div>
                  <div style={{ fontSize: '2.4rem', fontWeight: '800', color: simulationResults.simulatedStage.border }}>
                    {simulationResults.simulatedAqi}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: simulationResults.simulatedStage.border, background: 'rgba(0,0,0,0.03)', padding: '0.2rem 0.5rem', borderRadius: '4px', marginTop: '0.25rem' }}>
                    {simulationResults.simulatedStage.stage}
                  </div>
                </div>
              </div>

              {/* Pollutant Reduction Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>PM2.5 Drop</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary-color)' }}>-{simulationResults.pm25Reduction}%</div>
                </div>
                <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>PM10 Drop</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981' }}>-{simulationResults.pm10Reduction}%</div>
                </div>
                <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>NO2 Drop</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f59e0b' }}>-{simulationResults.no2Reduction}%</div>
                </div>
              </div>

              <div style={{ padding: '0.85rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🏥</span>
                <span style={{ fontSize: '0.88rem', color: '#065f46', fontWeight: '600' }}>
                  Projected Respiratory Hospital Admission Reduction: <strong>~{Math.round(simulationResults.effectiveReduction * 0.72)}%</strong> across Delhi NCR
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.06)', textAlign: 'right' }}>
              <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>View Live NCR Hotspots</span>
                <span>➔</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Official CAQM GRAP Matrix */}
      <div style={{ marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-main)', textAlign: 'center' }}>
          Statutory Graded Response Action Plan (GRAP) Matrix
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Stage I */}
          <div style={{
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid #facc15',
            borderTop: '4px solid #ca8a04',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#ca8a04' }}>Stage I (Poor)</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(202, 138, 4, 0.1)', color: '#ca8a04' }}>
                AQI 201 – 300
              </span>
            </div>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
              <li>Mechanized vacuum sweeping on arterial roads</li>
              <li>Water sprinkling to suppress road dust resuspension</li>
              <li>Strict anti-dust enforcement at private construction sites &gt;500 sq.m</li>
              <li>Crackdown on open municipal waste burning</li>
            </ul>
          </div>

          {/* Stage II */}
          <div style={{
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid #fb923c',
            borderTop: '4px solid #c2410c',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#c2410c' }}>Stage II (Very Poor)</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(194, 65, 12, 0.1)', color: '#c2410c' }}>
                AQI 301 – 400
              </span>
            </div>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
              <li>Total ban on diesel generator sets (except hospitals/railways)</li>
              <li>Hike in municipal parking fees to discourage private car use</li>
              <li>Enhanced public transport bus & metro service frequency</li>
              <li>Daily water spraying with dust suppressants at identified hotspots</li>
            </ul>
          </div>

          {/* Stage III */}
          <div style={{
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid #f87171',
            borderTop: '4px solid #991b1b',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#991b1b' }}>Stage III (Severe)</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(153, 27, 27, 0.1)', color: '#991b1b' }}>
                AQI 401 – 450
              </span>
            </div>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
              <li>Strict ban on all non-essential construction and demolition works</li>
              <li>Ban on plying of BS-III petrol and BS-IV diesel 4-wheelers in NCR</li>
              <li>Closure of stone crushers and brick kilns not using clean fuels</li>
              <li>Shift of primary schools (Classes Nursery to V) to online mode</li>
            </ul>
          </div>

          {/* Stage IV */}
          <div style={{
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid #ef4444',
            borderTop: '4px solid #7f1d1d',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#7f1d1d' }}>Stage IV (Severe+)</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(127, 29, 29, 0.1)', color: '#7f1d1d' }}>
                AQI &gt; 450
              </span>
            </div>
            <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
              <li>Stop entry of all non-essential diesel commercial trucks into Delhi</li>
              <li>Ban on linear public infrastructure projects (highways, flyovers, power)</li>
              <li>50% work-from-home mandate for government and private offices</li>
              <li>Emergency odd-even vehicle rationing or school/college shutdown</li>
            </ul>
          </div>
        </div>
      </div>

      {/* MoES / CPCB Operational Integration Callout */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(99, 102, 241, 0.08))',
        border: '1px solid rgba(37, 99, 235, 0.2)',
        borderRadius: '16px',
        padding: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem'
      }}>
        <div style={{ maxWidth: '780px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
            🛰️ Pre-Emptive Rather Than Reactive Regulation
          </h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Traditional GRAP protocols are invoked <em>after</em> CAAQMS stations record severe pollution for 48 consecutive hours. APWCFS enables CAQM to invoke emergency mitigation <strong>24 to 48 hours BEFORE</strong> the atmospheric inversion locks particulates at ground level.
          </p>
        </div>
        <Link to="/roadmap" className="btn btn-secondary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.92rem' }}>
          Explore National Roadmap ➔
        </Link>
      </div>
    </div>
  );
}
