// Equirectangular projection onto the SVG viewBox (360×180)
function project(lat, lng) {
  return { x: lng + 180, y: 90 - lat }
}

const KEYFRAMES = `
  @keyframes hrm-ping {
    0%   { transform: scale(1);   opacity: 0.8; }
    100% { transform: scale(2.5); opacity: 0;   }
  }
`

// ---------- habitat → marker lookup ----------
// Keys are lowercase substrings to match against the species' habitat field.
// Values are arrays of { lat, lng } objects.
const HABITAT_MARKERS = {
  'chesapeake':        [{ lat: 38.5,  lng: -76.4 }],
  'delaware bay':      [{ lat: 39.0,  lng: -75.3 }],
  'delaware':          [{ lat: 39.0,  lng: -75.3 }],
  'barnegat':          [{ lat: 39.8,  lng: -74.1 }],
  'sandy hook':        [{ lat: 40.45, lng: -74.0 }],
  'nj atlantic':       [{ lat: 39.5,  lng: -74.2 }],
  'new jersey':        [{ lat: 39.5,  lng: -74.2 }],
  'rehoboth':          [{ lat: 38.65, lng: -74.95 }],
  'ocean city':        [{ lat: 38.33, lng: -74.9  }],
  'mid-atlantic':      [{ lat: 38.5,  lng: -73.5  }, { lat: 40.0, lng: -71.0 }],
  'mid atlantic':      [{ lat: 38.5,  lng: -73.5  }, { lat: 40.0, lng: -71.0 }],
  'atlantic coast':    [{ lat: 38.0,  lng: -73.0  }, { lat: 41.5, lng: -70.0 }],
  'atlantic':          [{ lat: 38.0,  lng: -70.0  }, { lat: 42.0, lng: -65.0 }],
  'open ocean':        [{ lat: 35.0,  lng: -65.0  }, { lat: 28.0, lng: -45.0 }, { lat: 20.0, lng: -30.0 }],
  'offshore':          [{ lat: 37.0,  lng: -68.0  }, { lat: 41.0, lng: -63.0 }],
  'coastal':           [{ lat: 38.5,  lng: -74.5  }, { lat: 40.5, lng: -72.0 }],
  'estuar':            [{ lat: 38.8,  lng: -76.5  }, { lat: 39.5, lng: -75.5 }],  // estuarine/estuary
  'bay':               [{ lat: 38.5,  lng: -76.4  }, { lat: 39.0, lng: -75.3 }],
  'migratory':         [{ lat: 38.0,  lng: -70.0  }, { lat: 45.0, lng: -55.0 }, { lat: 20.0, lng: -35.0 }],
  'reef':              [{ lat: 36.0,  lng: -75.0  }, { lat: 33.0, lng: -77.5 }],
  'rocky':             [{ lat: 41.5,  lng: -70.5  }, { lat: 43.5, lng: -69.5 }],
  'sandy':             [{ lat: 38.5,  lng: -74.5  }, { lat: 40.5, lng: -73.5 }],
  'shallow':           [{ lat: 38.8,  lng: -75.2  }, { lat: 39.8, lng: -74.3 }],
  'deep':              [{ lat: 37.0,  lng: -68.0  }, { lat: 39.0, lng: -63.0 }],
  'worldwide':         [{ lat: 38.0,  lng: -70.0  }, { lat: 10.0, lng: -25.0 }, { lat: 5.0,  lng: 50.0  }],
  'global':            [{ lat: 38.0,  lng: -70.0  }, { lat: 10.0, lng: -25.0 }, { lat: 5.0,  lng: 50.0  }],
  'tropical':          [{ lat: 15.0,  lng: -60.0  }, { lat: 5.0,  lng: 10.0  }, { lat: 10.0, lng: 80.0  }],
  'temperate':         [{ lat: 42.0,  lng: -65.0  }, { lat: 48.0, lng: -10.0 }],
  'gulf stream':       [{ lat: 32.0,  lng: -79.5  }, { lat: 36.0, lng: -74.5 }, { lat: 40.0, lng: -68.0 }],
  'gulf of mexico':    [{ lat: 25.0,  lng: -90.0  }, { lat: 28.0, lng: -94.0 }],
  'caribbean':         [{ lat: 18.0,  lng: -67.0  }, { lat: 14.0, lng: -83.0 }],
  'pacific':           [{ lat: 35.0,  lng: -140.0 }, { lat: 20.0, lng: -160.0 }, { lat: 48.0, lng: -125.0 }],
  'indo-pacific':      [{ lat: 5.0,   lng: 80.0   }, { lat: 0.0,  lng: 130.0 }, { lat: 15.0, lng: 160.0 }],
}

const FALLBACK_MARKERS = [{ lat: 38.5, lng: -74.5 }]

function resolveMarkers(habitat) {
  if (!habitat) return FALLBACK_MARKERS
  const lower = habitat.toLowerCase()
  // Try longest matching key first so "chesapeake bay" beats "bay"
  const sorted = Object.keys(HABITAT_MARKERS).sort((a, b) => b.length - a.length)
  for (const key of sorted) {
    if (lower.includes(key)) return HABITAT_MARKERS[key]
  }
  return FALLBACK_MARKERS
}

// ---------- SVG continent paths (equirectangular 360×180 viewBox) ----------
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
  // Asia
  'M216,22 L256,8 L302,8 L328,18 L336,35 L318,52 L298,66 L272,72 L255,68 L240,55 L222,48 Z',
  // Indian subcontinent
  'M240,52 L258,56 L264,74 L254,90 L240,88 L234,74 Z',
  // SE Asia peninsula
  'M276,68 L290,72 L285,86 L275,88 L270,80 Z',
  // Japan
  'M324,36 L332,32 L336,42 L326,50 L320,44 Z',
  // Philippines
  'M300,72 L308,70 L310,80 L302,82 Z',
  // Indonesia/Borneo
  'M285,88 L310,84 L316,92 L308,98 L285,96 Z',
  // Australia
  'M290,92 L320,86 L340,94 L345,110 L330,126 L304,130 L284,120 L280,106 Z',
  // New Zealand
  'M340,122 L348,118 L352,128 L344,136 L338,128 Z',
  // Antarctica
  'M0,160 L360,160 L360,175 L0,175 Z',
]

// ---------- component ----------
// Accepts either:
//   markers + caption  (explicit, used by OceanMap ecology tab)
//   habitat + name     (auto-resolve from habitat string, used by right sidebar)
export default function HabitatRangeMap({ markers, caption, habitat, name }) {
  const resolvedMarkers = markers ?? resolveMarkers(habitat)
  const resolvedCaption = caption ?? (habitat || name || '')

  return (
    <div style={styles.wrapper}>
      <style>{KEYFRAMES}</style>
      <p style={styles.label}>HABITAT RANGE</p>

      <div style={styles.mapContainer}>
        <svg
          viewBox="0 0 360 180"
          style={styles.svg}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="hrm-ocean-glow" cx="50%" cy="55%" r="60%">
              <stop offset="0%"   stopColor="#0d3c64" />
              <stop offset="100%" stopColor="#04121f" />
            </radialGradient>
          </defs>
          <rect width="360" height="180" fill="url(#hrm-ocean-glow)" />

          {/* Guide lines */}
          <line x1="0" y1="90"  x2="360" y2="90"  stroke="#0d2e3d" strokeWidth="0.4" strokeDasharray="6,6" />
          <line x1="0" y1="67"  x2="360" y2="67"  stroke="#0c2a3a" strokeWidth="0.3" strokeDasharray="4,8" />
          <line x1="0" y1="113" x2="360" y2="113" stroke="#0c2a3a" strokeWidth="0.3" strokeDasharray="4,8" />

          {/* Landmasses */}
          <g fill="#1a3a4a" stroke="#122a38" strokeWidth="0.5" strokeLinejoin="round">
            {LAND_PATHS.map((d, i) => <path key={i} d={d} />)}
          </g>

          {/* Ping markers */}
          {resolvedMarkers.map((m, i) => {
            const { x, y } = project(m.lat, m.lng)
            return (
              <g key={i} transform={`translate(${x},${y})`}>
                {/* Expanding ring */}
                <circle
                  r="10"
                  fill="none"
                  stroke="rgba(91,200,245,0.4)"
                  strokeWidth="1"
                  style={{
                    animation: 'hrm-ping 1.5s ease-out infinite',
                    animationDelay: `${i * 0.5}s`,
                    transformOrigin: '0px 0px',
                  }}
                />
                {/* Solid center dot */}
                <circle r="4" fill="#5bc8f5" />
              </g>
            )
          })}
        </svg>
      </div>

      {resolvedCaption && <p style={styles.caption}>{resolvedCaption}</p>}
    </div>
  )
}

const styles = {
  wrapper: {
    width: '100%',
    background: '#04121f',
    borderRadius: '10px',
    border: '1px solid rgba(91,200,245,0.12)',
    padding: '12px',
  },
  label: {
    fontFamily: 'monospace',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: 'rgba(200,235,255,0.4)',
    marginBottom: '8px',
  },
  mapContainer: {
    width: '100%',
    borderRadius: '8px',
    border: '1px solid rgba(91,200,245,0.1)',
    background: '#0a1f2e',
    overflow: 'hidden',
  },
  svg: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  caption: {
    fontSize: '12px',
    color: 'rgba(200,235,255,0.5)',
    marginTop: '8px',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 1.4,
  },
}
