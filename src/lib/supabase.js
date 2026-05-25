import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, storageKey: 'job-tracker-auth' }
})

// Auth
export const signUp = (email, password, name) =>
  supabase.auth.signUp({ email, password, options: { data: { name } } })

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signOut = () => supabase.auth.signOut()

// Applications
export const getApplications = (userId) =>
  supabase.from('applications').select('*').eq('user_id', userId).order('created_at', { ascending: false })

export const insertApplication = (data) =>
  supabase.from('applications').insert(data).select().single()

export const updateApplication = (id, data) =>
  supabase.from('applications').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single()

export const deleteApplication = (id) =>
  supabase.from('applications').delete().eq('id', id)

// Profiles
export const getProfile = (userId) =>
  supabase.from('profiles').select('*').eq('id', userId).single()

export const updateProfile = (userId, data) =>
  supabase.from('profiles').update(data).eq('id', userId)

// Friends
export const getFriends = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('*')
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    if (error) return { data: [], error }
    const enriched = await Promise.all((data || []).map(async (req) => {
      const [from, to] = await Promise.all([
        supabase.from('profiles').select('id,name,email').eq('id', req.from_user_id).single(),
        supabase.from('profiles').select('id,name,email').eq('id', req.to_user_id).single(),
      ])
      return { ...req, from_profile: from.data || null, to_profile: to.data || null }
    }))
    return { data: enriched.filter(Boolean), error: null }
  } catch(e) {
    return { data: [], error: e }
  }
}

export const sendFriendRequest = (fromUserId, toUserId) =>
  supabase.from('friend_requests').insert({ from_user_id: fromUserId, to_user_id: toUserId }).select().single()

export const respondToRequest = (id, status) =>
  supabase.from('friend_requests').update({ status }).eq('id', id)

export const removeFriend = (id) =>
  supabase.from('friend_requests').delete().eq('id', id)

export const searchUsers = (query) =>
  supabase.from('profiles').select('id, name, email').ilike('email', `%${query}%`).limit(5)

// Docs
export const getDocs = (userId) =>
  supabase.from('docs').select('*').eq('user_id', userId).order('created_at', { ascending: false })

export const insertDoc = (data) =>
  supabase.from('docs').insert(data).select().single()

export const deleteDoc = (id) =>
  supabase.from('docs').delete().eq('id', id)

// File storage
export const uploadFile = async (userId, file) => {
  const path = `${userId}/${Date.now()}_${file.name}`
  const { error } = await supabase.storage.from('docs').upload(path, file)
  if (error) throw error
  const { data: signed } = await supabase.storage.from('docs').createSignedUrl(path, 60 * 60 * 24 * 365)
  return { path, url: signed.signedUrl }
}

export const deleteFile = (path) =>
  supabase.storage.from('docs').remove([path])

// Get docs for dropdown in application form
export const getDocsByCategory = (userId, categories) =>
  supabase.from('docs').select('id, label, file_name, category').eq('user_id', userId).in('category', categories).order('created_at', { ascending: false })
