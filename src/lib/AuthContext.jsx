import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (user) => {
    let { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!data) {
      const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User'
      const { data: newProfile } = await supabase
        .from('profiles')
        .upsert({ id: user.id, name, email: user.email, onboarded: false })
        .select().single()
      data = newProfile
    }
    setProfile(data)
    setLoading(false)
  }

  const refetchProfile = async () => {
    if (user) await fetchProfile(user)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, refetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
