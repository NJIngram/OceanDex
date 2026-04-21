import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const REGION_COORDS = {
  'Chesapeake Bay': [37.8, -76.1],
  'Ocean City Atlantic Coast': [38.33, -74.9],
  'Delaware Bay': [39.1, -75.35],
  'Rehoboth Beach Shelf': [38.65, -74.95],
  'Sandy Hook Bay': [40.45, -74.0],
  'Barnegat Bay': [39.77, -74.1],
  'NJ Atlantic Shelf': [39.4, -73.6],
}

const CATEGORY_COLORS = {
  fish: '#5F9EA0',
  shark: '#909EAE',
  ray: '#4682B4',
  shellfish: '#ff4b33',
  other: '#6A5ACD',
}

export default function OceanMap() {
  const [creatures, setCreatures] = useState([])
  const [loading, setLoading] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    fetch('api/map-data')
      .then(r => r.json())
      .then(setCreatures)
      .catch(() => {})
  }, [])

  const filtered = activeCategory === 'all'
    ? creatures
    : creatures.filter(c => c.category === activeCategory)

  const toShow = selected ? [selected] : filtered

  const pins = []
  toShow.forEach(c => {
    creature.region_associations.forEach(a => {
      const coords = REGION_COORDS[a.region?.name]
      if (coords) pins.push({ coords, creature, assoc: a })
    })
  })
  return (
    <div className="ocean-map-page">
      <div className="map-filters">
        <h2>Ocean Map</h2>
        <p>Habitat ranges across Delaware, Maryland &amp; New Jersey waters.</p>
    </div>

    <div className="map-controls">
      {['all', 'fish', 'shark', 'ray', 'shellfish', 'other'].map(c => (
        <button
          key={cat}
          className={`map-filter-btn ${activeCategory === cat ? 'active' : ''}`}
          onClick={() => { setActiveCategory(cat); setSelected(null); }}
        >
          {cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
      ))}
    </div>

        >
          {c}
        </button>
      ))}
    </div>
  )
