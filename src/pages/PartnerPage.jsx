import React, { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase, getFriends } from '../lib/supabase'

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

export default function PartnerPage() {
  const { user } = useAuth()
  const [friends, setFriends] = useState([])
  const [selected, setSelected] = useState(null)
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingApps, setLoadingApps] = useState(false)

  useEffect(() => {
    if (!user) return
    getFriends(user.id).then(({ data }) => {
      const accepted = (data || []).filter(f => f && f.status === 'accepted')
      setFriends(accepted)
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

  const getFriendProfile = (f) => f.from_user_id === user.id ? f.to_profile : f.from_profile
  const getInitials = (name) => (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const partner = friends.find(f => {
    const p = getFriendProfile(f)
    return p?.id === selected
  })
  const partnerProfile = partner ? getFriendProfile(partner) : null

  const active = apps.filter(a => ['applied','screening','interview'].includes(a.status))
  const interviews = apps.filter(a => a.status === 'interview')
  const offers = apps.filter(a => a.status === 'offer')

  if (loading) return <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>loading...</div>

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Partner's view</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>See your connected friends' job search progress</p>
      </div>

      {friends.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>No friends connected yet</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 360, margin: '0 auto' }}>
            Go to Friends page to add someone by email. Once they accept, their tracker will appear here.
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {friends.map(f => {
              const p = getFriendProfile(f)
              const isSelected = selected === p?.id
              return (
                <button key={f.id} onClick={() => loadPartnerApps(p.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: isSelected ? 'var(--accent-dim)' : 'var(--bg-card)', border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 12, cursor: 'pointer' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: isSelected ? 'var(--accent)' : 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: isSelected ? 'var(--accent-text)' : 'var(--text-secondary)' }}>{getInitials(p?.name)}</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: isSelected ? 'var(--accent)' : 'var(--text)' }}>{p?.name || 'Unknown'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p?.email}</div>
                  </div>
                </button>
              )
            })}
          </div>

          {selected && (loadingApps ? (
            <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>loading...</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: '1.25rem' }}>
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

              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.04em' }}>
                  {partnerProfile?.name?.toUpperCase()}'S APPLICATIONS
                </div>
                {apps.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: 13 }}>No applications added yet.</div>
                ) : apps.map(app => {
                  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied
                  const fit = app.fit_score_decimal || app.fit_score
                  return (
                    <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.company}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.role}{app.location ? ` · ${app.location}` : ''}</div>
                      </div>
                      {fit && <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: fit >= 8 ? 'var(--success)' : fit >= 6 ? 'var(--warning)' : 'var(--danger)', fontWeight: 500 }}>{fit}/10</span>}
                      {app.applied_date && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{app.applied_date?.slice(5)}</span>}
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: cfg.dim, color: cfg.color, whiteSpace: 'nowrap' }}>{cfg.label}</span>
                    </div>
                  )
                })}
              </div>
            </>
          ))}
        </>
      )}
    </div>
  )
}
