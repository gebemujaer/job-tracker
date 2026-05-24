import React, { useState } from 'react'

const sections = [
  {
    title: 'Getting started',
    icon: '◈',
    content: [
      {
        q: 'How do both of us access the tracker?',
        a: 'Each person creates their own account using the sign up page. Use your own email and a password. Once you\'re both signed in, go to "Partner\'s View" to see each other\'s progress.',
      },
      {
        q: 'Is our data private?',
        a: 'Your applications and documents are linked to your account. Your partner can view your tracker from the Partner\'s View page, but cannot edit or delete your entries.',
      },
    ]
  },
  {
    title: 'Adding an application',
    icon: '◎',
    content: [
      {
        q: 'Company & Role title',
        a: 'Fill in the exact company name and role title from the job posting. Be specific — "SDR – APAC" is better than just "SDR" when you have multiple applications to the same company.',
      },
      {
        q: 'Applied date',
        a: 'The date you actually submitted the application. Auto-fills to today. Useful for tracking how long each stage takes.',
      },
      {
        q: 'Status — how to update it',
        a: `Update this every time something changes:\n• Applied — you submitted the application\n• Screening — recruiter reached out, first call booked\n• Interview — any formal interview (phone, video, take-home)\n• Offer — they sent you an offer letter\n• Rejected — they passed\n• Withdrawn — you pulled out`,
      },
      {
        q: 'Fit score (1–10)',
        a: 'Your honest assessment of how well your profile matches this role. Use the fit assessment from your career coach to fill this. A score from Claude is a good starting point — 8–10 means strong match, 5–7 means viable with gaps, below 5 means questionable.',
      },
      {
        q: 'Pay range',
        a: 'What the JD says, or your best estimate. If the JD doesn\'t list it, leave blank or write "Not listed". This helps you compare offers later.',
      },
    ]
  },
  {
    title: 'Remote-from-Indonesia risk',
    icon: '◻',
    color: '#fbbf24',
    content: [
      {
        q: '🟢 Low risk',
        a: 'The JD explicitly says non-US/EU locations are welcome. Example: "You do not need to be located in the US." Apply with confidence.',
      },
      {
        q: '🟡 Medium risk',
        a: 'The JD says "remote" but doesn\'t clarify geography. This is the most common case. Could mean US-only remote. Worth applying, but verify before investing heavily. Check the company\'s LinkedIn People tab to see where current employees are located.',
      },
      {
        q: '🔴 High risk',
        a: 'Any of: "must be authorized to work in US/EU", "US timezones required", lists a specific US state, mentions mandatory in-person offsites, or visa sponsorship not available. Apply only if you have a strong reason to believe they\'ll make an exception.',
      },
    ]
  },
  {
    title: 'Notes field — what to write',
    icon: '◦',
    content: [
      {
        q: 'What goes in Notes?',
        a: `This is your working memory for the role. Write:\n• Key gaps from your fit assessment (e.g. "dev-audience gap")\n• What you need to follow up on (e.g. "find recruiter on LinkedIn")\n• Who referred you or who you know there\n• Objections you anticipate\n• Any custom points from your cover letter worth remembering`,
      },
      {
        q: 'How detailed should notes be?',
        a: 'Short is fine. You don\'t need paragraphs. A few keywords like "Gap: no dev tools exp. Cover letter addressed it directly. Recruiter: check LinkedIn." is enough to jog your memory before a screening call.',
      },
    ]
  },
  {
    title: 'Documents',
    icon: '◇',
    content: [
      {
        q: 'What files should I upload?',
        a: 'At minimum: your current resume (PDF). Beyond that: any tailored cover letter templates, a general template, portfolio PDF, or any reference letters you have.',
      },
      {
        q: 'How do I keep track of which resume I used for which application?',
        a: 'Use descriptive labels when uploading. Instead of "resume.pdf", name it "Resume v3 — Bolt.new tweak" or "Resume — dev tools focus". That way you know exactly which version you sent to each company.',
      },
      {
        q: 'File size limit',
        a: 'Maximum 10MB per file. PDFs and Word docs are well within this. If you\'re uploading a portfolio, compress it first.',
      },
    ]
  },
]

export default function GuidePage() {
  const [open, setOpen] = useState({})
  const toggle = (key) => setOpen(o => ({ ...o, [key]: !o[key] }))

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>How to use this tracker</h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.6 }}>
          A guide for you and your partner. Covers every field, how to score risk, and what to write in notes.
        </p>
      </div>

      {/* Quick ref */}
      <div style={{ background: 'var(--accent-dim)', border: '1px solid rgba(212,245,122,0.2)', borderRadius: 14, padding: '1.25rem 1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)', letterSpacing: '0.06em', marginBottom: 10 }}>QUICK REFERENCE — REMOTE RISK</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: '🟢 Low', desc: 'JD explicitly welcomes non-US/EU' },
            { label: '🟡 Medium', desc: '"Remote" but no geography stated' },
            { label: '🔴 High', desc: 'US/EU auth required or timezone locked' },
          ].map(r => (
            <div key={r.label} style={{ flex: 1, minWidth: 160, background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>{r.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Accordion sections */}
      {sections.map((section, si) => (
        <div key={si} style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 14, color: section.color || 'var(--accent)' }}>{section.icon}</span>
            <h2 style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{section.title}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {section.content.map((item, ii) => {
              const key = `${si}-${ii}`
              const isOpen = open[key]
              return (
                <div key={ii} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                  <button onClick={() => toggle(key)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '13px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{item.q}</span>
                    <span style={{ fontSize: 14, color: 'var(--text-muted)', flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>↓</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 12, whiteSpace: 'pre-line' }}>{item.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Tip */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem 1.5rem', marginTop: '0.5rem' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.06em', marginBottom: 8 }}>PRO TIP</div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          When you paste a job description to your career coach (Claude) and get a fit assessment back, copy the score directly into the Fit Score field and paste the key gaps into Notes. It takes 20 seconds and keeps everything in one place — so when a recruiter calls, you already know your own weak points for that role.
        </p>
      </div>
    </div>
  )
}
