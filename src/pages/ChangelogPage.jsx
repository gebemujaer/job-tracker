import React from 'react'

const changelog = [
  {
    version: 'v2.0.0',
    date: 'May 2026',
    tag: 'Latest',
    tagColor: 'var(--accent)',
    changes: [
      { type: 'new', text: 'Friend / privacy system — connect with specific people by email, accept/decline requests' },
      { type: 'new', text: 'Ghosted & MIA status — new application statuses for no-response tracking' },
      { type: 'new', text: 'Staleness alerts — auto-detect applications with no update after 14 days' },
      { type: 'new', text: 'Follow-up date field — set a reminder date per application' },
      { type: 'new', text: 'Conversion funnel chart on dashboard — see Applied → Screening → Interview → Offer rates' },
      { type: 'new', text: 'Weekly activity bar chart — track how many apps you send per day' },
      { type: 'new', text: 'Gap / tag analysis — tag your gaps (e.g. dev-audience, no-salesNav) and see which correlate with rejections' },
      { type: 'new', text: 'Tags field on applications — comma-separated, searchable, shown as chips' },
      { type: 'new', text: 'Sort applications — by date, fit score, or company name' },
      { type: 'new', text: 'Notes modal — click 📝 to read full notes without editing' },
      { type: 'new', text: 'Export to CSV — download all your applications as a spreadsheet' },
      { type: 'new', text: 'Profile page — edit your display name and change password' },
      { type: 'new', text: 'Changelog page — this page' },
      { type: 'new', text: 'Terms & Privacy page' },
      { type: 'improved', text: 'Fit score now supports decimals (e.g. 8.5)' },
      { type: 'improved', text: 'Show/hide password toggle on login and profile' },
      { type: 'improved', text: 'Remember me option on sign in' },
      { type: 'improved', text: 'Dynamic app name — shows your name in sidebar' },
      { type: 'improved', text: 'Private file storage — documents secured with signed URLs' },
      { type: 'improved', text: 'Mobile sidebar polish' },
      { type: 'fixed', text: 'Mobile routing 404 error fixed (vercel.json)' },
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
  new: { label: 'New', color: 'var(--success)', dim: 'var(--success-dim)' },
  improved: { label: 'Improved', color: 'var(--info)', dim: 'var(--info-dim)' },
  fixed: { label: 'Fixed', color: 'var(--warning)', dim: 'var(--warning-dim)' },
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

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem 1.5rem', marginTop: '1rem' }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Coming up in v3</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          AI-powered gap analysis · Email/push notifications · Calendar integration · Interview prep notes · Salary negotiation tracker
        </div>
      </div>
    </div>
  )
}
