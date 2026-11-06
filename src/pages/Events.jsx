import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'

export default function Events() {
  const { session, profile } = useAuth()
  const [events, setEvents] = useState([])
  const [myJoined, setMyJoined] = useState([])
  const [counts, setCounts] = useState({})
  const [reports, setReports] = useState([])
  const [reportId, setReportId] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [error, setError] = useState('')

  async function load() {
    const { data: ev } = await supabase
      .from('cleanup_events')
      .select('*, reports(pollution_type, description)')
      .order('event_date')
    setEvents(ev || [])

    const { data: parts } = await supabase.from('event_participants').select('*')
    const c = {}
    ;(parts || []).forEach(p => { c[p.event_id] = (c[p.event_id] || 0) + 1 })
    setCounts(c)
    setMyJoined((parts || []).filter(p => p.user_id === session.user.id).map(p => p.event_id))

    const { data: rep } = await supabase.from('reports').select('*')
      .eq('verification', 'approved').eq('status', 'polluted')
    setReports(rep || [])
    if (rep?.length && !reportId) setReportId(rep[0].id)
  }
  useEffect(() => { load() }, [])

  async function createEvent(e) {
    e.preventDefault()
    setError('')
    const { error: err } = await supabase.from('cleanup_events').insert({
      report_id: reportId, title, event_date: date, created_by: session.user.id,
    })
    if (err) return setError(err.message)
    await supabase.from('reports').update({ status: 'scheduled' }).eq('id', reportId)
    setTitle(''); setDate('')
    load()
  }

  async function join(eventId) {
    const { error: err } = await supabase.from('event_participants')
      .insert({ event_id: eventId, user_id: session.user.id })
    if (err) setError(err.message)
    else load()
  }

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      <h2>Cleanup drives</h2>

      {profile?.role === 'admin' && (
        <form onSubmit={createEvent} style={{ display: 'grid', gap: 8, marginBottom: 24, padding: 12, border: '1px solid #ccc' }}>
          <b>Create a cleanup drive</b>
          <select value={reportId} onChange={e => setReportId(e.target.value)} required>
            {reports.length === 0 && <option value="">No approved polluted reports</option>}
            {reports.map(r => (
              <option key={r.id} value={r.id}>{r.pollution_type} · {r.severity} · {r.description.slice(0, 40)}</option>
            ))}
          </select>
          <input placeholder="Event title" value={title} onChange={e => setTitle(e.target.value)} required />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          <button type="submit" disabled={!reportId}>Create drive</button>
        </form>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {events.length === 0 && <p>No drives scheduled yet.</p>}
      {events.map(ev => (
        <div key={ev.id} style={{ border: '1px solid #ccc', padding: 12, marginBottom: 10 }}>
          <b>{ev.title}</b> · {ev.event_date}
          <p>Site: {ev.reports?.pollution_type} · {ev.reports?.description}</p>
          <p>{counts[ev.id] || 0} volunteer(s) joined</p>
          {myJoined.includes(ev.id)
            ? <span>✅ You joined</span>
            : <button onClick={() => join(ev.id)}>Join drive</button>}
        </div>
      ))}
    </div>
  )
}