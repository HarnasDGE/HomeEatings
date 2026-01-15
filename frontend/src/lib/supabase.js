import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not configured. Authentication features will be disabled.')
  console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.')
} else {
  // Check if the anon key looks valid (should be a long JWT starting with 'eyJ')
  if (!supabaseAnonKey.startsWith('eyJ')) {
    console.error('⚠️ VITE_SUPABASE_ANON_KEY appears to be invalid!')
    console.error('Expected a JWT token starting with "eyJ", but got:', supabaseAnonKey.substring(0, 20) + '...')
    console.error('Please get the correct "anon" or "service_role" key from your Supabase project settings.')
    console.error('Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api')
  }

  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    supabase = null
  }
}

export { supabase }
