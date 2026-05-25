import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { ROLES, COUNTRIES } from '../lib/roles'

export default function OnboardingPage() {
  const { user, refetchProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState(null)
  const [country, setCountry] = useState('')
  const [saving, setSaving] = useState(false)

  const handleFinish = async () => {
    if (!selectedRole) return
    setSaving(true)
    await supabase.from('profiles').update({
      job_role: selectedRole,
      location_country: country || null,
      onboarded: true,
    }).eq('id', user.id)
    await refetchProfile()
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 680 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: 12 }}>JOB TRACKER</div>
          <h1 style={{ fontSize: 28, fontWeight: 500, marginBottom: 10 }}>
            {step === 1 ? 'What kind of roles are you applying for?' : 'Where are you based?'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {step === 1 ? 'We\'ll load relevant gap tags and tips for your job search.' : 'This helps personalize the remote work risk guidance for you.'}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: '2rem' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ width: 32, height: 4, borderRadius: 2, background: s <= step ? 'var(--accent)' : 'var(--border-strong)' }} />
          ))}
        </div>

        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {ROLES.map(role => (
              <button key={role.id} onClick={() => setSelectedRole(role.id)}
                style={{
                  padding: '1rem', background: selectedRole === role.id ? 'var(--accent-dim)' : 'var(--bg-card)',
                  border: `1px solid ${selectedRole === role.id ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{role.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: selectedRole === role.id ? 'var(--accent)' : 'var(--text)', marginBottom: 4 }}>{role.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{role.description}</div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Your country</label>
            <select value={country} onChange={e => setCountry(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 10, fontSize: 15, color: 'var(--text)', outline: 'none', marginBottom: 12 }}>
              <option value="">Select your country...</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              This personalizes the "Remote work risk" guidance. For example, if you're in Indonesia, we'll flag which roles are risky for non-US/EU applicants.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', alignItems: 'center' }}>
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 9, fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer' }}>Back</button>
          ) : (
            <button onClick={() => navigate('/')} style={{ padding: '10px 20px', background: 'transparent', border: 'none', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>Skip for now</button>
          )}
          {step === 1 ? (
            <button onClick={() => setStep(2)} disabled={!selectedRole}
              style={{ padding: '10px 28px', background: selectedRole ? 'var(--accent)' : 'var(--bg-hover)', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 500, color: selectedRole ? 'var(--accent-text)' : 'var(--text-muted)', cursor: selectedRole ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}>
              Continue →
            </button>
          ) : (
            <button onClick={handleFinish} disabled={saving}
              style={{ padding: '10px 28px', background: 'var(--accent)', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 500, color: 'var(--accent-text)', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Get started →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
