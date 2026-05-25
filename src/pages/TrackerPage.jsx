import React, { useEffect, useState } from "react"
import { useAuth } from "../lib/AuthContext"
import { getApplications, insertApplication, updateApplication, deleteApplication, supabase } from "../lib/supabase"
import TagInput from "../components/TagInput"

const STATUS_CONFIG = {
  applied:   { label: "Applied",   color: "var(--info)",    dim: "var(--info-dim)" },
  screening: { label: "Screening", color: "var(--warning)", dim: "var(--warning-dim)" },
  interview: { label: "Interview", color: "var(--accent)",  dim: "var(--accent-dim)" },
  offer:     { label: "Offer",     color: "var(--success)", dim: "var(--success-dim)" },
  rejected:  { label: "Rejected",  color: "var(--danger)",  dim: "var(--danger-dim)" },
  ghosted:   { label: "Ghosted",   color: "var(--ghost)",   dim: "var(--ghost-dim)" },
  mia:       { label: "MIA",       color: "var(--ghost)",   dim: "var(--ghost-dim)" },
  withdrawn: { label: "Withdrawn", color: "var(--text-muted)", dim: "rgba(85,85,85,0.15)" },
}
const RISK_CONFIG = {
  low:    { label: "Low",     color: "var(--success)" },
  medium: { label: "Med",     color: "var(--warning)" },
  high:   { label: "High",    color: "var(--danger)" },
}
const SORT_OPTIONS = [
  { value: "created_at_desc", label: "Newest first" },
  { value: "created_at_asc",  label: "Oldest first" },
  { value: "fit_desc",        label: "Fit score high" },
  { value: "fit_asc",         label: "Fit score low" },
  { value: "company_asc",     label: "Company A-Z" },
]
const STALE_DAYS = 14
const EMPTY_FORM = { company: "", role: "", location: "", applied_date: new Date().toISOString().split("T")[0], follow_up_date: "", status: "applied", fit_score_decimal: "", pay_range: "", remote_risk: "", notes: "", tags: [], job_url: "", contact: "", resume_label: "", cover_letter_label: "" }

function daysSince(d) { if (!d) return null; return Math.floor((Date.now() - new Date(d).getTime()) / 86400000) }
function daysUntil(d) { if (!d) return null; return Math.floor((new Date(d).getTime() - Date.now()) / 86400000) }

const inputCss = { width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-strong)", borderRadius: 8, fontSize: 13, color: "var(--text)", outline: "none" }
const selectCss = { width: "100%", padding: "9px 12px", background: "var(--bg)", border: "1px solid var(--border-strong)", borderRadius: 8, fontSize: 13, color: "var(--text)", outline: "none" }

function Field({ label, children }) {
  return React.createElement("div", null,
    React.createElement("label", { style: { display: "block", fontSize: 11, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 5, letterSpacing: "0.06em", textTransform: "uppercase" } }, label),
    children
  )
}

function NoteModal({ app, onClose }) {
  if (!app) return null
  return React.createElement("div", { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }, onClick: onClose },
    React.createElement("div", { style: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.5rem", maxWidth: 560, width: "100%", maxHeight: "80vh", overflow: "auto" }, onClick: e => e.stopPropagation() },
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "1rem" } },
        React.createElement("div", null,
          React.createElement("div", { style: { fontSize: 16, fontWeight: 500 } }, app.company),
          React.createElement("div", { style: { fontSize: 13, color: "var(--text-secondary)" } }, app.role)
        ),
        React.createElement("button", { onClick: onClose, style: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18 } }, "x")
      ),
      app.notes ? React.createElement("p", { style: { fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" } }, app.notes)
               : React.createElement("p", { style: { fontSize: 14, color: "var(--text-muted)", fontStyle: "italic" } }, "No notes added yet.")
    )
  )
}

export default function TrackerPage() {
  const { user } = useAuth()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterRisk, setFilterRisk] = useState("")
  const [sortBy, setSortBy] = useState("created_at_desc")
  const [noteModal, setNoteModal] = useState(null)
  const [exportMsg, setExportMsg] = useState("")
  const [userDocs, setUserDocs] = useState([])
  const [pastTags, setPastTags] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!user) return
    getApplications(user.id).then(({ data }) => { setApps(data || []); setLoading(false) })
    supabase.from("docs").select("id, label, file_name, category").eq("user_id", user.id).in("category", ["Resume", "Cover Letter"]).then(({ data }) => setUserDocs(data || []))
    supabase.from("applications").select("tags").eq("user_id", user.id).then(({ data }) => {
      const all = (data || []).flatMap(a => Array.isArray(a.tags) ? a.tags : [])
      setPastTags([...new Set(all)].filter(Boolean))
    })
  }, [user])

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openAdd = () => { setForm(EMPTY_FORM); setEditing(null); setShowForm(true) }
  const openEdit = (app) => {
    setForm({ ...app, tags: Array.isArray(app.tags) ? app.tags : [], fit_score_decimal: app.fit_score_decimal || app.fit_score || "", resume_label: app.resume_label || "", cover_letter_label: app.cover_letter_label || "" })
    setEditing(app); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.company.trim() || !form.role.trim()) return
    setSaving(true)
    try {
      const payload = { ...form, tags: Array.isArray(form.tags) ? form.tags : [], fit_score_decimal: form.fit_score_decimal ? parseFloat(form.fit_score_decimal) : null, user_id: user.id }
      if (editing) {
        const { data } = await updateApplication(editing.id, payload)
        setApps(prev => prev.map(a => a.id === editing.id ? data : a))
      } else {
        const { data } = await insertApplication(payload)
        setApps(prev => [data, ...prev])
      }
      setShowForm(false); setEditing(null)
    } catch(err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm("Remove this application?")) return
    await deleteApplication(id)
    setApps(prev => prev.filter(a => a.id !== id))
  }

  const handleQuickStatus = async (id, status) => {
    await updateApplication(id, { status })
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const exportCSV = () => {
    const headers = ["Company","Role","Location","Applied","Status","Fit","Pay","Risk","Tags","Notes"]
    const rows = apps.map(a => [a.company, a.role, a.location, a.applied_date, a.status, a.fit_score_decimal||a.fit_score, a.pay_range, a.remote_risk, Array.isArray(a.tags)?a.tags.join(";"):a.tags, a.notes].map(v => `"${(v||"").toString().replace(/"/g,"")}"`) )
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = "applications.csv"; a.click()
    setExportMsg("Exported!"); setTimeout(() => setExportMsg(""), 2000)
  }

  const staleApps = apps.filter(a => a.status === "applied" && daysSince(a.applied_date) >= STALE_DAYS)
  const followUps = apps.filter(a => a.follow_up_date && daysUntil(a.follow_up_date) <= 2 && daysUntil(a.follow_up_date) >= -1 && !["rejected","ghosted","mia","withdrawn","offer"].includes(a.status))

  let filtered = apps.filter(a => {
    const s = search.toLowerCase()
    return (!s || a.company?.toLowerCase().includes(s) || a.role?.toLowerCase().includes(s) || (Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase().includes(s))))
      && (!filterStatus || a.status === filterStatus)
      && (!filterRisk || a.remote_risk === filterRisk)
  })
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "created_at_desc") return new Date(b.created_at) - new Date(a.created_at)
    if (sortBy === "created_at_asc") return new Date(a.created_at) - new Date(b.created_at)
    if (sortBy === "fit_desc") return (b.fit_score_decimal||b.fit_score||0) - (a.fit_score_decimal||a.fit_score||0)
    if (sortBy === "fit_asc") return (a.fit_score_decimal||a.fit_score||0) - (b.fit_score_decimal||b.fit_score||0)
    if (sortBy === "company_asc") return a.company?.localeCompare(b.company)
    return 0
  })

  const resumes = userDocs.filter(d => d.category === "Resume")
  const coverLetters = userDocs.filter(d => d.category === "Cover Letter")

  if (loading) return React.createElement("div", { style: { color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: 13 } }, "loading...")

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <NoteModal app={noteModal} onClose={() => setNoteModal(null)} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500 }}>Applications</h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 3 }}>{apps.length} total · {apps.filter(a => ["applied","screening","interview"].includes(a.status)).length} active</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportCSV} style={{ padding: "9px 14px", background: "transparent", border: "1px solid var(--border)", borderRadius: 9, fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>{exportMsg || "CSV"}</button>
          <button onClick={openAdd} style={{ padding: "9px 18px", background: "var(--accent)", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 500, color: "var(--accent-text)", cursor: "pointer" }}>+ Add application</button>
        </div>
      </div>

      {staleApps.length > 0 && (
        <div style={{ background: "var(--ghost-dim)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1rem" }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ghost)", marginBottom: 8 }}>Likely ghosted: {staleApps.length} app{staleApps.length>1?"s":""}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {staleApps.map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "5px 10px" }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{a.company} {daysSince(a.applied_date)}d</span>
                <button onClick={() => handleQuickStatus(a.id, "ghosted")} style={{ fontSize: 11, background: "var(--ghost-dim)", border: "none", borderRadius: 4, color: "var(--ghost)", cursor: "pointer", padding: "2px 6px" }}>Mark ghosted</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {followUps.length > 0 && (
        <div style={{ background: "var(--warning-dim)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 12, padding: "0.75rem 1.25rem", marginBottom: "1rem", fontSize: 13, color: "var(--warning)" }}>
          Follow-up due: {followUps.map(a => a.company).join(", ")}
        </div>
      )}

      {showForm && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: "1.25rem" }}>{editing ? "Edit application" : "New application"}</div>
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Company *"><input value={form.company} onChange={e => setF("company", e.target.value)} placeholder="e.g. Notion" style={inputCss} required /></Field>
              <Field label="Role *"><input value={form.role} onChange={e => setF("role", e.target.value)} placeholder="e.g. SDR" style={inputCss} required /></Field>
              <Field label="Location"><input value={form.location} onChange={e => setF("location", e.target.value)} placeholder="e.g. Remote (US)" style={inputCss} /></Field>
              <Field label="Applied date"><input type="date" value={form.applied_date} onChange={e => setF("applied_date", e.target.value)} style={inputCss} /></Field>
              <Field label="Follow-up date"><input type="date" value={form.follow_up_date||""} onChange={e => setF("follow_up_date", e.target.value)} style={inputCss} /></Field>
              <Field label="Status"><select value={form.status} onChange={e => setF("status", e.target.value)} style={selectCss}>{Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}</select></Field>
              <Field label="Fit score (1-10)"><input type="number" step="0.1" min="1" max="10" value={form.fit_score_decimal} onChange={e => setF("fit_score_decimal", e.target.value)} placeholder="e.g. 8.5" style={inputCss} /></Field>
              <Field label="Pay range"><input value={form.pay_range} onChange={e => setF("pay_range", e.target.value)} placeholder="e.g. $60-80k" style={inputCss} /></Field>
              <Field label="Remote work risk"><select value={form.remote_risk} onChange={e => setF("remote_risk", e.target.value)} style={selectCss}><option value="">Not set</option><option value="low">Low - remote friendly</option><option value="medium">Medium - unclear</option><option value="high">High - local only</option></select></Field>
              <Field label="Job URL"><input type="url" value={form.job_url} onChange={e => setF("job_url", e.target.value)} placeholder="https://..." style={inputCss} /></Field>
              <Field label="Contact"><input value={form.contact} onChange={e => setF("contact", e.target.value)} placeholder="Name or LinkedIn" style={inputCss} /></Field>
              <Field label="Resume used"><select value={form.resume_label} onChange={e => setF("resume_label", e.target.value)} style={selectCss}><option value="">None</option>{resumes.map(d => <option key={d.id} value={d.label||d.file_name}>{d.label||d.file_name}</option>)}</select></Field>
              <Field label="Cover letter used"><select value={form.cover_letter_label} onChange={e => setF("cover_letter_label", e.target.value)} style={selectCss}><option value="">None</option>{coverLetters.map(d => <option key={d.id} value={d.label||d.file_name}>{d.label||d.file_name}</option>)}</select></Field>
            </div>
            <TagInput value={form.tags} onChange={tags => setF("tags", tags)} pastTags={pastTags} />
            <Field label="Notes"><textarea value={form.notes} onChange={e => setF("notes", e.target.value)} placeholder="Key gaps, follow-up actions..." style={{ ...inputCss, minHeight: 80, resize: "vertical" }} /></Field>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} style={{ padding: "9px 20px", background: "transparent", border: "1px solid var(--border-strong)", borderRadius: 8, fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ padding: "9px 20px", background: "var(--accent)", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "var(--accent-text)", cursor: saving?"not-allowed":"pointer", opacity: saving?0.7:1 }}>{saving?"Saving...":"Save"}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ flex: 1, minWidth: 160, padding: "8px 12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text)", outline: "none" }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "8px 12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text)" }}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} style={{ padding: "8px 12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text)" }}>
          <option value="">All risk levels</option>
          <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "8px 12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text)" }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", fontSize: 14 }}>{apps.length === 0 ? "No applications yet. Add your first one!" : "No results."}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map(app => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied
            const risk = app.remote_risk ? RISK_CONFIG[app.remote_risk] : null
            const fit = app.fit_score_decimal || app.fit_score
            const isStale = app.status === "applied" && daysSince(app.applied_date) >= STALE_DAYS
            return (
              <div key={app.id} style={{ background: "var(--bg-card)", border: `1px solid ${isStale?"rgba(167,139,250,0.2)":"var(--border)"}`, borderRadius: 12, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 500 }}>{app.company}</span>
                    {app.job_url && <a href={app.job_url} target="_blank" rel="noopener" style={{ fontSize: 11, color: "var(--accent)" }}>link</a>}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{app.role}{app.location?` · ${app.location}`:""}</div>
                  {app.tags?.length > 0 && (
                    <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                      {app.tags.map(t => <span key={t} style={{ fontSize: 10, padding: "1px 7px", background: "var(--accent-dim)", borderRadius: 20, color: "var(--accent)" }}>{t}</span>)}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flexShrink: 0 }}>
                  {app.applied_date && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{app.applied_date?.slice(5)}</span>}
                  {fit && <span style={{ fontSize: 12, fontWeight: 500, color: fit>=8?"var(--success)":fit>=6?"var(--warning)":"var(--danger)" }}>{fit}/10</span>}
                  {risk && <span style={{ fontSize: 11, color: risk.color, fontWeight: 500 }}>{risk.label}</span>}
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: cfg.dim, color: cfg.color }}>{cfg.label}</span>
                  <button onClick={() => setNoteModal(app)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, padding: "4px 6px" }}>note</button>
                  <button onClick={() => openEdit(app)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, padding: "4px 6px" }}>edit</button>
                  <button onClick={() => handleDelete(app.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, padding: "4px 6px" }}>del</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}