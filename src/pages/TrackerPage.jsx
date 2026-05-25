import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from '../lib/AuthContext'
import { getApplications, insertApplication, updateApplication, deleteApplication, supabase } from '../lib/supabase'
import TagInput from '../components/TagInput'

const STATUS_CONFIG = {
  applied:   { label: 'Applied',   color: 'var(--info)',    dim: 'var(--info-dim)' },
  screening: { label: 'Screening', color: 'var(--warning)', dim: 'var(--warning-dim)' },
  interview: { label: 'Interview', color: 'var(--accent)',  dim: 'var(--accent-dim)' },
  offer:     { label: 'Offer',     color: 'var(--success)', dim: 'var(--success-dim)' },
  rejected:  { label: 'Rejected',  color: 'var(--danger)',  dim: 'var(--danger-dim)' },
  ghosted:   { label: 'Ghosted',   color: 'var(--ghost)',   dim: 'var(--ghost-dim)' },
  mia:       { label: 'MIA',       color: 'var(--ghost)',   dim: 'var(--ghost-dim)' },
  withdrawn: { label: 'Withdrawn', color: 'var(--text-muted)', dim: 'rgba(85,85,85,0.15)' },
}
const RISK_CONFIG = {
  low:    { label: 'Low',  color: 'var(--success)' },
  medium: { label: 'Med',  color: 'var(--warning)' },
  high:   { label: 'High', color: 'var(--danger)' },
}
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'fit_high', label: 'Fit score ↓' },
  { value: 'company', label: 'Company A-Z' },
]
const STALE = 14
const EMPTY = {
  company: '', role: '', location: '',
  applied_date: new Date().toISOString().split('T')[0],
  follow_up_date: '', status: 'applied',
  fit_score_decimal: '', pay_range: '', remote_risk: '',
  notes: '', tags: [], job_url: '', contact: '',
  resume_label: '', cover_letter_label: ''
}

function days(d) { return d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : null }
function daysUntil(d) { return d ? Math.floor((new Date(d).getTime() - Date.now()) / 86400000) : null }

const iStyle = { width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 13, color: 'var(--text)', outline: 'none' }
const sStyle = { width: '100%', padding: '9px 12px', background: 'var(--bg)', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 13, color: 'var(--text)', outline: 'none' }
const lStyle = { display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5, letterSpacing: '0.06em', textTransform: 'uppercase' }

function NoteModal({ app, onClose }) {
  if (!app) return null
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1.5rem', maxWidth: 520, width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>{app.company}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{app.role}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{app.notes || 'No notes yet.'}</p>
        {app.tags?.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {app.tags.map(t => <span key={t} style={{ padding: '2px 8px', background: 'var(--accent-dim)', borderRadius: 20, fontSize: 11, color: 'var(--accent)' }}>{t}</span>)}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusDropdown({ current, onChange }) {
  const [open, setOpen] = useState(false)
  const cfg = STATUS_CONFIG[current] || STATUS_CONFIG.applied
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)}
        style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: cfg.dim, color: cfg.color, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
        {cfg.label} <span style={{ fontSize: 9, opacity: 0.7 }}>▾</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '110%', background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 10, zIndex: 50, minWidth: 130, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <button key={k} onClick={() => { onChange(k); setOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', background: k === current ? 'var(--bg-hover)' : 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: k === current ? v.color : 'var(--text-secondary)', textAlign: 'left' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: v.color, flexShrink: 0 }} />
              {v.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TrackerPage() {
  const { user, profile } = useAuth()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [search, setSearch] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fRisk, setFRisk] = useState('')
  const [sort, setSort] = useState('newest')
  const [noteApp, setNoteApp] = useState(null)
  const [docs, setDocs] = useState([])
  const [pastTags, setPastTags] = useState([])
  const [exportMsg, setExportMsg] = useState('')
  const [highlightId, setHighlightId] = useState(null)
  const formRef = useRef()
  const listRef = useRef()

  useEffect(() => {
    if (!user) return
    getApplications(user.id).then(({ data }) => { setApps((data || []).filter(Boolean)); setLoading(false) })
    supabase.from('docs').select('id,label,file_name,category').eq('user_id', user.id).in('category', ['Resume','Cover Letter']).then(({ data }) => setDocs(data || []))
    supabase.from('applications').select('tags').eq('user_id', user.id).then(({ data }) => {
      const all = (data || []).flatMap(a => Array.isArray(a?.tags) ? a.tags : [])
      setPastTags([...new Set(all)].filter(Boolean))
    })
  }, [user])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openAdd = () => {
    setForm({ ...EMPTY, applied_date: new Date().toISOString().split('T')[0] })
    setEditing(null)
    setShowForm(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const openEdit = (app) => {
    setForm({ ...EMPTY, ...app, tags: Array.isArray(app.tags) ? app.tags : [], fit_score_decimal: app.fit_score_decimal || app.fit_score || '', resume_label: app.resume_label || '', cover_letter_label: app.cover_letter_label || '' })
    setEditing(app)
    setShowForm(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.company?.trim() || !form.role?.trim()) return
    setSaving(true)
    setSaveMsg('')
    try {
      const payload = {
        ...form,
        tags: Array.isArray(form.tags) ? form.tags : [],
        fit_score_decimal: form.fit_score_decimal ? parseFloat(form.fit_score_decimal) : null,
        follow_up_date: form.follow_up_date || null,
        applied_date: form.applied_date || null,
        remote_risk: form.remote_risk || null,
        user_id: user.id
      }
      if (editing) {
        const { data } = await updateApplication(editing.id, payload)
        if (data) setApps(prev => prev.map(a => a?.id === editing.id ? data : a))
      } else {
        const { data } = await insertApplication(payload)
        if (data) {
          setApps(prev => [data, ...prev])
          setHighlightId(data.id)
          setTimeout(() => setHighlightId(null), 3000)
        }
      }
      setShowForm(false)
      setEditing(null)
      setSaveMsg('Saved!')
      setTimeout(() => setSaveMsg(''), 2000)
    } catch(err) {
      console.error('Save error:', err)
      setSaveMsg('Error saving — try again')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this application?')) return
    await deleteApplication(id)
    setApps(prev => prev.filter(a => a?.id !== id))
  }

  const handleStatusChange = async (id, status) => {
    await updateApplication(id, { status, remote_risk: apps.find(a => a.id === id)?.remote_risk || null })
    setApps(prev => prev.map(a => a?.id === id ? { ...a, status } : a))
  }

  const exportCSV = () => {
    const headers = ['Company','Role','Location','Applied','Status','Fit','Pay','Risk','Tags','Notes']
    const rows = apps.filter(Boolean).map(a => [a.company,a.role,a.location,a.applied_date,a.status,a.fit_score_decimal||a.fit_score,a.pay_range,a.remote_risk,Array.isArray(a.tags)?a.tags.join(';'):a.tags,a.notes].map(v => `"${(v||'').toString().replace(/"/g,'')}"`) )
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'applications.csv'; a.click()
    setExportMsg('Done!'); setTimeout(() => setExportMsg(''), 2000)
  }

  const safeApps = apps.filter(Boolean)
  const stale = safeApps.filter(a => a.status === 'applied' && days(a.applied_date) >= STALE)
  const followups = safeApps.filter(a => a.follow_up_date && daysUntil(a.follow_up_date) <= 2 && daysUntil(a.follow_up_date) >= -1 && !['rejected','ghosted','mia','withdrawn','offer'].includes(a.status))

  let filtered = safeApps.filter(a => {
    const s = search.toLowerCase()
    return (!s || a.company?.toLowerCase().includes(s) || a.role?.toLowerCase().includes(s) || (Array.isArray(a.tags) && a.tags.some(t => t?.toLowerCase().includes(s))))
      && (!fStatus || a.status === fStatus)
      && (!fRisk || a.remote_risk === fRisk)
  })
  filtered = [...filtered].sort((a, b) => {
    if (sort === 'newest') return new Date(b.created_at||0) - new Date(a.created_at||0)
    if (sort === 'oldest') return new Date(a.created_at||0) - new Date(b.created_at||0)
    if (sort === 'fit_high') return (b.fit_score_decimal||b.fit_score||0) - (a.fit_score_decimal||a.fit_score||0)
    if (sort === 'company') return (a.company||'').localeCompare(b.company||'')
    return 0
  })

  const resumes = docs.filter(d => d.category === 'Resume')
  const covers = docs.filter(d => d.category === 'Cover Letter')

  if (loading) return <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>loading...</div>

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <NoteModal app={noteApp} onClose={() => setNoteApp(null)} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500 }}>Applications</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
            {safeApps.length} total · {safeApps.filter(a => ['applied','screening','interview'].includes(a.status)).length} active
            {saveMsg && <span style={{ marginLeft: 12, color: saveMsg.includes('Error') ? 'var(--danger)' : 'var(--success)', fontWeight: 500 }}>{saveMsg}</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportCSV} style={{ padding: '9px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 9, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>{exportMsg || '↓ CSV'}</button>
          <button onClick={openAdd} style={{ padding: '9px 18px', background: 'var(--accent)', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 500, color: 'var(--accent-text)', cursor: 'pointer' }}>+ Add application</button>
        </div>
      </div>

      {/* Alerts */}
      {stale.length > 0 && (
        <div style={{ background: 'var(--ghost-dim)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ghost)', marginBottom: 8 }}>👻 {stale.length} likely ghosted ({STALE}+ days)</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {stale.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '5px 10px' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.company} · {days(a.applied_date)}d</span>
                <button onClick={() => handleStatusChange(a.id, 'ghosted')} style={{ fontSize: 11, background: 'var(--ghost-dim)', border: 'none', borderRadius: 4, color: 'var(--ghost)', cursor: 'pointer', padding: '2px 6px' }}>Mark ghosted</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {followups.length > 0 && (
        <div style={{ background: 'var(--warning-dim)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 12, padding: '0.75rem 1.25rem', marginBottom: '1rem', fontSize: 13, color: 'var(--warning)' }}>
          ⏰ Follow-up due: {followups.map(a => a.company).join(', ')}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div ref={formRef} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: '1.25rem' }}>{editing ? 'Edit application' : 'New application'}</div>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="form-grid">
              <div><label style={lStyle}>Company *</label><input value={form.company} onChange={e => set('company', e.target.value)} placeholder="e.g. Notion" style={iStyle} required /></div>
              <div><label style={lStyle}>Role *</label><input value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. SDR" style={iStyle} required /></div>
              <div><label style={lStyle}>Location</label><input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Remote (US)" style={iStyle} /></div>
              <div><label style={lStyle}>Applied date</label><input type="date" value={form.applied_date} onChange={e => set('applied_date', e.target.value)} style={iStyle} /></div>
              <div><label style={lStyle}>Follow-up date</label><input type="date" value={form.follow_up_date||''} onChange={e => set('follow_up_date', e.target.value)} style={iStyle} /></div>
              <div><label style={lStyle}>Status</label><select value={form.status} onChange={e => set('status', e.target.value)} style={sStyle}>{Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
              <div><label style={lStyle}>Fit score (1-10)</label><input type="number" step="0.1" min="1" max="10" value={form.fit_score_decimal} onChange={e => set('fit_score_decimal', e.target.value)} placeholder="e.g. 8.5" style={iStyle} /></div>
              <div><label style={lStyle}>Pay range</label><input value={form.pay_range} onChange={e => set('pay_range', e.target.value)} placeholder="e.g. $60-80k" style={iStyle} /></div>
              <div><label style={lStyle}>Remote work risk</label><select value={form.remote_risk} onChange={e => set('remote_risk', e.target.value)} style={sStyle}><option value="">Not set</option><option value="low">Low — remote friendly</option><option value="medium">Medium — unclear</option><option value="high">High — likely local only</option></select></div>
              <div><label style={lStyle}>Job URL</label><input type="url" value={form.job_url} onChange={e => set('job_url', e.target.value)} placeholder="https://..." style={iStyle} /></div>
              <div><label style={lStyle}>Contact</label><input value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="Name or LinkedIn" style={iStyle} /></div>
              <div><label style={lStyle}>Resume used</label><select value={form.resume_label} onChange={e => set('resume_label', e.target.value)} style={sStyle}><option value="">None</option>{resumes.map(d => <option key={d.id} value={d.label||d.file_name}>{d.label||d.file_name}</option>)}</select></div>
              <div><label style={lStyle}>Cover letter used</label><select value={form.cover_letter_label} onChange={e => set('cover_letter_label', e.target.value)} style={sStyle}><option value="">None</option>{covers.map(d => <option key={d.id} value={d.label||d.file_name}>{d.label||d.file_name}</option>)}</select></div>
            </div>
            <TagInput value={form.tags} onChange={tags => set('tags', tags)} pastTags={pastTags} userRole={profile?.job_role} />
            <div><label style={lStyle}>Notes</label><textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Key gaps, follow-up actions..." style={{ ...iStyle, minHeight: 72, resize: 'vertical' }} /></div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} style={{ padding: '9px 20px', background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ padding: '9px 24px', background: 'var(--accent)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, color: 'var(--accent-text)', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.8 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                {saving ? <><span style={{ width: 12, height: 12, border: '2px solid var(--accent-text)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />Saving...</> : 'Save'}
              </button>
            </div>
          </form>
          <style>{`@media(max-width:600px){.form-grid{grid-template-columns:1fr!important}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company, role, or tag..." style={{ flex: 1, minWidth: 150, padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text)', outline: 'none' }} />
        <select value={fStatus} onChange={e => setFStatus(e.target.value)} style={{ padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text)', cursor: 'pointer' }}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={fRisk} onChange={e => setFRisk(e.target.value)} style={{ padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text)', cursor: 'pointer' }}>
          <option value="">All risk</option>
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text)', cursor: 'pointer' }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          {safeApps.length === 0 ? (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>No applications yet</div>
              <div style={{ fontSize: 13, marginBottom: 20 }}>Start tracking your job search by adding your first application.</div>
              <button onClick={openAdd} style={{ padding: '10px 24px', background: 'var(--accent)', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 500, color: 'var(--accent-text)', cursor: 'pointer' }}>Add your first application</button>
            </>
          ) : (
            <div style={{ fontSize: 14 }}>No results match your filters.</div>
          )}
        </div>
      )}

      {/* Application list */}
      <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map(app => {
          if (!app) return null
          const fit = app.fit_score_decimal || app.fit_score
          const risk = app.remote_risk ? RISK_CONFIG[app.remote_risk] : null
          const isStale = app.status === 'applied' && days(app.applied_date) >= STALE
          const isNew = highlightId === app.id
          return (
            <div key={app.id} style={{
              background: isNew ? 'rgba(212,245,122,0.06)' : 'var(--bg-card)',
              border: `1px solid ${isNew ? 'rgba(212,245,122,0.3)' : isStale ? 'rgba(167,139,250,0.2)' : 'var(--border)'}`,
              borderRadius: 12, padding: '0.9rem 1.25rem',
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
              transition: 'border-color 0.3s, background 0.3s',
            }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{app.company}</span>
                  {app.job_url && <a href={app.job_url} target="_blank" rel="noopener" style={{ fontSize: 11, color: 'var(--accent)' }}>↗</a>}
                  {isStale && <span style={{ fontSize: 10, color: 'var(--ghost)', background: 'var(--ghost-dim)', padding: '1px 6px', borderRadius: 10 }}>👻 {days(app.applied_date)}d</span>}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{app.role}{app.location ? ` · ${app.location}` : ''}</div>
                {app.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
                    {app.tags.map(t => <span key={t} style={{ fontSize: 10, padding: '1px 7px', background: 'var(--accent-dim)', borderRadius: 20, color: 'var(--accent)' }}>{t}</span>)}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
                {app.applied_date && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{app.applied_date?.slice(5)}</span>}
                {fit && <span style={{ fontSize: 12, fontWeight: 500, color: Number(fit) >= 8 ? 'var(--success)' : Number(fit) >= 6 ? 'var(--warning)' : 'var(--danger)' }}>{fit}/10</span>}
                {risk && <span style={{ fontSize: 11, color: risk.color, fontWeight: 500 }}>{risk.label}</span>}
                <StatusDropdown current={app.status} onChange={(s) => handleStatusChange(app.id, s)} />
                <button onClick={() => setNoteApp(app)} title="View notes"
                  style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, padding: '3px 8px', borderRadius: 6 }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>📝</button>
                <button onClick={() => openEdit(app)} title="Edit"
                  style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, padding: '3px 8px', borderRadius: 6 }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--info)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>✏️</button>
                <button onClick={() => handleDelete(app.id)} title="Delete"
                  style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, padding: '3px 8px', borderRadius: 6 }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)' }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>🗑</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
