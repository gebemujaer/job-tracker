import React from 'react'

const FALLBACK = [
  {
    version: 'v3.0.0', date: 'May 2026', tag: 'Latest',
    changes: [
      { type: 'new', text: 'Onboarding flow — new users pick their job search focus and country on first login' },
      { type: 'new', text: '12+ role presets with tailored tag libraries: Tech Sales, Engineering, Design, Marketing, Product, Finance, HR, Consulting, Accounting, Tax/Audit, Film/Media, Program Management, and Custom' },
      { type: 'new', text: 'Role-aware tag picker — suggestions update based on your job search focus' },
      { type: 'new', text: 'Location context in profile — set your country for personalized remote work risk guidance' },
      { type: 'new', text: 'Job search focus shown on profile page' },
      { type: 'improved', text: 'Guide page fully role-agnostic — works for any industry or job type' },
      { type: 'improved', text: 'Profile page now includes job search focus and country fields' },
      { type: 'improved', text: 'Tag label shows your role name when a role is set' },
    ]
  },
  {
    version: 'v2.3.0', date: 'May 2026', tag: 'Previous',
    changes: [
      { type: 'new', text: 'Error boundary — crashes now show a friendly error screen instead of black page' },
      { type: 'new', text: 'Quick status dropdown directly on each application card' },
      { type: 'new', text: 'Save button spinner — visual feedback while saving' },
      { type: 'new', text: 'New application highlights green after saving' },
      { type: 'new', text: 'Friend request badge on sidebar' },
      { type: 'new', text: 'Empty state on Applications page for new users' },
      { type: 'improved', text: 'Action buttons now have borders and hover states' },
      { type: 'improved', text: 'Form auto-scrolls into view when opened' },
    ]
  },
  {
    version: 'v2.2.0', date: 'May 2026', tag: 'v2.2',
    changes: [
      { type: 'new', text: 'Tag picker UI with categorized suggestions' },
      { type: 'new', text: 'Pre-built tag library: Audience gaps, Tool gaps, Deal size, Experience gaps, Risk flags, Strengths' },
      { type: 'new', text: 'Tag history — previously used tags appear first' },
      { type: 'new', text: 'Built-in tag guide with ? button' },
      { type: 'improved', text: 'Gap analysis shows company names and color-coded rejection correlation' },
      { type: 'fixed', text: 'TrackerPage crash — complete rewrite with safe null handling' },
      { type: 'fixed', text: 'Application insert 400 error — empty date and remote_risk sent as null' },
      { type: 'fixed', text: 'getFriends join crash — rewrote to use separate profile queries' },
    ]
  },
  {
    version: 'v2.1.0', date: 'May 2026', tag: 'v2.1',
    changes: [
      { type: 'new', text: 'Full dashboard redesign — dense, data-heavy analytics layout' },
      { type: 'new', text: '8 stat cards: Total, Active, Interviews, Offers, Ghosted, Avg Fit, Avg Response, This Week velocity' },
      { type: 'new', text: 'Conversion funnel, weekly activity chart, fit vs outcome, resume performance' },
      { type: 'new', text: 'Resume used + Cover letter used dropdowns in application form' },
      { type: 'improved', text: 'Profile name loads correctly — greeting shows your actual name' },
    ]
  },
  {
    version: 'v2.0.0', date: 'May 2026', tag: 'v2.0',
    changes: [
      { type: 'new', text: 'Friend / privacy system — connect by email, accept/decline requests' },
      { type: 'new', text: 'Ghosted & MIA statuses, staleness alerts, follow-up date field' },
      { type: 'new', text: 'Tags, gap analysis, sort, notes modal, CSV export' },
      { type: 'new', text: 'Profile page, Changelog, Terms & Privacy pages' },
      { type: 'improved', text: 'Fit score decimals, show/hide password, remember me, dynamic name' },
      { type: 'fixed', text: 'Mobile routing, document upload, email confirmation redirect' },
    ]
  },
  {
    version: 'v1.0.0', date: 'May 2026', tag: 'Initial',
    changes: [
      { type: 'new', text: 'Job application tracker with add, edit, delete' },
      { type: 'new', text: 'Status pipeline, remote risk flag, fit score' },
      { type: 'new', text: 'Dashboard, document upload, partner view, guide page' },
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
const tagColors = { Latest: 'var(--accent)', Previous: 'var(--text-muted)', Initial: 'var(--text-muted)' }
const tagBgs = { Latest: 'var(--accent-dim)', Previous: 'rgba(85,85,85,0.15)', Initial: 'rgba(85,85,85,0.15)' }

export default function ChangelogPage() {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Changelog</h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 3 }}>
          Complete history of every version — what was built, improved, and fixed.
        </p>
      </div>
      {FALLBACK.map((release) => (
        <div key={release.version} style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1rem", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 18, fontWeight: 500 }}>{release.version}</h2>
            <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: tagBgs[release.tag] || "rgba(85,85,85,0.15)", color: tagColors[release.tag] || "var(--text-muted)" }}>{release.tag}</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>{release.date}</span>
          </div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
            {release.changes.map((c, ci) => {
              const cfg = typeConfig[c.type] || typeConfig.new
              return (
                <div key={ci} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 16px", borderBottom: ci < release.changes.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 500, background: cfg.dim, color: cfg.color, flexShrink: 0, marginTop: 1 }}>{cfg.label}</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{c.text}</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem 1.5rem" }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Coming up in v4</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
          AI-powered gap analysis · Email/push notifications · Calendar integration · Interview prep notes · Salary negotiation tracker · Mobile app
        </div>
      </div>
    </div>
  )
}
