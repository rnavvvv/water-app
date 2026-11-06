import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, useMapEvents, useMap } from 'react-leaflet'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'

function ClickPicker({ position, setPosition }) {
  useMapEvents({ click: e => setPosition([e.latlng.lat, e.latlng.lng]) })
  return position ? <CircleMarker center={position} radius={10} /> : null
}

function FlyTo({ position }) {
  const map = useMap()
  if (position) map.setView(position, 15)
  return null
}

export default function NewReport() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [position, setPosition] = useState(null)
  const [description, setDescription] = useState('')
  const [type, setType] = useState('plastic')
  const [severity, setSeverity] = useState('medium')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function useMyLocation() {
    navigator.geolocation.getCurrentPosition(
      p => setPosition([p.coords.latitude, p.coords.longitude]),
      () => setError('Could not get location. Click on the map instead.')
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!position) return setError('Pick a location first.')
    setBusy(true)

    let image_url = null
    if (file) {
      const path = `${session.user.id}/${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('report-images').upload(path, file)
      if (upErr) { setBusy(false); return setError(upErr.message) }
      image_url = supabase.storage.from('report-images').getPublicUrl(path).data.publicUrl
    }

    const { error: insErr } = await supabase.from('reports').insert({
      user_id: session.user.id,
      description,
      pollution_type: type,
      severity,
      image_url,
      lat: position[0],
      lng: position[1],
    })
    setBusy(false)
    if (insErr) setError(insErr.message)
    else navigate('/')
  }

  return (
    <div style={{ maxWidth: 600, margin: '20px auto', padding: 12 }}>
      <h2>Report water pollution</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
        <textarea placeholder="Describe what you see" value={description}
          onChange={e => setDescription(e.target.value)} required />
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="plastic">Plastic waste</option>
          <option value="industrial">Industrial waste</option>
          <option value="sewage">Sewage</option>
          <option value="oil_spill">Oil spill</option>
          <option value="other">Other</option>
        </select>
        <select value={severity} onChange={e => setSeverity(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
        <button type="button" onClick={useMyLocation}>Use my location</button>
        <MapContainer center={[13.0827, 80.2707]} zoom={11} style={{ height: 300 }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          <ClickPicker position={position} setPosition={setPosition} />
          <FlyTo position={position} />
        </MapContainer>
        <small>{position ? `Selected: ${position[0].toFixed(5)}, ${position[1].toFixed(5)}` : 'Click the map to set location'}</small>
        <button type="submit" disabled={busy}>{busy ? 'Submitting...' : 'Submit report'}</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}