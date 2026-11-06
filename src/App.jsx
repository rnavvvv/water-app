import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Login from './pages/Login'
import NewReport from './pages/NewReport'
import MapView from './pages/MapView'
import Admin from './pages/Admin'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import Badges from './pages/Badges'
import Navbar from './components/Navbar'

function Protected({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <p>Loading...</p>
  return session ? <><Navbar />{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><MapView /></Protected>} />
      <Route path="/report" element={<Protected><NewReport /></Protected>} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/events" element={<Protected><Events /></Protected>} />
      <Route path="/badges" element={<Protected><Badges /></Protected>} />
      <Route path="/admin" element={<Protected><Admin /></Protected>} />
    </Routes>
  )
}