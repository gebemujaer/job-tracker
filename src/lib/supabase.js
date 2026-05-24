import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Auth helpers
export const signUp = (email, password, name) =>
  supabase.auth.signUp({ email, password, options: { data: { name } } })

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password })

export const signOut = () => supabase.auth.signOut()

export const getUser = () => supabase.auth.getUser()

// Applications
export const getApplications = (userId) =>
  supabase.from('applications').select('*').eq('user_id', userId).order('created_at', { ascending: false })

export const insertApplication = (data) =>
  supabase.from('applications').insert(data).select().single()

export const updateApplication = (id, data) =>
  supabase.from('applications').update(data).eq('id', id).select().single()

export const deleteApplication = (id) =>
  supabase.from('applications').delete().eq('id', id)

// Profiles
export const getProfile = (userId) =>
  supabase.from('profiles').select('*').eq('id', userId).single()

export const getAllProfiles = () =>
  supabase.from('profiles').select('id, name, avatar_url')

// Docs
export const getDocs = (userId) =>
  supabase.from('docs').select('*').eq('user_id', userId).order('created_at', { ascending: false })

export const insertDoc = (data) =>
  supabase.from('docs').insert(data).select().single()

export const deleteDoc = (id) =>
  supabase.from('docs').delete().eq('id', id)

// File storage
export const uploadFile = async (userId, file) => {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}_${file.name}`
  const { data, error } = await supabase.storage.from('docs').upload(path, file)
  if (error) throw error
  const { data: urlData } = supabase.storage.from('docs').getPublicUrl(path)
  return { path, url: urlData.publicUrl }
}

export const deleteFile = (path) =>
  supabase.storage.from('docs').remove([path])
