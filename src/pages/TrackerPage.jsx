import React, { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { getApplications, insertApplication, updateApplication, deleteApplication } from '../lib/supabase'

const STATUS_CONFIG = {
  applied:   { label: 'Applied',   color: 'var(--info)',    dim: 'var(--info-dim)' },
  screening: { label: 'Screening', color: 'var(--warning)', dim: 'var(--warning-dim)' },
  interview: { label: 'Interview', color: 'var(--accent)',  dim: 'var(--accent-dim)' },
  offer:     { label: 'Offer',     color: 'var(--success)', dim: 'var(--success-dim)' },
  rejected:  { label: 'Rejected',  color: 'var(--danger)',  dim: 'var(--danger-dim)' },
  withdrawn: { label: 'Withdrawn', color: 'var(--text-muted)', dim: 'rgba(85,85,85,0.15)' },
}

const RISK_CONFIG = {
  low:    { label: 'Low',    color: 'var(--success)' },
  medium: { label: 'Med ⚠️', color: 'var(--warning)' },
  high:   { label: 'High 🚩', color: 'var(--danger)' },
}

const EMPTY_FORM = { company: '', role: '', location: '', applied_date: new Date().toISOString().split('T')[0], status: 'applied', fit_score: '', pay_range: '', remote_risk: '', notes: '', job_url: '', contact: '' }

function Input({ label, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</label>
      <input {...props} onFocus={e => { setFocused(true); props.onFocus?.(e) }} onBlur={e => { setFocused(false); props.onBlur?.(e) }}
        style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${focused ? 'var(--accent)' : 'var(--border-strong)'}`, borderRadius: 8, fontSize: 13, color: 'var(--text)', outline: 'none', transition: 'border-color 0.15s', ...props.style }} />
    </div>
  )
}

function Select({ label, children, ...props }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</label>
      <select {...props} style={{ width: '100%', padding: '9px 12px', background: 'var(--bg)', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 13, color: 'var(--text)', outline: 'none', appearance: 'none', cursor: 'pointer', ...props.style }}>
        {children}
      </select>
    </div>
  )
}

function Textarea({ label, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</label>
      <textarea {...props} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${focused ? 'var(--accent)' : 'var(--border-strong)'}`, borderRadius: 8, fontSize: 13, color: 'var(--text)', outline: 'none', resize: 'vertical', minHeight: 80, fontFamily: 'var(--font)', transition: 'border-color 0.15s', ...props.style }} />
    </div>
  )
}

function AppForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.company.trim() || !form.role.trim()) return
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="form-grid">
        <Input label="Company *" value={form.company} onChange={e => set('company', e.target.value)} placeholder="e.g. Notion" required />
        <Input label="Role title *" value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. SDR – APAC" required />
        <Input label="Location / remote" value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Remote (US)" />
        <Input label="Applied date" type="date" value={form.applied_date} onChange={e => set('applied_date', e.target.value)} />
        <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </Select>
        <Input label="Fit score (1–10)" type="number" min="1" max="10" value={form.fit_score} onChange={e => set('fit_score', e.target.value)} placeholder="e.g. 8" />
        <Input label="Pay range (USD/EUR)" value={form.pay_range} onChange={e => set('pay_range', e.target.value)} placeholder="e.g. $60–80k" />
        <Select label="Remote-from-Indonesia risk" value={form.remote_risk} onChange={e => set('remote_risk', e.target.value)}>
          <option value="">Not set</option>
          <option value="low">Low — explicitly remote-friendly</option>
          <option value="medium">Medium — unclear geography</option>
          <option value="high">High — likely US/EU only</option>
        </Select>
        <Input label="Job posting URL" type="url" value={form.job_url} onChange={e => set('job_url', e.target.value)} placeholder="https://..." />
        <Input label="Contact (recruiter/HM)" value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="Name or LinkedIn URL" />
      </div>
      <Textarea label="Notes / gaps / next steps" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Key gaps, follow-up actions, referrals, objections..." />
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
        <button type="button" onClick={onCancel} style={{ padding: '9px 20px', background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
        <button type="submit" disabled={loading} style={{ padding: '9px 20px', background: 'var(--accent)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, color: 'var(--accent-text)', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Saving...' : 'Save application'}
        </button>
      </div>
      <style>{`@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr !important; } }`}</style>
    </form>
  )
}

export default function TrackerPage() {
  const { user } = useAuth()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterRisk, setFilterRisk] = useState('')

  useEffect(() => {
    if (user) load()
  }, [user])

  const load = async () => {
    const { data } = await getApplications(user.id)
    setApps(data || [])
    setLoading(false)
  }

  const handleSave = async (form) => {
    setSaving(true)
    try {
      if (editing) {
        const { data } = await updateApplication(editing.id, { ...form, user_id: user.id })
        setApps(prev => prev.map(a => a.id === editing.id ? data : a))
      } else {
        const { data } = await insertApplication({ ...form, user_id: user.id })
        setApps(prev => [data, ...prev])
      }
      setShowForm(false)
      setEditing(null)
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this application?')) return
    await deleteApplication(id)
    setApps(prev => prev.filter(a => a.id !== id))
  }

  const filtered = apps.filter(a => {
    const s = search.toLowerCase()
    const matchSearch = !s || a.company?.toLowerCase().includes(s) || a.role?.toLowerCase().includes(s)
    const matchStatus = !filterStatus || a.status === filterStatus
    const matchRisk = !filterRisk || a.remote_risk === filterRisk
    return matchSearch && matchStatus && matchRisk
  })

  if (loading) return <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>loading...</div>

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500 }}>Applications</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>{apps.length} total · {apps.filter(a => ['applied','screening','interview'].includes(a.status)).length} active</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null) }} style={{ padding: '9px 18px', background: 'var(--accent)', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 500, color: 'var(--accent-text)', cursor: 'pointer' }}>
          + Add application
        </button>
      </div>

      {/* Form panel */}
      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: '1.25rem', color: 'var(--text)' }}>{editing ? 'Edit application' : 'New application'}</div>
          <AppForm initial={editing || undefined} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null) }} loading={saving} />
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company or role…"
          style={{ flex: 1, minWidth: 160, padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text)', outline: 'none' }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text)', cursor: 'pointer' }}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}
          style={{ padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text)', cursor: 'pointer' }}>
          <option value="">All risk levels</option>
          <option value="low">Low risk</option>
          <option value="medium">Medium risk</option>
          <option value="high">High risk</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontSize: 14 }}>
          {apps.length === 0 ? 'No applications yet. Add your first one!' : 'No results match your filters.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(app => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied
            const risk = app.remote_risk ? RISK_CONFIG[app.remote_risk] : null
            return (
              <div key={app.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 500 }}>{app.company}</span>
                    {app.job_url && <a href={app.job_url} target="_blank" rel="noopener" style={{ fontSize: 11, color: 'var(--accent)' }}>↗</a>}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{app.role}{app.location ? ` · ${app.location}` : ''}</div>
                  {app.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>{app.notes}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
                  {app.applied_date && <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{app.applied_date?.slice(5)}</span>}
                  {app.fit_score && <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 500, color: app.fit_score >= 8 ? 'var(--success)' : app.fit_score >= 6 ? 'var(--warning)' : 'var(--danger)' }}>{app.fit_score}/10</span>}
                  {app.pay_range && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{app.pay_range}</span>}
                  {risk && <span style={{ fontSize: 11, color: risk.color, fontWeight: 500 }}>{risk.label}</span>}
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: cfg.dim, color: cfg.color }}>{cfg.label}</span>
                  <button onClick={() => { setEditing(app); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, padding: '4px 6px', borderRadius: 6 }}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--text)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>✏️</button>
                  <button onClick={() => handleDelete(app.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, padding: '4px 6px', borderRadius: 6 }}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--danger)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>🗑</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
