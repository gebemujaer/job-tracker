import React, { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { getFriends, sendFriendRequest, respondToRequest, removeFriend, searchUsers } from '../lib/supabase'

export default function FriendsPage() {
  const { user } = useAuth()
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { if (user) load() }, [user])

  const load = async () => {
    try {
      const { data } = await getFriends(user.id)
      setFriends((data || []).filter(f => f && f.status))
    } catch(e) { setFriends([]) }
    setLoading(false)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)
    const { data } = await searchUsers(searchQuery)
    setSearchResults((data || []).filter(u => u.id !== user.id))
    setSearching(false)
  }

  const handleSendRequest = async (toUserId) => {
    const existing = friends.find(f => f.from_user_id === toUserId || f.to_user_id === toUserId)
    if (existing) { setMsg('Already connected or request pending'); return }
    await sendFriendRequest(user.id, toUserId)
    setMsg('Friend request sent!')
    load()
    setTimeout(() => setMsg(''), 3000)
  }

  const handleRespond = async (id, status) => {
    await respondToRequest(id, status)
    load()
  }

  const handleRemove = async (id) => {
    if (!confirm('Remove this connection?')) return
    await removeFriend(id)
    load()
  }

  const accepted = friends.filter(f => f && f.status === 'accepted')
  const pending = friends.filter(f => f && f.status === 'pending')
  const incoming = pending.filter(f => f.to_user_id === user.id)
  const outgoing = pending.filter(f => f.from_user_id === user.id)

  const getFriendProfile = (f) => f.from_user_id === user.id ? f.to_profile : f.from_profile
  const getInitials = (name) => (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  if (loading) return <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>loading...</div>

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 500 }}>Friends</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>Connect with friends to view each other's progress</p>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: '1rem' }}>Add a friend by email</div>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by email address..."
            style={{ flex: 1, padding: '9px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 13, color: 'var(--text)', outline: 'none' }} />
          <button type="submit" disabled={searching} style={{ padding: '9px 18px', background: 'var(--accent)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, color: 'var(--accent-text)', cursor: 'pointer' }}>
            {searching ? '...' : 'Search'}
          </button>
        </form>
        {msg && <div style={{ marginTop: 10, fontSize: 13, color: 'var(--success)' }}>{msg}</div>}
        {searchResults.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {searchResults.map(u => {
              const alreadyFriend = friends.some(f => f.from_user_id === u.id || f.to_user_id === u.id)
              return (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg-hover)', borderRadius: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: 'var(--accent)' }}>
                    {getInitials(u.name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{u.name || 'Unknown'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                  <button onClick={() => handleSendRequest(u.id)} disabled={alreadyFriend}
                    style={{ padding: '6px 14px', background: alreadyFriend ? 'transparent' : 'var(--accent)', border: alreadyFriend ? '1px solid var(--border)' : 'none', borderRadius: 7, fontSize: 12, fontWeight: 500, color: alreadyFriend ? 'var(--text-muted)' : 'var(--accent-text)', cursor: alreadyFriend ? 'not-allowed' : 'pointer' }}>
                    {alreadyFriend ? 'Already connected' : 'Add friend'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {incoming.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(212,245,122,0.2)', borderRadius: 14, padding: '1.5rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent)', marginBottom: '1rem' }}>Pending requests ({incoming.length})</div>
          {incoming.map(f => {
            const p = f.from_profile
            return (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: 'var(--accent)' }}>{getInitials(p?.name)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{p?.name || 'Unknown'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p?.email}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleRespond(f.id, 'accepted')} style={{ padding: '6px 12px', background: 'var(--accent)', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 500, color: 'var(--accent-text)', cursor: 'pointer' }}>Accept</button>
                  <button onClick={() => handleRespond(f.id, 'declined')} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>Decline</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1.5rem' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.04em' }}>CONNECTED ({accepted.length})</div>
        {accepted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: 13 }}>No friends connected yet.</div>
        ) : accepted.map(f => {
          const p = getFriendProfile(f)
          return (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: 'var(--accent)' }}>{getInitials(p?.name)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{p?.name || 'Unknown'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p?.email}</div>
              </div>
              <button onClick={() => handleRemove(f.id)} style={{ padding: '5px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>Remove</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
