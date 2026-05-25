import React, { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { getApplications } from '../lib/supabase'
import { Link } from 'react-router-dom'

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

const STALE_DAYS = 14

function daysSince(dateStr) {
  if (!dateStr) return null
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem 1.5rem' }}>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 8, letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 500, color: color || 'var(--text)', lineHeight: 1, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}

function FunnelChart({ apps }) {
  const stages = [
    { key: 'applied', label: 'Applied' },
    { key: 'screening', label: 'Screening' },
    { key: 'interview', label: 'Interview' },
    { key: 'offer', label: 'Offer' },
  ]
  const max = apps.length || 1
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '1.25rem', letterSpacing: '0.04em' }}>CONVERSION FUNNEL</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {stages.map((s, i) => {
          const count = apps.filter(a => a.status === s.key).length
          const pct = Math.round((count / max) * 100)
          const cfg = STATUS_CONFIG[s.key]
          const prevCount = i === 0 ? max : apps.filter(a => a.status === stages[i-1].key).length
          const convRate = prevCount > 0 && i > 0 ? Math.round((count / prevCount) * 100) : null
          return (
            <div key={s.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</span>
                <div style={{ display: 'flex', gap: 10 }}>
                  {convRate !== null && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{convRate}% conv.</span>}
                  <span style={{ fontSize: 12, fontWeight: 500, color: cfg.color }}>{count}</span>
                </div>
              </div>
              <div style={{ height: 8, background: 'var(--bg-hover)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: 4, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WeeklyChart({ apps }) {
  const weeks = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const label = d.toLocaleDateString('en-US', { weekday: 'short' })
    const count = apps.filter(a => a.applied_date === dateStr).length
    weeks.push({ label, count, dateStr })
  }
  const max = Math.max(...weeks.map(w => w.count), 1)
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '1.25rem', letterSpacing: '0.04em' }}>APPLICATIONS THIS WEEK</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80 }}>
        {weeks.map(w => (
          <div key={w.dateStr} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 11, color: w.count > 0 ? 'var(--accent)' : 'var(--text-muted)', fontWeight: w.count > 0 ? 500 : 400 }}>{w.count || ''}</div>
            <div style={{ width: '100%', background: w.count > 0 ? 'var(--accent)' : 'var(--bg-hover)', borderRadius: 4, height: `${Math.max((w.count / max) * 60, 4)}px`, transition: 'height 0.4s ease' }} />
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{w.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TagsAnalysis({ apps }) {
  const tagCounts = {}
  const tagOutcomes = {}
  apps.forEach(a => {
    const tags = Array.isArray(a.tags) ? a.tags : []
    tags.forEach(t => {
      if (!t) return
      tagCounts[t] = (tagCounts[t] || 0) + 1
      if (!tagOutcomes[t]) tagOutcomes[t] = { rejected: 0, ghosted: 0, interview: 0, offer: 0, total: 0 }
      tagOutcomes[t].total++
      if (['rejected','ghosted','mia'].includes(a.status)) tagOutcomes[t].rejected++
      if (a.status === 'interview') tagOutcomes[t].interview++
      if (a.status === 'offer') tagOutcomes[t].offer++
    })
  })
  const sorted = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)
  if (sorted.length === 0) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.04em' }}>GAP / TAG ANALYSIS</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: '1rem' }}>Gaps you flagged most — cross-referenced with outcomes</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map(([tag, count]) => {
          const outcomes = tagOutcomes[tag]
          const rejRate = outcomes.total > 0 ? Math.round((outcomes.rejected / outcomes.total) * 100) : 0
          return (
            <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--bg-hover)', borderRadius: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>{tag}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ height: 4, background: 'var(--bg-card)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(count / (sorted[0]?.[1] || 1)) * 100}%`, background: rejRate > 50 ? 'var(--danger)' : rejRate > 25 ? 'var(--warning)' : 'var(--accent)', borderRadius: 2 }} />
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{count} app{count !== 1 ? 's' : ''}</span>
              {rejRate > 0 && <span style={{ fontSize: 11, color: rejRate > 50 ? 'var(--danger)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{rejRate}% rej.</span>}
              {outcomes.interview > 0 && <span style={{ fontSize: 11, color: 'var(--accent)', whiteSpace: 'nowrap' }}>{outcomes.interview} intv.</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GhostedPanel({ apps }) {
  const ghosted = apps.filter(a => a.status === 'applied' && daysSince(a.applied_date) >= STALE_DAYS)
  if (ghosted.length === 0) return null
  return (
    <div style={{ background: 'var(--ghost-dim)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 14, padding: '1.25rem 1.5rem' }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ghost)', marginBottom: 4 }}>👻 Likely ghosted — {ghosted.length} application{ghosted.length > 1 ? 's' : ''}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No status update in {STALE_DAYS}+ days. Go to Applications to mark them.</div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) getApplications(user.id).then(({ data }) => { setApps(data || []); setLoading(false) })
  }, [user])

  const active = apps.filter(a => ['applied','screening','interview'].includes(a.status))
  const interviews = apps.filter(a => a.status === 'interview')
  const offers = apps.filter(a => a.status === 'offer')
  const ghostedCount = apps.filter(a => ['ghosted','mia'].includes(a.status)).length
  const fitApps = apps.filter(a => a.fit_score_decimal || a.fit_score)
  const avgFit = fitApps.length > 0
    ? (fitApps.reduce((s, a) => s + Number(a.fit_score_decimal || a.fit_score), 0) / fitApps.length).toFixed(1)
    : '—'

  const name = profile?.name || 'there'
  const firstName = name.split(' ')[0]

  if (loading) return <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>loading...</div>

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 26, fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>Hey, {firstName} 👋</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Here's where your job search stands today.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: '1.25rem' }}>
        <StatCard label="TOTAL APPS" value={apps.length} sub="all time" />
        <StatCard label="ACTIVE" value={active.length} sub="in progress" color="var(--accent)" />
        <StatCard label="INTERVIEWS" value={interviews.length} sub="secured" color="var(--info)" />
        <StatCard label="OFFERS" value={offers.length} sub="received" color="var(--success)" />
        <StatCard label="GHOSTED" value={ghostedCount} sub="no response" color="var(--ghost)" />
        <StatCard label="AVG FIT" value={avgFit} sub="out of 10" color="var(--warning)" />
      </div>

      <GhostedPanel apps={apps} />

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: '1.25rem' }} className="dash-grid">
        <FunnelChart apps={apps} />
        <WeeklyChart apps={apps} />
      </div>

      {/* Tags + recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }} className="dash-grid">
        <TagsAnalysis apps={apps} />

        {/* Recent */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>RECENT APPLICATIONS</div>
            <Link to="/tracker" style={{ fontSize: 12, color: 'var(--accent)' }}>View all →</Link>
          </div>
          {apps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: 13 }}>
              No applications yet.<br />
              <Link to="/tracker" style={{ color: 'var(--accent)', display: 'inline-block', marginTop: 6 }}>Add your first one →</Link>
            </div>
          ) : apps.slice(0, 5).map(app => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied
            const fit = app.fit_score_decimal || app.fit_score
            return (
              <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.company}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.role}</div>
                </div>
                {fit && <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: fit >= 8 ? 'var(--success)' : fit >= 6 ? 'var(--warning)' : 'var(--danger)', fontWeight: 500 }}>{fit}/10</span>}
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: cfg.dim, color: cfg.color, whiteSpace: 'nowrap' }}>{cfg.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Risk breakdown */}
      {apps.some(a => a.remote_risk) && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', marginTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.04em' }}>REMOTE RISK BREAKDOWN</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['low','medium','high'].map(r => {
              const count = apps.filter(a => a.remote_risk === r).length
              const colors = { low:'var(--success)', medium:'var(--warning)', high:'var(--danger)' }
              const dims = { low:'var(--success-dim)', medium:'var(--warning-dim)', high:'var(--danger-dim)' }
              if (!count) return null
              return (
                <div key={r} style={{ padding: '8px 16px', borderRadius: 8, background: dims[r] }}>
                  <span style={{ fontSize: 12, color: colors[r], fontWeight: 500 }}>{r.charAt(0).toUpperCase()+r.slice(1)} risk</span>
                  <span style={{ fontSize: 20, fontWeight: 500, color: colors[r], marginLeft: 10 }}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`@media (max-width: 640px) { .dash-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
