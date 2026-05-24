import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp, supabase } from '../lib/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/')
      } else {
        if (!name.trim()) throw new Error('Please enter your name')
        const { data, error } = await signUp(email, password, name)
        if (error) throw error
        if (data.user) {
          await supabase.from('profiles').upsert({ id: data.user.id, name: name.trim(), email })
          navigate('/')
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border-strong)', borderRadius: 10, fontSize: 14,
    color: 'var(--text)', outline: 'none', transition: 'border-color 0.15s',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: 12 }}>JOB TRACKER</div>
          <h1 style={{ fontSize: 26, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {mode === 'signin' ? 'Sign in to your tracker' : 'Start tracking your applications'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Your name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Gabriel" style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
              />
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
            />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: 'var(--danger-dim)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            padding: '12px', background: 'var(--accent)', border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 500, color: 'var(--accent-text)', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s', marginTop: 4,
          }}>
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/* Toggle */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 13, color: 'var(--text-secondary)' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
