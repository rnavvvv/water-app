import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { supabase } from '../supabaseClient'

const COLORS = { polluted: 'red', scheduled: 'orange', cleaned: 'green' }

export default function MapView() {
  const [reports, setReports] = useState([])
  const [type, setType] = useState('all')

  useEffect(() => {
    supabase.from('reports').select('*').eq('verification', 'approved')
      .then(({ data }) => setReports(data || []))
  }, [])

  const shown = type === 'all' ? reports : reports.filter(r => r.pollution_type === type)

  return (
    <div style={{ padding: 12 }}>
      <div style={{ marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="all">All types</option>
          <option value="plastic">Plastic</option>
          <option value="industrial">Industrial</option>
          <option value="sewage">Sewage</option>
          <option value="oil_spill">Oil spill</option>
          <option value="other">Other</option>
        </select>
        <span>🔴 Polluted &nbsp; 🟠 Scheduled &nbsp; 🟢 Cleaned</span>
      </div>
      <MapContainer center={[13.0827, 80.2707]} zoom={11} style={{ height: '75vh' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
        {shown.map(r => (
          <CircleMarker key={r.id} center={[r.lat, r.lng]} radius={10}
            pathOptions={{ color: COLORS[r.status], fillOpacity: 0.7 }}>
            <Popup>
              {r.image_url && <img src={r.image_url} width={180} />}
              <p><b>{r.pollution_type}</b> · {r.severity}</p>
              <p>{r.description}</p>
              <small>Status: {r.status}</small>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}