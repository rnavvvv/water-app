import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '../supabaseClient'

function Card({ label, value }) {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, minWidth: 140 }}>
      <div style={{ fontSize: 28, fontWeight: 'bold' }}>{value}</div>
      <div>{label}</div>
    </div>
  )
}

function countBy(list, key) {
  const counts = {}
  list.forEach(r => { counts[r[key]] = (counts[r[key]] || 0) + 1 })
  return Object.entries(counts).map(([name, count]) => ({ name, count }))
}

export default function Dashboard() {
  const [reports, setReports] = useState([])

  useEffect(() => {
    supabase.from('reports').select('*').eq('verification', 'approved')
      .then(({ data }) => setReports(data || []))
  }, [])

  const by = s => reports.filter(r => r.status === s).length

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <Card label="Total reports" value={reports.length} />
        <Card label="Polluted" value={by('polluted')} />
        <Card label="Scheduled" value={by('scheduled')} />
        <Card label="Cleaned" value={by('cleaned')} />
      </div>

      <h3>Reports by pollution type</h3>
      <div style={{ height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={countBy(reports, 'pollution_type')}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip isAnimationActive={false} cursor={{ fill: 'rgba(14, 124, 134, 0.08)' }} />
            <Bar dataKey="count" fill="#2a9d8f" barSize={60} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3>Reports by severity</h3>
      <div style={{ height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={countBy(reports, 'severity')}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip isAnimationActive={false} cursor={{ fill: 'rgba(231, 111, 81, 0.08)' }} />
            <Bar dataKey="count" fill="#e76f51" barSize={60} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3>Recent reports</h3>
      {reports.slice().sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5).map(r => (
        <div key={r.id} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'center' }}>
          {r.image_url && <img src={r.image_url} width={60} />}
          <span><b>{r.pollution_type}</b> · {r.severity} · {r.status} · {new Date(r.created_at).toLocaleDateString()}</span>
        </div>
      ))}
    </div>
  )
}