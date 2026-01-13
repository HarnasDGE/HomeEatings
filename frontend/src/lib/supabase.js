import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not configured. Authentication features will be disabled.')
  console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.')
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }
