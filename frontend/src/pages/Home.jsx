import { useState, useEffect } from 'react'
import SpeciesListItem from '../components/SpeciesListItem'
import SpeciesDetailPanel from '../components/SpeciesDetailPanel'
import SpeciesCard from '../components/SpeciesCard'
import HabitatRangeMap from '../components/HabitatRangeMap'
import { CATEGORIES } from '../utils/constants'

export default function Explore() {
  const [creatures, setCreatures] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [states, setStates] = useState([])
  const [stateId, setStateId] = useState('')
  const [listLoading, setListLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [related, setRelated] = useState([])
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    setListLoading(true)
    setSelectedId(null)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (category) params.set('category', category)
    if (stateId) params.set('state_id', stateId)
    fetch(`/api/creatures?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error('Fetch failed')
        return r.json()
      })
      .then((data) => {
        setCreatures(data)
        setListLoading(false)
        if (data.length > 0) setSelectedId(data[0].id)
      })
      .catch(() => {
        setCreatures([])
        setListLoading(false)
      })
  }, [search, category, stateId])

  useEffect(() => {
    fetch('/api/states')
      .then(r => r.json())
      .then(setStates)
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setDetailLoading(true)
    setDetail(null)
    setRelated([])
    Promise.all([
      fetch(`/api/creatures/${selectedId}`).then((r) => {
        if (!r.ok) throw new Error('Fetch failed')
        return r.json()
      }),
      fetch(`/api/creatures/${selectedId}/related`).then((r) => {
        if (!r.ok) throw new Error('Fetch failed')
        return r.json()
      }),
    ]).then(([d, r]) => {
      setDetail(d)
      setRelated(r)
      setDetailLoading(false)
    }).catch(() => {
      setDetailLoading(false)
    })
  }, [selectedId])

  return (
    <div className="explore">
      <aside className="sidebar">
        <div className="sidebar-filters">
          <input
            className="search-input"
            type="text"
            placeholder="Search species, family..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="category-pills">
            <button className={`pill ${!category ? 'active' : ''}`} onClick={() => setCategory('')}>
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`pill ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <select
          className="state-select"
          value={stateId}
          onChange={(e) => setStateId(e.target.value)}
        >
          <option value="">All States</option>
          {states.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <div className="species-list">
          {listLoading ? (
            <p className="sidebar-msg">Loading...</p>
          ) : creatures.length === 0 ? (
            <p className="sidebar-msg">No results.</p>
          ) : (
            creatures.map((c) => (
              <SpeciesListItem
                key={c.id}
                creature={c}
                selected={c.id === selectedId}
                onClick={() => setSelectedId(c.id)}
              />
            ))
          )}
        </div>
      </aside>

      <div className="detail-col">
        {detailLoading ? (
          <div className="detail-empty"><p>Loading...</p></div>
        ) : detail ? (
          <SpeciesDetailPanel creature={detail} />
        ) : (
          <div className="detail-empty"><p>Select a species to view details.</p></div>
        )}
      </div>

      <aside className="right-panel">
        <div className="right-section">
          <HabitatRangeMap
            habitat={detail?.habitat}
            name={detail?.common_name}
          />
        </div>

        {detail?.conservation?.aware_fact && (
          <div className="right-section">
            <p className="right-label">CONSERVATION AWARENESS</p>
            <div className="right-awareness">
              <p className="awareness-title">Did You Know?</p>
              <p className="awareness-text">{detail.conservation.aware_fact}</p>
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div className="right-section">
            <p className="right-label">RELATED SPECIES</p>
            <div className="related-list">
              {related.map((r) => (
                <div key={r.id} onClick={() => setSelectedId(r.id)} style={{ cursor: 'pointer' }}>
                  <SpeciesCard creature={r} />
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
