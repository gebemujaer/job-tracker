import React from 'react'

const FALLBACK = [
  {
    version: 'v2.2.0', date: 'May 2026', tag: 'Latest',
    changes: [
      { type: 'new', text: 'Tag picker UI with categorized suggestions — click to add, no typing needed' },
      { type: 'new', text: 'Pre-built tag library: Audience gaps, Tool gaps, Deal size, Experience gaps, Risk flags, Strengths' },
      { type: 'new', text: 'Tag history — previously used tags appear first for consistency' },
      { type: 'new', text: 'Built-in tag guide with ? button explaining how gap tags work' },
      { type: 'new', text: 'Strength tags shown in green to distinguish from gap tags' },
      { type: 'improved', text: 'Gap analysis shows company names per tag and color-coded rejection correlation' },
      { type: 'improved', text: 'Tag analysis legend: red = high rejection, amber = some risk, green = interview correlation' },
      { type: 'fixed', text: 'TrackerPage crash on page load — complete rewrite with safe null handling' },
      { type: 'fixed', text: 'Application insert failing with 400 — empty date and remote_risk fields now sent as null' },
      { type: 'fixed', text: 'getFriends join crash — rewrote to use separate profile queries' },
    ]
  },
  {
    version: 'v2.1.0', date: 'May 2026', tag: 'Previous',
    changes: [
      { type: 'new', text: 'Full dashboard redesign — dense, data-heavy analytics layout' },
      { type: 'new', text: '8 stat cards: Total, Active, Interviews, Offers, Ghosted, Avg Fit, Avg Response Days, This Week velocity' },
      { type: 'new', text: 'Week-over-week velocity indicator' },
      { type: 'new', text: 'Conversion funnel chart with conversion rates between stages' },
      { type: 'new', text: 'Fit score vs outcome — compares interview rates for high vs low fit' },
      { type: 'new', text: 'Resume performance tracking — which version gets most interviews' },
      { type: 'new', text: 'Resume used + Cover letter used dropdowns in application form' },
      { type: 'new', text: 'Average days to response metric' },
      { type: 'improved', text: 'Profile name now loads correctly — greeting shows your actual name' },
      { type: 'improved', text: 'Auto-creates profile if missing on sign in' },
      { type: 'fixed', text: 'Dashboard alerts moved to top for visibility' },
    ]
  },
  {
    version: 'v2.0.0', date: 'May 2026', tag: 'Major',
    changes: [
      { type: 'new', text: 'Friend / privacy system — connect by email, accept/decline requests' },
      { type: 'new', text: 'Partner View now only shows accepted friends' },
      { type: 'new', text: 'Ghosted & MIA application statuses' },
      { type: 'new', text: 'Staleness alerts — 14-day threshold for no-response detection' },
      { type: 'new', text: 'Follow-up date field with overdue alerts' },
      { type: 'new', text: 'Tags field — searchable, shown as chips on each application' },
      { type: 'new', text: 'Gap / tag analysis on dashboard' },
      { type: 'new', text: 'Sort applications by date, fit score, or company' },
      { type: 'new', text: 'Notes modal — read full notes without editing' },
      { type: 'new', text: 'Export to CSV' },
      { type: 'new', text: 'Profile page — edit name and change password' },
      { type: 'new', text: 'Changelog and Terms & Privacy pages' },
      { type: 'improved', text: 'Fit score supports decimals (e.g. 8.5)' },
      { type: 'improved', text: 'Show/hide password toggle on login and profile' },
      { type: 'improved', text: 'Remember me on sign in' },
      { type: 'improved', text: 'Dynamic sidebar name — shows your actual name' },
      { type: 'improved', text: 'Private file storage with signed URLs' },
      { type: 'fixed', text: 'Mobile routing 404 error' },
      { type: 'fixed', text: 'Document upload RLS policy' },
      { type: 'fixed', text: 'Email confirmation redirect to localhost' },
      { type: 'fixed', text: 'Applications disappearing after database changes' },
    ]
  },
  {
    version: 'v1.0.0', date: 'May 2026', tag: 'Initial',
    changes: [
      { type: 'new', text: 'Job application tracker with add, edit, delete' },
      { type: 'new', text: 'Status pipeline: Applied, Screening, Interview, Offer, Rejected, Withdrawn' },
      { type: 'new', text: 'Remote work risk flag: Low / Medium / High' },
      { type: 'new', text: 'Fit score per application' },
      { type: 'new', text: 'Dashboard with stats and pipeline' },
      { type: 'new', text: 'Document upload — PDF, DOCX' },
      { type: 'new', text: "Partner View — see other users' trackers" },
      { type: 'new', text: 'How to Use guide page' },
      { type: 'new', text: 'Authentication — sign up, sign in, sign out' },
      { type: 'new', text: 'Deployed on Vercel with Supabase backend' },
    ]
  }
]

const typeConfig = {
  new:      { label: 'New',      color: 'var(--success)', dim: 'var(--success-dim)' },
  improved: { label: 'Improved', color: 'var(--info)',    dim: 'var(--info-dim)' },
  fixed:    { label: 'Fixed',    color: 'var(--warning)', dim: 'var(--warning-dim)' },
}

const tagColors = { Latest: 'var(--accent)', Major: 'var(--info)', Previous: 'var(--text-muted)', Initial: 'var(--text-muted)' }
const tagBgs = { Latest: 'var(--accent-dim)', Major: 'var(--info-dim)', Previous: 'rgba(85,85,85,0.15)', Initial: 'rgba(85,85,85,0.15)' }

export default function ChangelogPage() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Changelog</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
          Complete history of every version — what was built, improved, and fixed.
        </p>
      </div>

      {FALLBACK.map((release) => (
        <div key={release.version} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 18, fontWeight: 500 }}>{release.version}</h2>
            <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: tagBgs[release.tag] || tagBgs.Initial, color: tagColors[release.tag] || tagColors.Initial }}>{release.tag}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{release.date}</span>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            {release.changes.map((c, ci) => {
              const cfg = typeConfig[c.type] || typeConfig.new
              return (
                <div key={ci} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 16px', borderBottom: ci < release.changes.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 500, background: cfg.dim, color: cfg.color, flexShrink: 0, marginTop: 1 }}>{cfg.label}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.text}</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem 1.5rem' }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Coming up in v3</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Role-agnostic onboarding · 12+ role presets (Engineering, Design, HR, Consulting, Accounting, Film, and more) · Location context per user · Friend request notifications · Error boundaries · Quick status updates · Empty state improvements · Mobile polish · AI-powered gap analysis · Interview prep notes
        </div>
      </div>
    </div>
  )
}
