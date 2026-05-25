import React, { useState } from 'react'

const sections = [
  {
    title: 'Getting started',
    icon: '◈',
    content: [
      {
        q: 'How do both of us access the tracker?',
        a: 'Each person creates their own account using the sign up page. Use your own email and password. Once signed up, go to Friends to connect with each other, then use Partner\'s View to see each other\'s progress.',
      },
      {
        q: 'How do I set up my profile?',
        a: 'Go to your profile (click your name in the sidebar). Set your job search focus (e.g. Tech Sales, Engineering, Design) and your country. This personalizes your tag suggestions and the remote work risk guidance.',
      },
      {
        q: 'Is my data private?',
        a: 'Yes. Your applications and documents are linked only to your account. Only friends you explicitly connect with can view your tracker — and they can view, not edit or delete.',
      },
    ]
  },
  {
    title: 'Adding an application',
    icon: '◎',
    content: [
      {
        q: 'Company & Role title',
        a: 'Use the exact company name and role title from the job posting. Be specific — "SDR – APAC" is better than just "SDR" when applying to the same company for multiple roles.',
      },
      {
        q: 'Applied date',
        a: 'The date you actually submitted. Auto-fills to today. Useful for tracking how long each stage takes and for identifying when you\'ve been ghosted.',
      },
      {
        q: 'Follow-up date',
        a: 'Set a date to follow up with the recruiter or hiring manager. The tracker will alert you when it\'s due. Good practice: set follow-up 5-7 business days after applying or after each interview.',
      },
      {
        q: 'Status — how to update it',
        a: 'Click the status badge directly on the application card to change it without opening the full edit form. Options:\n• Applied — submitted the application\n• Screening — recruiter reached out\n• Interview — any formal interview stage\n• Offer — received an offer letter\n• Rejected — passed on\n• Ghosted — applied, no response after 14+ days\n• MIA — had contact, then went silent\n• Withdrawn — you pulled out',
      },
      {
        q: 'Fit score (1.0–10.0)',
        a: 'Your honest assessment of how well your profile matches this role. Decimals supported (e.g. 8.5). The dashboard shows whether high-fit applications actually convert better than low-fit ones.',
      },
      {
        q: 'Pay range',
        a: 'What the job description says, or your best estimate. If not listed, write "Not listed". Helps you compare across applications and remember what you\'d be walking into.',
      },
    ]
  },
  {
    title: 'Remote work risk',
    icon: '◻',
    content: [
      {
        q: 'What does remote work risk mean?',
        a: 'For job seekers applying from outside the US/EU, many "remote" roles are actually US/EU-only. This field helps you flag which applications are risky before you invest heavily in them.',
      },
      {
        q: '🟢 Low risk',
        a: 'The job description explicitly says non-US/EU locations are welcome. Example: "You do not need to be located in the US." Apply with full confidence.',
      },
      {
        q: '🟡 Medium risk',
        a: 'The JD says "remote" but doesn\'t clarify geography. This is the most common case. Worth applying, but verify before investing heavily. Check the company\'s LinkedIn People tab to see where current employees are located.',
      },
      {
        q: '🔴 High risk',
        a: 'Any of: "must be authorized to work in US/EU", specific US state listed, "US timezones required", mandatory in-person requirements, or visa sponsorship not available.',
      },
    ]
  },
  {
    title: 'Gap tags',
    icon: '◦',
    content: [
      {
        q: 'What are gap tags?',
        a: 'Short labels for gaps, risks, or strengths you notice in a job description. They power the Gap Analysis on your dashboard — showing which gaps appear most often and which correlate with rejections or interviews.',
      },
      {
        q: 'How to use them',
        a: 'Click the tag field to open a dropdown with suggested tags based on your role. Click any tag to add it. Type your own and press Enter. Your previously used tags appear at the top for consistency.',
      },
      {
        q: 'Gap tags vs strength tags',
        a: 'Gap tags (shown in green/yellow) mark weaknesses — things the JD requires that you lack. Strength tags (shown in green) mark your advantages. Both are useful: gaps tell you where you\'re vulnerable, strengths tell you why you\'re a fit.',
      },
      {
        q: 'How many should I add?',
        a: 'Aim for 3-7 per application. The goal is pattern recognition over time — if "no-salesNav" appears on 10 applications and 8 reject you, that\'s a clear signal to address it.',
      },
    ]
  },
  {
    title: 'Documents',
    icon: '◇',
    content: [
      {
        q: 'What files should I upload?',
        a: 'At minimum: your current resume (PDF). Beyond that: tailored cover letter templates, a general cover letter, portfolio PDF, or reference letters.',
      },
      {
        q: 'How do I track which resume I used?',
        a: 'Use descriptive labels when uploading. Instead of "resume.pdf", use "Resume v3 — tailored for dev tools" or "Resume — March 2026 update". Then select it in the Resume Used field when adding an application.',
      },
      {
        q: 'Resume performance on the dashboard',
        a: 'Once you\'ve linked resumes to applications, the dashboard shows which version gets the most interviews. This helps you identify which version to default to.',
      },
    ]
  },
  {
    title: 'Partner\'s View & Friends',
    icon: '⊕',
    content: [
      {
        q: 'How do I connect with someone?',
        a: 'Go to Friends → search by their email address → send a request. They need to accept before you can see each other\'s trackers. A badge on the Friends link shows pending incoming requests.',
      },
      {
        q: 'What can my partner see?',
        a: 'They can see your applications (company, role, status, fit score, tags, applied date) and your stats (total, active, interviews, offers). They cannot edit or delete anything.',
      },
      {
        q: 'Can I remove someone?',
        a: 'Yes — go to Friends and click Remove next to their name. They\'ll no longer see your tracker.',
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
          A guide for you and your friends. Covers every field and feature.
        </p>
      </div>

      {/* Quick ref */}
      <div style={{ background: 'var(--accent-dim)', border: '1px solid rgba(212,245,122,0.2)', borderRadius: 14, padding: '1.25rem 1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)', letterSpacing: '0.06em', marginBottom: 10 }}>QUICK REFERENCE — REMOTE WORK RISK</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: '🟢 Low', desc: 'JD explicitly welcomes your location' },
            { label: '🟡 Medium', desc: '"Remote" but no geography stated' },
            { label: '🔴 High', desc: 'Local auth required or timezone locked' },
          ].map(r => (
            <div key={r.label} style={{ flex: 1, minWidth: 150, background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 12px' }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>{r.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {sections.map((section, si) => (
        <div key={si} style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 14, color: 'var(--accent)' }}>{section.icon}</span>
            <h2 style={{ fontSize: 15, fontWeight: 500 }}>{section.title}</h2>
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

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.25rem 1.5rem', marginTop: '0.5rem' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.06em', marginBottom: 8 }}>PRO TIP</div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          When you get a fit assessment for a role, copy the score into Fit Score and paste the key gaps into Gap Tags. It takes 20 seconds and after 5+ applications your dashboard gap analysis becomes genuinely actionable — showing exactly which gaps are costing you interviews.
        </p>
      </div>
    </div>
  )
}
