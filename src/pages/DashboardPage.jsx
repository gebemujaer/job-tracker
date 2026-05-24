import React, { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { getApplications } from '../lib/supabase'
import { Link } from 'react-router-dom'

const STATUS_CONFIG = {
  applied:    { label: 'Applied',    color: 'var(--info)',    dim: 'var(--info-dim)' },
  screening:  { label: 'Screening',  color: 'var(--warning)', dim: 'var(--warning-dim)' },
  interview:  { label: 'Interview',  color: 'var(--accent)',  dim: 'var(--accent-dim)' },
  offer:      { label: 'Offer',      color: 'var(--success)', dim: 'var(--success-dim)' },
  rejected:   { label: 'Rejected',   color: 'var(--danger)',  dim: 'var(--danger-dim)' },
  withdrawn:  { label: 'Withdrawn',  color: 'var(--text-muted)', dim: 'rgba(85,85,85,0.15)' },
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem 1.5rem' }}>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 8, letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 500, color: color || 'var(--text)', lineHeight: 1, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}

function PipelineBar({ apps }) {
  const total = apps.length || 1
  const statuses = ['applied', 'screening', 'interview', 'offer']
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '1.25rem', letterSpacing: '0.04em' }}>PIPELINE</div>
      <div style={{ display: 'flex', gap: 3, height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: '1rem' }}>
        {statuses.map(s => {
          const count = apps.filter(a => a.status === s).length
          const pct = (count / total) * 100
          return pct > 0 ? <div key={s} style={{ flex: pct, background: STATUS_CONFIG[s].color, minWidth: 4 }} /> : null
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10 }}>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = apps.filter(a => a.status === key).length
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cfg.label}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginLeft: 'auto' }}>{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RecentApps({ apps }) {
  const recent = apps.slice(0, 5)
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>RECENT APPLICATIONS</div>
        <Link to="/tracker" style={{ fontSize: 12, color: 'var(--accent)' }}>View all →</Link>
      </div>
      {recent.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: 13 }}>
          No applications yet.<br />
          <Link to="/tracker" style={{ color: 'var(--accent)', marginTop: 6, display: 'inline-block' }}>Add your first one →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {recent.map(app => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied
            return (
              <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.company}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.role}</div>
                </div>
                {app.fit_score && (
                  <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: app.fit_score >= 8 ? 'var(--success)' : app.fit_score >= 6 ? 'var(--warning)' : 'var(--danger)' }}>
                    {app.fit_score}/10
                  </div>
                )}
                <div style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: cfg.dim, color: cfg.color, whiteSpace: 'nowrap' }}>
                  {cfg.label}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      getApplications(user.id).then(({ data }) => {
        setApps(data || [])
        setLoading(false)
      })
    }
  }, [user])

  const active = apps.filter(a => ['applied', 'screening', 'interview'].includes(a.status))
  const interviews = apps.filter(a => a.status === 'interview')
  const offers = apps.filter(a => a.status === 'offer')
  const avgFit = apps.filter(a => a.fit_score).length > 0
    ? (apps.filter(a => a.fit_score).reduce((s, a) => s + Number(a.fit_score), 0) / apps.filter(a => a.fit_score).length).toFixed(1)
    : '—'

  const name = profile?.name || 'there'
  const firstName = name.split(' ')[0]

  if (loading) return <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>loading...</div>

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Greeting */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 26, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>Hey, {firstName} 👋</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Here's where your job search stands today.</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
        <StatCard label="TOTAL APPS" value={apps.length} sub="all time" />
        <StatCard label="ACTIVE" value={active.length} sub="in progress" color="var(--accent)" />
        <StatCard label="INTERVIEWS" value={interviews.length} sub="secured" color="var(--info)" />
        <StatCard label="OFFERS" value={offers.length} sub="received" color="var(--success)" />
        <StatCard label="AVG FIT SCORE" value={avgFit} sub="out of 10" color="var(--warning)" />
      </div>

      {/* Pipeline + recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="dashboard-grid">
        <PipelineBar apps={apps} />
        <RecentApps apps={apps} />
      </div>

      {/* Risk breakdown */}
      {apps.some(a => a.remote_risk) && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', marginTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.04em' }}>REMOTE RISK BREAKDOWN</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['low', 'medium', 'high'].map(r => {
              const count = apps.filter(a => a.remote_risk === r).length
              const colors = { low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)' }
              const dims = { low: 'var(--success-dim)', medium: 'var(--warning-dim)', high: 'var(--danger-dim)' }
              if (!count) return null
              return (
                <div key={r} style={{ padding: '8px 16px', borderRadius: 8, background: dims[r], border: `1px solid ${colors[r]}22` }}>
                  <span style={{ fontSize: 12, color: colors[r], fontWeight: 500 }}>{r.charAt(0).toUpperCase() + r.slice(1)} risk</span>
                  <span style={{ fontSize: 18, fontWeight: 500, color: colors[r], marginLeft: 10 }}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 600px) { .dashboard-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
