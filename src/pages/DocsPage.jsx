import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from '../lib/AuthContext'
import { getDocs, insertDoc, deleteDoc, uploadFile, deleteFile } from '../lib/supabase'

const CATEGORIES = ['Resume', 'Cover Letter', 'Portfolio', 'Reference', 'Other']

function DocCard({ doc, onDelete }) {
  const ext = doc.file_name?.split('.').pop()?.toUpperCase() || 'FILE'
  const extColors = { PDF: '#ff6b6b', DOCX: '#60a5fa', DOC: '#60a5fa', PNG: '#4ade80', JPG: '#4ade80' }
  const color = extColors[ext] || 'var(--text-muted)'

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 500, color }}>{ext}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.label || doc.file_name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          {doc.category && <span style={{ marginRight: 8 }}>{doc.category}</span>}
          {doc.created_at && <span>{new Date(doc.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <a href={doc.file_url} target="_blank" rel="noopener"
          style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-strong)', borderRadius: 7, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'none' }}>
          Open ↗
        </a>
        <button onClick={() => onDelete(doc)}
          style={{ padding: '6px 10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)' }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
          Delete
        </button>
      </div>
    </div>
  )
}

export default function DocsPage() {
  const { user } = useAuth()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState('')
  const [category, setCategory] = useState('Resume')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const fileRef = useRef()

  useEffect(() => {
    if (user) load()
  }, [user])

  const load = async () => {
    const { data } = await getDocs(user.id)
    setDocs(data || [])
    setLoading(false)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) { setError('Please select a file'); return }
    setError('')
    setUploading(true)
    try {
      const { url, path } = await uploadFile(user.id, file)
      const docData = {
        user_id: user.id,
        label: label.trim() || file.name,
        category,
        file_name: file.name,
        file_url: url,
        file_path: path,
      }
      const { data } = await insertDoc(docData)
      setDocs(prev => [data, ...prev])
      setShowForm(false)
      setLabel('')
      setFile(null)
      setCategory('Resume')
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (doc) => {
    if (!confirm(`Delete "${doc.label || doc.file_name}"?`)) return
    await deleteDoc(doc.id)
    if (doc.file_path) await deleteFile(doc.file_path)
    setDocs(prev => prev.filter(d => d.id !== doc.id))
  }

  const filtered = filterCat ? docs.filter(d => d.category === filterCat) : docs

  if (loading) return <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>loading...</div>

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500 }}>Documents</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>Resumes, cover letters, and other files</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ padding: '9px 18px', background: 'var(--accent)', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 500, color: 'var(--accent-text)', cursor: 'pointer' }}>
          + Upload file
        </button>
      </div>

      {/* Upload form */}
      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: '1.25rem' }}>Upload document</div>
          <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="form-grid">
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Label (optional)</label>
                <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Resume v3 — Bolt.new"
                  style={{ width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 13, color: 'var(--text)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg)', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 13, color: 'var(--text)', outline: 'none' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>File *</label>
              <div style={{ border: '1px dashed var(--border-strong)', borderRadius: 10, padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}
                onClick={() => fileRef.current?.click()}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📎</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {file ? <span style={{ color: 'var(--accent)' }}>{file.name}</span> : 'Click to select a file (PDF, DOCX, etc.)'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Max 10MB</div>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
              </div>
            </div>
            {error && <div style={{ padding: '8px 12px', background: 'var(--danger-dim)', borderRadius: 8, fontSize: 13, color: 'var(--danger)' }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setShowForm(false); setError(''); setFile(null) }}
                style={{ padding: '9px 20px', background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={uploading}
                style={{ padding: '9px 20px', background: 'var(--accent)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, color: 'var(--accent-text)', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
          <style>{`@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr !important; } }`}</style>
        </div>
      )}

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, border: '1px solid var(--border)', cursor: 'pointer', background: filterCat === c ? 'var(--accent-dim)' : 'transparent', color: filterCat === c ? 'var(--accent)' : 'var(--text-secondary)', borderColor: filterCat === c ? 'var(--accent)' : 'var(--border)' }}>
            {c || 'All'}
          </button>
        ))}
      </div>

      {/* Doc list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontSize: 14 }}>
          {docs.length === 0 ? 'No documents yet. Upload your resume to get started.' : 'No files in this category.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(doc => <DocCard key={doc.id} doc={doc} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  )
}
