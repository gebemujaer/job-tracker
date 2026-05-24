import React, { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

const STATUS_CONFIG = {
  applied:   { label: 'Applied',   color: 'var(--info)',    dim: 'var(--info-dim)' },
  screening: { label: 'Screening', color: 'var(--warning)', dim: 'var(--warning-dim)' },
  interview: { label: 'Interview', color: 'var(--accent)',  dim: 'var(--accent-dim)' },
  offer:     { label: 'Offer',     color: 'var(--success)', dim: 'var(--success-dim)' },
  rejected:  { label: 'Rejected',  color: 'var(--danger)',  dim: 'var(--danger-dim)' },
  withdrawn: { label: 'Withdrawn', color: 'var(--text-muted)', dim: 'rgba(85,85,85,0.15)' },
}

export default function PartnerPage() {
  const { user } = useAuth()
  const [partners, setPartners] = useState([])
  const [selected, setSelected] = useState(null)
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingApps, setLoadingApps] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('id, name, email').neq('id', user.id).then(({ data }) => {
      setPartners(data || [])
      setLoading(false)
    })
  }, [user])

  const loadPartnerApps = async (partnerId) => {
    setLoadingApps(true)
    setSelected(partnerId)
    const { data } = await supabase.from('applications').select('*').eq('user_id', partnerId).order('created_at', { ascending: false })
    setApps(data || [])
    setLoadingApps(false)
  }

  const partner = partners.find(p => p.id === selected)
  const active = apps.filter(a => ['applied','screening','interview'].includes(a.status))
  const interviews = apps.filter(a => a.status === 'interview')
  const offers = apps.filter(a => a.status === 'offer')

  if (loading) return <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>loading...</div>

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Partner's view</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>See your partner's job search progress</p>
      </div>

      {partners.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>No other users yet</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto' }}>
            Your partner needs to create an account using the same app. Once they sign up, their profile will appear here.
          </div>
        </div>
      ) : (
        <>
          {/* Partner selector */}
          <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {partners.map(p => {
              const initials = p.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
              const isSelected = selected === p.id
              return (
                <button key={p.id} onClick={() => loadPartnerApps(p.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: isSelected ? 'var(--accent-dim)' : 'var(--bg-card)', border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: isSelected ? 'var(--accent)' : 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: isSelected ? 'var(--accent-text)' : 'var(--text-secondary)' }}>{initials}</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: isSelected ? 'var(--accent)' : 'var(--text)' }}>{p.name || 'Unknown'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.email}</div>
                  </div>
                </button>
              )
            })}
          </div>

          {selected && (
            loadingApps ? (
              <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>loading...</div>
            ) : (
              <>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: '1.25rem' }}>
                  {[
                    { label: 'TOTAL APPS', value: apps.length },
                    { label: 'ACTIVE', value: active.length, color: 'var(--accent)' },
                    { label: 'INTERVIEWS', value: interviews.length, color: 'var(--info)' },
                    { label: 'OFFERS', value: offers.length, color: 'var(--success)' },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.25rem' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.04em', marginBottom: 6 }}>{s.label}</div>
                      <div style={{ fontSize: 28, fontWeight: 500, color: s.color || 'var(--text)' }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Apps list */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.04em' }}>
                    {partner?.name?.toUpperCase()}'S APPLICATIONS
                  </div>
                  {apps.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: 13 }}>No applications added yet.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {apps.map(app => {
                        const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied
                        return (
                          <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.company}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.role}{app.location ? ` · ${app.location}` : ''}</div>
                            </div>
                            {app.fit_score && <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: app.fit_score >= 8 ? 'var(--success)' : app.fit_score >= 6 ? 'var(--warning)' : 'var(--danger)', fontWeight: 500 }}>{app.fit_score}/10</span>}
                            {app.applied_date && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{app.applied_date?.slice(5)}</span>}
                            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: cfg.dim, color: cfg.color, whiteSpace: 'nowrap' }}>{cfg.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            )
          )}
        </>
      )}
    </div>
  )
}
