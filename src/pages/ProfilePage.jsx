import React, { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { updateProfile, supabase } from '../lib/supabase'
import { ROLES, COUNTRIES } from '../lib/roles'

export default function ProfilePage() {
  const { user, profile, refetchProfile } = useAuth()
  const [name, setName] = useState(profile?.name || '')
  const [jobRole, setJobRole] = useState(profile?.job_role || '')
  const [country, setCountry] = useState(profile?.location_country || '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [pwForm, setPwForm] = useState({ next: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [pwMsg, setPwMsg] = useState('')

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    await updateProfile(user.id, { name: name.trim(), job_role: jobRole || null, location_country: country || null })
    await refetchProfile()
    setMsg('Profile updated!')
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const changePassword = async (e) => {
    e.preventDefault()
    if (pwForm.next !== pwForm.confirm) { setPwMsg('Passwords do not match'); return }
    if (pwForm.next.length < 6) { setPwMsg('At least 6 characters required'); return }
    const { error } = await supabase.auth.updateUser({ password: pwForm.next })
    if (error) { setPwMsg(error.message); return }
    setPwMsg('Password updated!')
    setPwForm({ next: '', confirm: '' })
    setTimeout(() => setPwMsg(''), 3000)
  }

  const initials = (profile?.name || user?.email || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const inputStyle = { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 14, color: 'var(--text)', outline: 'none' }
  const selectStyle = { width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 14, color: 'var(--text)', outline: 'none' }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Profile</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>Manage your account and job search preferences</p>
      </div>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem 1.5rem' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-dim)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 500, color: 'var(--accent)', flexShrink: 0 }}>{initials}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>{profile?.name || 'No name set'}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</div>
          {profile?.job_role && <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>{ROLES.find(r => r.id === profile.job_role)?.label || profile.job_role}</div>}
          {profile?.location_country && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {profile.location_country}</div>}
        </div>
      </div>

      {/* Edit profile */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: '1.25rem' }}>Profile settings</div>
        <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Display name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Job search focus</label>
            <select value={jobRole} onChange={e => setJobRole(e.target.value)} style={selectStyle}>
              <option value="">Not set</option>
              {ROLES.map(r => <option key={r.id} value={r.id}>{r.icon} {r.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Your country</label>
            <select value={country} onChange={e => setCountry(e.target.value)} style={selectStyle}>
              <option value="">Not set</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>Used to personalize remote work risk guidance</p>
          </div>
          {msg && <div style={{ fontSize: 13, color: 'var(--success)' }}>{msg}</div>}
          <button type="submit" disabled={saving} style={{ alignSelf: 'flex-start', padding: '9px 20px', background: 'var(--accent)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, color: 'var(--accent-text)', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: '1.25rem' }}>Change password</div>
        <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[{ key: 'next', label: 'New password' }, { key: 'confirm', label: 'Confirm password' }].map(({ key, label }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 500 }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={pwForm[key]} onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))} style={{ ...inputStyle, paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          ))}
          {pwMsg && <div style={{ fontSize: 13, color: pwMsg.includes('updated') ? 'var(--success)' : 'var(--danger)' }}>{pwMsg}</div>}
          <button type="submit" style={{ alignSelf: 'flex-start', padding: '9px 20px', background: 'var(--accent)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, color: 'var(--accent-text)', cursor: 'pointer' }}>
            Update password
          </button>
        </form>
      </div>
    </div>
  )
}
