import React, { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { getApplications } from '../lib/supabase'
import { Link } from 'react-router-dom'

const STATUS_CONFIG = {
  applied:   { label: 'Applied',   color: '#60a5fa' },
  screening: { label: 'Screening', color: '#fbbf24' },
  interview: { label: 'Interview', color: '#d4f57a' },
  offer:     { label: 'Offer',     color: '#4ade80' },
  rejected:  { label: 'Rejected',  color: '#ff6b6b' },
  ghosted:   { label: 'Ghosted',   color: '#a78bfa' },
  mia:       { label: 'MIA',       color: '#a78bfa' },
  withdrawn: { label: 'Withdrawn', color: '#555' },
}

const STALE_DAYS = 14

function daysSince(d) {
  if (!d) return null
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
}

function daysUntil(d) {
  if (!d) return null
  return Math.floor((new Date(d).getTime() - Date.now()) / 86400000)
}

// Mini stat block
function Stat({ label, value, sub, color, border }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: `1px solid ${border || 'var(--border)'}`,
      borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 4
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 500, color: color || 'var(--text)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}

// Horizontal bar
function Bar({ pct, color, height = 6 }) {
  return (
    <div style={{ height, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
    </div>
  )
}

function Section({ title, children, action }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{title}</div>
        {action}
      </div>
      {children}
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

  if (loading) return <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>loading...</div>

  const name = profile?.name || 'there'
  const firstName = name.split(' ')[0]

  // Core metrics
  const total = apps.length
  const active = apps.filter(a => ['applied','screening','interview'].includes(a.status))
  const interviews = apps.filter(a => a.status === 'interview')
  const offers = apps.filter(a => a.status === 'offer')
  const rejected = apps.filter(a => ['rejected','ghosted','mia'].includes(a.status))
  const ghosted = apps.filter(a => ['ghosted','mia'].includes(a.status))
  const stale = apps.filter(a => a.status === 'applied' && daysSince(a.applied_date) >= STALE_DAYS)

  // Rates
  const responseRate = total > 0 ? Math.round(((total - ghosted.length) / total) * 100) : 0
  const interviewRate = total > 0 ? Math.round((interviews.length / total) * 100) : 0
  const offerRate = interviews.length > 0 ? Math.round((offers.length / interviews.length) * 100) : 0
  const ghostRate = total > 0 ? Math.round((ghosted.length / total) * 100) : 0

  // Avg days to response (apps that moved past applied)
  const responded = apps.filter(a => a.status !== 'applied' && a.applied_date && a.updated_at)
  const avgDays = responded.length > 0
    ? Math.round(responded.reduce((s, a) => s + daysSince(a.applied_date), 0) / responded.length)
    : null

  // Fit vs outcome
  const fitApps = apps.filter(a => a.fit_score_decimal || a.fit_score)
  const avgFit = fitApps.length > 0
    ? (fitApps.reduce((s, a) => s + Number(a.fit_score_decimal || a.fit_score), 0) / fitApps.length).toFixed(1)
    : '—'
  const highFitInterview = fitApps.filter(a => Number(a.fit_score_decimal || a.fit_score) >= 8 && a.status === 'interview').length
  const highFitTotal = fitApps.filter(a => Number(a.fit_score_decimal || a.fit_score) >= 8).length
  const lowFitInterview = fitApps.filter(a => Number(a.fit_score_decimal || a.fit_score) < 7 && a.status === 'interview').length
  const lowFitTotal = fitApps.filter(a => Number(a.fit_score_decimal || a.fit_score) < 7).length

  // Weekly activity (last 7 days)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    return { label: d.toLocaleDateString('en-US', { weekday: 'short' }), dateStr, count: apps.filter(a => a.applied_date === dateStr).length }
  })
  const maxWeek = Math.max(...weekDays.map(w => w.count), 1)

  // This week vs last week
  const thisWeekTotal = weekDays.reduce((s, w) => s + w.count, 0)
  const lastWeekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i))
    return d.toISOString().split('T')[0]
  })
  const lastWeekTotal = apps.filter(a => lastWeekDays.includes(a.applied_date)).length
  const velocityDiff = thisWeekTotal - lastWeekTotal

  // Pipeline stages
  const stages = ['applied','screening','interview','offer']
  const stageMax = Math.max(...stages.map(s => apps.filter(a => a.status === s).length), 1)

  // Tag analysis
  const tagMap = {}
  apps.forEach(a => {
    (Array.isArray(a.tags) ? a.tags : []).forEach(t => {
      if (!t) return
      if (!tagMap[t]) tagMap[t] = { total: 0, interview: 0, rejected: 0, offer: 0 }
      tagMap[t].total++
      if (a.status === 'interview') tagMap[t].interview++
      if (['rejected','ghosted','mia'].includes(a.status)) tagMap[t].rejected++
      if (a.status === 'offer') tagMap[t].offer++
    })
  })
  const topTags = Object.entries(tagMap).sort((a, b) => b[1].total - a[1].total).slice(0, 6)

  // Resume performance
  const resumeMap = {}
  apps.forEach(a => {
    if (!a.resume_label) return
    if (!resumeMap[a.resume_label]) resumeMap[a.resume_label] = { total: 0, interview: 0, offer: 0 }
    resumeMap[a.resume_label].total++
    if (a.status === 'interview') resumeMap[a.resume_label].interview++
    if (a.status === 'offer') resumeMap[a.resume_label].offer++
  })
  const resumeEntries = Object.entries(resumeMap)

  // Follow-ups due
  const followUps = apps.filter(a => a.follow_up_date && daysUntil(a.follow_up_date) <= 2 && daysUntil(a.follow_up_date) >= -1 && !['rejected','ghosted','mia','withdrawn','offer'].includes(a.status))

  // Status distribution
  const statusCounts = Object.fromEntries(Object.keys(STATUS_CONFIG).map(k => [k, apps.filter(a => a.status === k).length]))

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500 }}>Hey, {firstName} 👋</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
            {total === 0 ? 'No applications yet — add your first one.' : `${total} application${total !== 1 ? 's' : ''} tracked · ${active.length} active`}
          </p>
        </div>
        <Link to="/tracker" style={{ padding: '8px 16px', background: 'var(--accent)', borderRadius: 9, fontSize: 13, fontWeight: 500, color: 'var(--accent-text)' }}>
          + Add application
        </Link>
      </div>

      {/* Alerts */}
      {(stale.length > 0 || followUps.length > 0) && (
        <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {stale.length > 0 && (
            <div style={{ flex: 1, minWidth: 200, background: 'var(--ghost-dim)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
              <span style={{ color: 'var(--ghost)', fontWeight: 500 }}>👻 {stale.length} likely ghosted</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>Go to Applications → mark as ghosted</span>
            </div>
          )}
          {followUps.length > 0 && (
            <div style={{ flex: 1, minWidth: 200, background: 'var(--warning-dim)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
              <span style={{ color: 'var(--warning)', fontWeight: 500 }}>⏰ {followUps.length} follow-up{followUps.length > 1 ? 's' : ''} due</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{followUps.map(a => a.company).join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Top stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8, marginBottom: '1rem' }}>
        <Stat label="Total" value={total} sub="all time" />
        <Stat label="Active" value={active.length} color="var(--accent)" sub="in pipeline" border="rgba(212,245,122,0.15)" />
        <Stat label="Interviews" value={interviews.length} color="var(--info)" sub={`${interviewRate}% rate`} />
        <Stat label="Offers" value={offers.length} color="var(--success)" sub={offerRate > 0 ? `${offerRate}% of intv.` : '—'} />
        <Stat label="Ghosted" value={ghosted.length} color="var(--ghost)" sub={`${ghostRate}% rate`} />
        <Stat label="Avg Fit" value={avgFit} color="var(--warning)" sub="out of 10" />
        <Stat label="Avg Response" value={avgDays !== null ? `${avgDays}d` : '—'} sub="days to move" />
        <Stat label="This Week" value={thisWeekTotal}
          color={velocityDiff > 0 ? 'var(--success)' : velocityDiff < 0 ? 'var(--danger)' : 'var(--text)'}
          sub={velocityDiff > 0 ? `↑ ${velocityDiff} vs last wk` : velocityDiff < 0 ? `↓ ${Math.abs(velocityDiff)} vs last wk` : 'same as last wk'} />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="dash-main">

        {/* Pipeline funnel */}
        <Section title="Conversion funnel">
          {stages.map((s, i) => {
            const count = statusCounts[s] || 0
            const prev = i === 0 ? total : (statusCounts[stages[i-1]] || 0)
            const conv = prev > 0 && i > 0 ? `${Math.round((count/prev)*100)}%` : null
            const cfg = STATUS_CONFIG[s]
            return (
              <div key={s} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5, gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 72, flexShrink: 0 }}>{cfg.label}</span>
                  <Bar pct={total > 0 ? (count/total)*100 : 0} color={cfg.color} />
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {conv && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{conv} conv</span>}
                    <span style={{ fontSize: 12, fontWeight: 500, color: cfg.color, width: 16, textAlign: 'right' }}>{count}</span>
                  </div>
                </div>
              </div>
            )
          })}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {['rejected','ghosted','withdrawn'].map(s => {
              const count = statusCounts[s] || 0
              const cfg = STATUS_CONFIG[s]
              return count > 0 ? (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color }} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cfg.label}: {count}</span>
                </div>
              ) : null
            })}
          </div>
        </Section>

        {/* Weekly activity */}
        <Section title="Weekly activity" action={
          <span style={{ fontSize: 11, color: velocityDiff >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {velocityDiff >= 0 ? '↑' : '↓'} {Math.abs(velocityDiff)} vs last week
          </span>
        }>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 90 }}>
            {weekDays.map(w => (
              <div key={w.dateStr} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 10, color: w.count > 0 ? 'var(--accent)' : 'transparent', fontWeight: 600 }}>{w.count}</div>
                <div style={{ width: '100%', background: w.count > 0 ? 'var(--accent)' : 'var(--bg-hover)', borderRadius: 4, height: `${Math.max((w.count / maxWeek) * 68, 4)}px`, transition: 'height 0.5s ease', opacity: w.count > 0 ? 1 : 0.4 }} />
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{w.label}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{thisWeekTotal} this week</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lastWeekTotal} last week</span>
          </div>
        </Section>

        {/* Fit score vs outcome */}
        <Section title="Fit score vs outcome">
          {fitApps.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>Add fit scores to see analysis</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '1rem' }}>
                {[
                  { label: 'High fit (8–10)', total: highFitTotal, interview: highFitInterview, color: 'var(--success)' },
                  { label: 'Low fit (≤6)', total: lowFitTotal, interview: lowFitInterview, color: 'var(--danger)' },
                ].map(g => (
                  <div key={g.label} style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{g.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 500, color: g.color }}>{g.total}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>
                      {g.interview} interview{g.interview !== 1 ? 's' : ''} · {g.total > 0 ? Math.round((g.interview/g.total)*100) : 0}% rate
                    </div>
                  </div>
                ))}
              </div>
              <div>
                {fitApps.slice(0, 5).map(a => {
                  const fit = Number(a.fit_score_decimal || a.fit_score)
                  const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.applied
                  return (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.company}</span>
                      <Bar pct={(fit / 10) * 100} color={fit >= 8 ? 'var(--success)' : fit >= 6 ? 'var(--warning)' : 'var(--danger)'} height={4} />
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: fit >= 8 ? 'var(--success)' : fit >= 6 ? 'var(--warning)' : 'var(--danger)', width: 28, textAlign: 'right' }}>{fit}</span>
                      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: `${cfg.color}22`, color: cfg.color, whiteSpace: 'nowrap' }}>{cfg.label}</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </Section>

        {/* Tag analysis */}
        <Section title="Gap / tag analysis">
          {topTags.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>Add tags to applications to see gap analysis</div>
          ) : topTags.map(([tag, data]) => {
            const rejRate = data.total > 0 ? Math.round((data.rejected / data.total) * 100) : 0
            const intRate = data.total > 0 ? Math.round((data.interview / data.total) * 100) : 0
            return (
              <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, background: 'var(--accent-dim)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0 }}>{tag}</span>
                <Bar pct={(data.total / (topTags[0]?.[1]?.total || 1)) * 100} color={rejRate > 50 ? 'var(--danger)' : rejRate > 25 ? 'var(--warning)' : 'var(--accent)'} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{data.total}×</span>
                {rejRate > 0 && <span style={{ fontSize: 10, color: 'var(--danger)', whiteSpace: 'nowrap' }}>{rejRate}% rej</span>}
                {intRate > 0 && <span style={{ fontSize: 10, color: 'var(--accent)', whiteSpace: 'nowrap' }}>{intRate}% int</span>}
              </div>
            )
          })}
        </Section>

        {/* Resume performance */}
        {resumeEntries.length > 0 && (
          <Section title="Resume performance">
            {resumeEntries.map(([label, data]) => {
              const intRate = data.total > 0 ? Math.round((data.interview / data.total) * 100) : 0
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{data.total} apps</span>
                  <span style={{ fontSize: 11, color: intRate > 20 ? 'var(--success)' : 'var(--text-muted)' }}>{intRate}% intv.</span>
                  {data.offer > 0 && <span style={{ fontSize: 10, color: 'var(--success)' }}>{data.offer} offer</span>}
                </div>
              )
            })}
          </Section>
        )}

        {/* Recent applications */}
        <Section title="Recent applications" action={<Link to="/tracker" style={{ fontSize: 11, color: 'var(--accent)' }}>View all →</Link>}>
          {apps.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
              <Link to="/tracker" style={{ color: 'var(--accent)' }}>Add your first application →</Link>
            </div>
          ) : apps.slice(0, 6).map(app => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied
            const fit = app.fit_score_decimal || app.fit_score
            const days = daysSince(app.applied_date)
            return (
              <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.company}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.role}</div>
                </div>
                {fit && <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: fit >= 8 ? 'var(--success)' : fit >= 6 ? 'var(--warning)' : 'var(--danger)', flexShrink: 0 }}>{fit}</span>}
                {days !== null && <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{days}d</span>}
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: `${cfg.color}22`, color: cfg.color, whiteSpace: 'nowrap', flexShrink: 0 }}>{cfg.label}</span>
              </div>
            )
          })}
        </Section>

        {/* Remote risk */}
        {apps.some(a => a.remote_risk) && (
          <Section title="Remote risk breakdown">
            {['low','medium','high'].map(r => {
              const count = apps.filter(a => a.remote_risk === r).length
              const colors = { low:'var(--success)', medium:'var(--warning)', high:'var(--danger)' }
              return (
                <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: colors[r], width: 60, flexShrink: 0, fontWeight: 500 }}>{r.charAt(0).toUpperCase()+r.slice(1)}</span>
                  <Bar pct={total > 0 ? (count/total)*100 : 0} color={colors[r]} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: colors[r], width: 20, textAlign: 'right', flexShrink: 0 }}>{count}</span>
                </div>
              )
            })}
          </Section>
        )}

      </div>

      <style>{`@media (max-width: 700px) { .dash-main { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
