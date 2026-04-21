// Equirectangular projection: viewBox 0 0 360 180
// x = lng + 180,  y = 90 - lat
function project(lat, lng) {
  return { x: lng + 180, y: 90 - lat }
}

const KEYFRAMES = `
  @keyframes hrm-ping {
    0%   { transform: scale(1);   opacity: 0.4; }
    100% { transform: scale(2.5); opacity: 0;   }
  }
`

// Simplified continent paths for a 360×180 equirectangular viewBox
const LAND_PATHS = [
  // North America
  'M15,22 L65,8 L90,14 L112,20 L118,32 L108,45 L100,63 L94,75 L82,75 L78,68 L72,58 L84,82 L94,88 L86,86 L75,65 L68,55 L62,30 L38,18 Z',
  // South America
  'M88,84 L112,76 L130,82 L148,98 L144,122 L126,148 L112,150 L100,140 L88,124 L84,105 Z',
  // Greenland
  'M122,10 L148,5 L156,12 L150,25 L136,30 L122,26 Z',
  // Iceland
  'M156,28 L166,25 L170,32 L160,37 L154,34 Z',
  // British Isles
  'M170,30 L178,28 L180,38 L172,43 L166,38 Z',
  // Europe
  'M162,40 L180,30 L192,20 L210,18 L220,26 L214,38 L204,48 L190,54 L172,52 Z',
  // Africa
  'M158,48 L198,40 L220,50 L230,70 L232,96 L220,122 L202,134 L182,134 L164,118 L154,92 L152,68 Z',
  // Madagascar
  'M228,100 L236,96 L239,108 L232,120 L225,112 Z',
  // Asia (main body)
  'M216,22 L256,8 L302,8 L328,18 L336,35 L318,52 L298,66 L272,72 L255,68 L240,55 L222,48 Z',
  // Indian subcontinent
  'M240,52 L258,56 L264,74 L254,90 L240,88 L234,74 Z',
  // SE Asia peninsula
  'M276,68 L290,72 L285,86 L275,88 L270,80 Z',
  // Japan (main islands)
  'M324,36 L332,32 L336,42 L326,50 L320,44 Z',
  // Sri Lanka
  'M258,90 L264,88 L265,96 L258,97 Z',
  // Philippines (simplified)
  'M300,72 L308,70 L310,80 L302,82 Z',
  // Indonesia/Borneo
  'M285,88 L310,84 L316,92 L308,98 L285,96 Z',
  // Australia
  'M290,92 L320,86 L340,94 L345,110 L330,126 L304,130 L284,120 L280,106 Z',
  // New Zealand (S island)
  'M340,122 L348,118 L352,128 L344,136 L338,128 Z',
  // Antarctica strip
  'M0,160 L360,160 L360,175 L0,175 Z',
]

export default function HabitatRangeMap({ markers = [], caption = '' }) {
  return (
    <div style={styles.wrapper}>
      <style>{KEYFRAMES}</style>
      <p style={styles.label}>HABITAT RANGE</p>

      <div style={styles.mapContainer}>
        <svg
          viewBox="0 0 360 180"
          preserveAspectRatio="none"
          style={styles.svg}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ocean background with radial glow */}
          <defs>
            <radialGradient id="hrm-ocean-glow" cx="50%" cy="55%" r="60%">
              <stop offset="0%"   stopColor="#0d3c64" />
              <stop offset="100%" stopColor="#04121f" />
            </radialGradient>
          </defs>
          <rect width="360" height="180" fill="url(#hrm-ocean-glow)" />

          {/* Subtle equator + tropics */}
          <line x1="0" y1="90"  x2="360" y2="90"  stroke="#0d2e3d" strokeWidth="0.4" strokeDasharray="6,6" />
          <line x1="0" y1="67"  x2="360" y2="67"  stroke="#0c2a3a" strokeWidth="0.3" strokeDasharray="4,8" />
          <line x1="0" y1="113" x2="360" y2="113" stroke="#0c2a3a" strokeWidth="0.3" strokeDasharray="4,8" />

          {/* Landmasses */}
          <g fill="#1a3a4a" stroke="#122a38" strokeWidth="0.5" strokeLinejoin="round">
            {LAND_PATHS.map((d, i) => <path key={i} d={d} />)}
          </g>

          {/* Ping markers */}
          {markers.map((m, i) => {
            const { x, y } = project(m.lat, m.lng)
            return (
              <g key={i} transform={`translate(${x},${y})`}>
                {/* Expanding ping ring */}
                <circle
                  r="12"
                  fill="#5bc8f5"
                  opacity="0.4"
                  style={{
                    animation: `hrm-ping 1.5s ease-out infinite`,
                    animationDelay: `${i * 0.5}s`,
                    transformOrigin: '0px 0px',
                  }}
                />
                {/* Solid center dot */}
                <circle r="5" fill="#5bc8f5" />
              </g>
            )
          })}
        </svg>
      </div>

      {caption && <p style={styles.caption}>{caption}</p>}
    </div>
  )
}

const styles = {
  wrapper: {
    width: '100%',
  },
  label: {
    fontFamily: 'monospace',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#3d6a8a',
    marginBottom: '8px',
  },
  mapContainer: {
    width: '100%',
    height: '120px',
    borderRadius: '10px',
    border: '1px solid rgba(91,200,245,0.12)',
    overflow: 'hidden',
    position: 'relative',
  },
  svg: {
    width: '100%',
    height: '100%',
    display: 'block',
  },
  caption: {
    fontSize: '0.75rem',
    color: '#4d82a8',
    marginTop: '6px',
    textAlign: 'center',
    fontStyle: 'italic',
  },
}
