import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { signOut } from '../lib/supabase'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◈', end: true },
  { to: '/tracker', label: 'Applications', icon: '◎' },
  { to: '/docs', label: 'Documents', icon: '◻' },
  { to: '/partner', label: "Partner's View", icon: '◇' },
  { to: '/guide', label: 'How to Use', icon: '◦' },
]

export default function Layout() {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const name = profile?.name || user?.email?.split('@')[0] || 'You'
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:40 }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0, background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '1.5rem 0',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        transform: mobileOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.2s ease',
      }}
      className="sidebar"
      >
        {/* Logo */}
        <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 4 }}>JOB TRACKER</div>
          <div style={{ fontWeight: 500, fontSize: 15, color: 'var(--text)' }}>Gabriel & Partner</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                borderRadius: 8, fontSize: 14, fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                transition: 'all 0.15s',
              })}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-dim)',
              border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 500, color: 'var(--accent)', flexShrink: 0,
            }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={handleSignOut} style={{
            width: '100%', padding: '7px 0', background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', transition: 'all 0.15s',
          }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >Sign out</button>
        </div>
      </aside>

      {/* Mobile header */}
      <header style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, height: 52,
        background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', zIndex: 30,
      }} className="mobile-header">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)', letterSpacing: '0.05em' }}>JOB TRACKER</div>
        <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 20, padding: 4 }}>☰</button>
      </header>

      {/* Main */}
      <main style={{ flex: 1, marginLeft: 220, minHeight: '100vh', padding: '2rem' }} className="main-content">
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .mobile-header { display: flex !important; }
          .main-content { margin-left: 0 !important; padding: 1rem !important; padding-top: 68px !important; }
        }
      `}</style>
    </div>
  )
}
