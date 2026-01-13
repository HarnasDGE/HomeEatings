import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If Supabase is not configured, skip authentication
    if (!supabase) {
      console.warn('Supabase not configured - running in offline mode')
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        await loadProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
      }

      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signInWithEmail = async (email, password) => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not configured') }
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUpWithEmail = async (email, password, fullName) => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not configured') }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not configured') }
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
    return { data, error }
  }

  const signInWithApple = async () => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not configured') }
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    if (!supabase) {
      return { error: new Error('Supabase not configured') }
    }
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const updateProfile = async (updates) => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not configured') }
    }
    if (!user) return { error: new Error('No user logged in') }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (!error && data) {
      setProfile(data)
    }

    return { data, error }
  }

  const uploadAvatar = async (file) => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not configured') }
    }
    if (!user) return { error: new Error('No user logged in') }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) {
      return { error: uploadError }
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return { data: urlData.publicUrl, error: null }
  }

  const value = {
    user,
    profile,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    signOut,
    updateProfile,
    uploadAvatar,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
