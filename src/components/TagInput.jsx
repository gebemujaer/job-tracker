import React, { useState, useRef, useEffect } from 'react'
import { ROLES } from '../lib/roles'

const DEFAULT_TAGS = [
  { group: 'Audience gaps', tags: ['dev-audience', 'technical-buyers', 'enterprise-buyers', 'smb-buyers'] },
  { group: 'Tool gaps', tags: ['no-salesNav', 'no-apollo', 'no-outreach', 'no-cold-call'] },
  { group: 'Risk flags', tags: ['visa-risk', 'us-timezone', 'hybrid-required', 'high-competition'] },
  { group: 'Strengths', tags: ['async-first', 'fast-learner', 'multilingual', 'remote-exp'] },
]

const STRENGTH_TAGS = ['sea-market', 'greenfield-exp', 'async-first', 'whatsapp-outreach', 'high-retention', 'quota-crusher', 'open-source-contrib', 'side-projects', 'full-stack', 'strong-portfolio', 'user-research', 'data-driven', 'fast-learner', 'multilingual', 'remote-exp', 'self-directed', 'client-skills', 'process-builder', 'delivery-focus', 'structured-thinker', 'organized', 'empathy', 'versatile']

export default function TagInput({ value = [], onChange, pastTags = [], userRole = null }) {
  const [input, setInput] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const inputRef = useRef()
  const dropdownRef = useRef()

  // Get tag groups based on user's role
  const role = ROLES.find(r => r.id === userRole)
  const tagGroups = role
    ? Object.entries(role.tags).map(([group, tags]) => ({ group, tags }))
    : DEFAULT_TAGS

  const allSuggested = tagGroups.flatMap(g => g.tags)

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const addTag = (tag) => {
    const t = tag.trim().toLowerCase().replace(/\s+/g, '-')
    if (!t || value.includes(t)) return
    onChange([...value, t])
    setInput('')
    inputRef.current?.focus()
  }
  const removeTag = (tag) => onChange(value.filter(t => t !== tag))
  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) { e.preventDefault(); addTag(input) }
    if (e.key === 'Backspace' && !input && value.length > 0) removeTag(value[value.length - 1])
    if (e.key === 'Escape') setShowDropdown(false)
  }

  const filtered = input
    ? [...allSuggested, ...pastTags].filter(t => t.includes(input.toLowerCase()) && !value.includes(t))
    : []
  const unusedPast = pastTags.filter(t => !value.includes(t) && !allSuggested.includes(t))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Gap tags {role && <span style={{ color: 'var(--accent)', fontWeight: 400 }}>({role.label})</span>}
        </label>
        <button type="button" onClick={() => setShowGuide(!showGuide)}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '50%', width: 16, height: 16, fontSize: 10, color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</button>
      </div>

      {showGuide && (
        <div style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 10, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <div style={{ fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>What are gap tags?</div>
          Short labels for gaps or risks in a job description. Powers the Gap Analysis on your dashboard — showing which gaps correlate with rejections or interviews.
          <div style={{ marginTop: 6 }}>• Click any suggested tag to add it · Type your own and press Enter</div>
          {role && <div style={{ marginTop: 4, color: 'var(--accent)', fontSize: 11 }}>Showing presets for: {role.label}</div>}
          <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>After 3+ apps, your dashboard shows patterns across your search.</div>
        </div>
      )}

      <div style={{ minHeight: 42, padding: '6px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-strong)', borderRadius: 8, display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center', cursor: 'text' }}
        onClick={() => { inputRef.current?.focus(); setShowDropdown(true) }}>
        {value.map(tag => {
          const isStrength = STRENGTH_TAGS.includes(tag)
          return (
            <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: isStrength ? 'var(--success-dim)' : 'var(--accent-dim)', color: isStrength ? 'var(--success)' : 'var(--accent)' }}>
              {tag}
              <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(tag) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 13, lineHeight: 1, padding: 0, opacity: 0.7 }}>×</button>
            </span>
          )
        })}
        <input ref={inputRef} value={input} onChange={e => { setInput(e.target.value); setShowDropdown(true) }}
          onKeyDown={handleKeyDown} onFocus={() => setShowDropdown(true)}
          placeholder={value.length === 0 ? 'Click to add tags or type your own...' : ''}
          style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: 'var(--text)', minWidth: 120, flex: 1 }} />
      </div>

      {showDropdown && (
        <div ref={dropdownRef} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 10, marginTop: 4, maxHeight: 280, overflowY: 'auto', position: 'relative', zIndex: 99 }}>
          {input && (
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>MATCHES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {filtered.slice(0, 10).map(t => <TagChip key={t} tag={t} onClick={() => addTag(t)} strength={STRENGTH_TAGS.includes(t)} />)}
                {!value.includes(input.trim().toLowerCase()) && <TagChip tag={`+ "${input}"`} onClick={() => addTag(input)} custom />}
              </div>
            </div>
          )}
          {!input && unusedPast.length > 0 && (
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6 }}>YOUR TAGS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{unusedPast.map(t => <TagChip key={t} tag={t} onClick={() => addTag(t)} />)}</div>
            </div>
          )}
          {!input && tagGroups.map(group => {
            const available = group.tags.filter(t => !value.includes(t))
            if (available.length === 0) return null
            const isStrength = group.group.toLowerCase().includes('strength')
            return (
              <div key={group.group} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: isStrength ? 'var(--success)' : 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.06em', fontWeight: 500 }}>{group.group.toUpperCase()}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{available.map(t => <TagChip key={t} tag={t} onClick={() => addTag(t)} strength={isStrength} />)}</div>
              </div>
            )
          })}
          <div style={{ padding: '8px 12px' }}><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Type your own tag and press Enter</div></div>
        </div>
      )}
    </div>
  )
}

function TagChip({ tag, onClick, strength, custom }) {
  const [hover, setHover] = useState(false)
  return (
    <button type="button" onClick={onClick} onMouseOver={() => setHover(true)} onMouseOut={() => setHover(false)}
      style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
        background: hover ? (strength ? 'var(--success)' : custom ? 'var(--info)' : 'var(--accent)') : (strength ? 'var(--success-dim)' : custom ? 'var(--info-dim)' : 'var(--accent-dim)'),
        color: hover ? 'var(--accent-text)' : (strength ? 'var(--success)' : custom ? 'var(--info)' : 'var(--accent)') }}>
      {tag}
    </button>
  )
}
