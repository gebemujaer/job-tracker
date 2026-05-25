import React from 'react'

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Terms & Privacy</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>Last updated: May 2026</p>
      </div>

      {[
        {
          title: 'What this app is',
          content: `This is a personal job application tracker built for a small group of users. It is not a commercial product. It is provided as-is, with no guarantees of uptime, data retention, or feature completeness.`
        },
        {
          title: 'What data we store',
          content: `We store the information you enter: your name, email address, job applications (company, role, status, notes, tags), and files you upload (resumes, cover letters). This data is stored in Supabase, a third-party database provider based in the United States.`
        },
        {
          title: 'Who can see your data',
          content: `Your job applications and documents are private to your account by default. You choose who can see your tracker by connecting with friends using the Friends system. Only accepted connections can view your applications. No one else can access your data.`
        },
        {
          title: 'Passwords and security',
          content: `Passwords are never stored in plain text. Authentication is handled by Supabase Auth, which uses industry-standard encryption. We recommend using a strong, unique password. We do not have access to your password.`
        },
        {
          title: 'File storage',
          content: `Files you upload are stored in Supabase Storage and are accessible only through time-limited signed URLs. Files are not publicly browsable. You can delete your files at any time from the Documents page.`
        },
        {
          title: 'Data deletion',
          content: `You can delete your applications and documents at any time from within the app. If you want your account and all associated data permanently deleted, contact the app administrator directly.`
        },
        {
          title: 'Third-party services',
          content: `This app uses Supabase (database and storage) and Vercel (hosting). Both are reputable providers with their own privacy policies. We do not use any analytics, advertising, or tracking tools.`
        },
        {
          title: 'Changes to this policy',
          content: `If anything changes, the changelog page will reflect it. We will not make changes that reduce your privacy without notice.`
        },
        {
          title: 'Contact',
          content: `Questions or concerns? Reach out directly to gabrielalfarizie@gmail.com.`
        },
      ].map((section, i) => (
        <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', marginBottom: 10 }}>
          <h2 style={{ fontSize: 14, fontWeight: 500, marginBottom: 10, color: 'var(--text)' }}>{section.title}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{section.content}</p>
        </div>
      ))}
    </div>
  )
}
