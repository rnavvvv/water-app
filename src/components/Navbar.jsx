import { NavLink } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Navbar() {
  const { profile, signOut } = useAuth()
  return (
    <nav className="nav">
      <span className="brand">💧 WaterWatch</span>
      <NavLink to="/" end>Map</NavLink>
      <NavLink to="/report">Report</NavLink>
      <NavLink to="/dashboard">Dashboard</NavLink>
      <NavLink to="/events">Drives</NavLink>
      <NavLink to="/badges">Badges</NavLink>
      {profile?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
      <span className="user">{profile?.name} ({profile?.role})</span>
      <button onClick={signOut}>Log out</button>
    </nav>
  )
}