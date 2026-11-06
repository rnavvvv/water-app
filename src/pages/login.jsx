import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [isSignup, setIsSignup] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const { error } = isSignup
      ? await supabase.auth.signUp({ email, password, options: { data: { name } } })
      : await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else navigate('/')
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="logo">💧</div>
        <h2>WaterWatch</h2>
        <p className="tagline">Report. Verify. Clean our water bodies.</p>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          {isSignup && (
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit">{isSignup ? 'Create account' : 'Log in'}</button>
        </form>
        {error && <p className="error">{error}</p>}
        <p className="switch" onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? 'Have an account? Log in' : 'New here? Sign up'}
        </p>
      </div>
    </div>
  )
}