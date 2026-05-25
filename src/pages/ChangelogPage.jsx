import React, { useEffect, useState } from 'react'

const GITHUB_USER = 'gebemujaer'
const GITHUB_REPO = 'job-tracker'

const typeKeywords = {
  new: ['new:', '✨', 'added', 'add '],
  improved: ['improved:', 'improvement', 'updated:', 'update ', 'enhanced', 'better'],
  fixed: ['fixed:', 'fix:', 'bug:', 'patch:', '🐛'],
}

function detectType(line) {
  const lower = line.toLowerCase()
  for (const [type, keywords] of Object.entries(typeKeywords)) {
    if (keywords.some(k => lower.startsWith(k) || lower.includes(k))) return type
  }
  return 'new'
}

function parseBody(body) {
  if (!body) return []
  return body.split('\n')
    .map(l => l.replace(/^[-*•]\s*/, '').trim())
    .filter(l => l.length > 2 && !l.startsWith('#'))
    .map(l => ({ type: detectType(l), text: l.replace(/^(new:|improved:|fixed:|✨|🐛):/i, '').trim() }))
}

const typeConfig = {
  new:      { label: 'New',      color: 'var(--success)', dim: 'var(--success-dim)' },
  improved: { label: 'Improved', color: 'var(--info)',    dim: 'var(--info-dim)' },
  fixed:    { label: 'Fixed',    color: 'var(--warning)', dim: 'var(--warning-dim)' },
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function ChangelogPage() {
  const [releases, setReleases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/releases`)
      .then(r => {
        if (!r.ok) throw new Error('Could not fetch releases')
        return r.json()
      })
      .then(data => { setReleases(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [])

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Changelog</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>
          What's been built and what's changed · Auto-updated from{' '}
          <a href={`https://github.com/${GITHUB_USER}/${GITHUB_REPO}/releases`} target="_blank" rel="noopener"
            style={{ color: 'var(--accent)' }}>GitHub releases</a>
        </p>
      </div>

      {loading && (
        <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          loading releases...
        </div>
      )}

      {error && (
        <div style={{ background: 'var(--danger-dim)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 12, padding: '1rem 1.25rem', fontSize: 13, color: 'var(--danger)' }}>
          Could not load releases from GitHub. <a href={`https://github.com/${GITHUB_USER}/${GITHUB_REPO}/releases`} target="_blank" rel="noopener" style={{ color: 'var(--danger)', textDecoration: 'underline' }}>View on GitHub instead →</a>
        </div>
      )}

      {!loading && !error && releases.length === 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          No releases published yet. They'll appear here automatically once published on GitHub.
        </div>
      )}

      {releases.map((release, i) => {
        const changes = parseBody(release.body)
        return (
          <div key={release.id} style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 18, fontWeight: 500 }}>{release.tag_name}</h2>
              {i === 0 && (
                <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: 'var(--accent-dim)', color: 'var(--accent)' }}>Latest</span>
              )}
              {release.prerelease && (
                <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: 'var(--warning-dim)', color: 'var(--warning)' }}>Pre-release</span>
              )}
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{formatDate(release.published_at)}</span>
              <a href={release.html_url} target="_blank" rel="noopener" style={{ fontSize: 11, color: 'var(--text-muted)' }}>GitHub ↗</a>
            </div>

            {release.name && release.name !== release.tag_name && (
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 10 }}>{release.name}</div>
            )}

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              {changes.length > 0 ? changes.map((c, ci) => {
                const cfg = typeConfig[c.type] || typeConfig.new
                return (
                  <div key={ci} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 16px', borderBottom: ci < changes.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 500, background: cfg.dim, color: cfg.color, flexShrink: 0, marginTop: 1 }}>{cfg.label}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{c.text}</span>
                  </div>
                )
              }) : (
                <div style={{ padding: '1rem 1.25rem', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                  {release.body || 'No release notes.'}
                </div>
              )}
            </div>
          </div>
        )
      })}

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem 1.5rem' }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Coming up in v3</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          AI-powered gap analysis · Email notifications · Calendar integration · Interview prep notes · Mobile app
        </div>
      </div>
    </div>
  )
}
