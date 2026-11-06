import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'

const BADGES = [
  { name: 'Water Guardian', desc: '1 approved report', test: s => s.reports >= 1 },
  { name: 'River Guardian', desc: '5 approved reports', test: s => s.reports >= 5 },
  { name: 'Pollution Hunter', desc: '3 high-severity reports', test: s => s.high >= 3 },
  { name: 'River Rescuer', desc: 'Joined 1 cleanup drive', test: s => s.events >= 1 },
  { name: 'Eco Hero', desc: 'Joined 3 cleanup drives', test: s => s.events >= 3 },
]

export default function Badges() {
  const { session } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const uid = session.user.id
    async function load() {
      const { data: reps } = await supabase.from('reports').select('severity')
        .eq('user_id', uid).eq('verification', 'approved')
      const { count } = await supabase.from('event_participants')
        .select('*', { count: 'exact', head: true }).eq('user_id', uid)
      setStats({
        reports: reps?.length || 0,
        high: (reps || []).filter(r => r.severity === 'high').length,
        events: count || 0,
      })
    }
    load()
  }, [])

  if (!stats) return <p style={{ padding: 20 }}>Loading...</p>

  return (
    <div style={{ padding: 20 }}>
      <h2>My badges</h2>
      <p>{stats.reports} approved reports · {stats.events} drives joined</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {BADGES.map(b => {
          const earned = b.test(stats)
          return (
            <div key={b.name} style={{
              border: '1px solid #ccc', borderRadius: 8, padding: 16, width: 160,
              opacity: earned ? 1 : 0.35, textAlign: 'center',
            }}>
              <div style={{ fontSize: 36 }}>{earned ? '🏅' : '🔒'}</div>
              <b>{b.name}</b>
              <div style={{ fontSize: 12 }}>{b.desc}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}