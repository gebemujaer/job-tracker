import React from 'react'

const changelog = [
  {
    version: 'v2.2.0',
    date: 'May 2026',
    tag: 'Latest',
    tagColor: 'var(--accent)',
    changes: [
      { type: 'new', text: 'Tag picker UI — click to add tags from categorized suggestions, no typing needed' },
      { type: 'new', text: 'Pre-built SDR/BDR gap tag library: audience gaps, tool gaps, deal size, experience gaps, risk flags, strengths' },
      { type: 'new', text: 'Tag history — your previously used tags appear first in the dropdown for consistency' },
      { type: 'new', text: 'Tag guide — built-in explanation of what tags are and how to use them effectively' },
      { type: 'improved', text: 'Gap / tag analysis on dashboard now shows company names per tag, color-coded rejection correlation, and empty state guidance' },
      { type: 'improved', text: 'Strength tags (e.g. sea-market, quota-crusher) shown in green to distinguish from gap tags' },
      { type: 'improved', text: 'Tag analysis legend: red = high rejection rate, amber = some risk, green = interview correlation' },
    ]
  },
  {
    version: 'v2.1.0',
    date: 'May 2026',
    tag: 'Previous',
    tagColor: 'var(--accent)',
    changes: [
      { type: 'new', text: 'Full dashboard redesign — dense, data-heavy analytics layout' },
      { type: 'new', text: '8 stat cards: Total, Active, Interviews, Offers, Ghosted, Avg Fit, Avg Response Days, This Week velocity' },
      { type: 'new', text: 'Week-over-week velocity indicator — shows ↑↓ vs last week' },
      { type: 'new', text: 'Conversion funnel with conversion rates between each stage' },
      { type: 'new', text: 'Fit score vs outcome — compares interview rates for high fit (8+) vs low fit (≤6) applications' },
      { type: 'new', text: 'Resume performance tracking — shows which resume version gets the most interviews' },
      { type: 'new', text: 'Resume used + Cover letter used dropdowns in application form — links to your uploaded documents' },
      { type: 'new', text: 'Average days to response metric on dashboard' },
      { type: 'improved', text: 'Profile name now loads correctly — greeting shows your actual name' },
      { type: 'improved', text: 'Auto-creates profile if missing on sign in' },
      { type: 'improved', text: 'Dashboard alerts (ghosted + follow-ups) moved to top for visibility' },
      { type: 'improved', text: 'Remote risk breakdown now shown as horizontal bars with percentages' },
      { type: 'improved', text: 'Recent applications list more compact — shows days since applied' },
    ]
  },
  {
    version: 'v2.0.0',
    date: 'May 2026',
    tag: 'Major',
    tagColor: 'var(--info)',
    changes: [
      { type: 'new', text: 'Friend / privacy system — connect with specific people by email, accept/decline requests' },
      { type: 'new', text: 'Ghosted & MIA status — new application statuses for no-response tracking' },
      { type: 'new', text: 'Staleness alerts — auto-detect applications with no update after 14 days' },
      { type: 'new', text: 'Follow-up date field — set a reminder date per application' },
      { type: 'new', text: 'Conversion funnel chart on dashboard' },
      { type: 'new', text: 'Weekly activity bar chart' },
      { type: 'new', text: 'Gap / tag analysis — tag your gaps and see which correlate with rejections' },
      { type: 'new', text: 'Tags field on applications — comma-separated, searchable, shown as chips' },
      { type: 'new', text: 'Sort applications — by date, fit score, or company name' },
      { type: 'new', text: 'Notes modal — click 📝 to read full notes without editing' },
      { type: 'new', text: 'Export to CSV — download all your applications as a spreadsheet' },
      { type: 'new', text: 'Profile page — edit your display name and change password' },
      { type: 'new', text: 'Changelog page' },
      { type: 'new', text: 'Terms & Privacy page' },
      { type: 'improved', text: 'Fit score now supports decimals (e.g. 8.5)' },
      { type: 'improved', text: 'Show/hide password toggle on login and profile' },
      { type: 'improved', text: 'Remember me option on sign in' },
      { type: 'improved', text: 'Dynamic app name — shows your name in sidebar' },
      { type: 'improved', text: 'Private file storage — documents secured with signed URLs' },
      { type: 'fixed', text: 'Mobile routing 404 error fixed' },
      { type: 'fixed', text: 'Document upload RLS policy fixed' },
      { type: 'fixed', text: 'Email confirmation redirect now points to live URL' },
    ]
  },
  {
    version: 'v1.0.0',
    date: 'May 2026',
    tag: 'Initial',
    tagColor: 'var(--text-muted)',
    changes: [
      { type: 'new', text: 'Job application tracker with add, edit, delete' },
      { type: 'new', text: 'Status pipeline: Applied, Screening, Interview, Offer, Rejected, Withdrawn' },
      { type: 'new', text: 'Remote-from-Indonesia risk flag (Low / Medium / High)' },
      { type: 'new', text: 'Fit score per application' },
      { type: 'new', text: 'Dashboard with stats and pipeline bar' },
      { type: 'new', text: 'Document upload (PDF, DOCX)' },
      { type: 'new', text: 'Partner view — see all other users' },
      { type: 'new', text: 'How to Use guide page' },
      { type: 'new', text: 'Auth: sign up, sign in, sign out' },
    ]
  }
]

const typeConfig = {
  new:      { label: 'New',      color: 'var(--success)', dim: 'var(--success-dim)' },
  improved: { label: 'Improved', color: 'var(--info)',    dim: 'var(--info-dim)' },
  fixed:    { label: 'Fixed',    color: 'var(--warning)', dim: 'var(--warning-dim)' },
}

export default function ChangelogPage() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Changelog</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>What's been built and what's changed</p>
      </div>

      {changelog.map((release, i) => (
        <div key={release.version} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
            <h2 style={{ fontSize: 18, fontWeight: 500 }}>{release.version}</h2>
            <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: i === 0 ? 'var(--accent-dim)' : 'rgba(85,85,85,0.15)', color: release.tagColor }}>{release.tag}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{release.date}</span>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            {release.changes.map((c, ci) => {
              const cfg = typeConfig[c.type]
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
          AI-powered gap analysis · Email/push notifications · Calendar integration · Interview prep notes · Salary negotiation tracker · Mobile app
        </div>
      </div>
    </div>
  )
}
