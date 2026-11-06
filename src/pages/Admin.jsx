import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'

export default function Admin() {
  const { profile } = useAuth()
  const [reports, setReports] = useState([])

  async function load() {
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false })
    setReports(data || [])
  }
  useEffect(() => { load() }, [])

  async function update(id, fields) {
    const { error } = await supabase.from('reports').update(fields).eq('id', id)
    if (error) alert(error.message)
    else load()
  }

  if (profile && profile.role !== 'admin') return <Navigate to="/" />

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin: manage reports</h2>
      {reports.map(r => (
        <div key={r.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10, display: 'flex', gap: 12 }}>
          {r.image_url && <img src={r.image_url} width={120} />}
          <div style={{ flex: 1 }}>
            <b>{r.pollution_type}</b> · {r.severity} · <i>{r.verification}</i> · {r.status}
            <p>{r.description}</p>
            {r.verification === 'pending' && (
              <>
                <button onClick={() => update(r.id, { verification: 'approved' })}>Approve</button>{' '}
                <button onClick={() => update(r.id, { verification: 'rejected' })}>Reject</button>
              </>
            )}
            {r.verification === 'approved' && (
              <>
                <button onClick={() => update(r.id, { status: 'scheduled' })}>Mark scheduled</button>{' '}
                <button onClick={() => update(r.id, { status: 'cleaned' })}>Mark cleaned</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}