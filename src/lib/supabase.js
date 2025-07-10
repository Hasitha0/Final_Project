import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ovjjujxnxlxqcjhnnmbs.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92amp1anhueGx4cWNqaG5ubWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MDkyMDQsImV4cCI6MjA2NTM4NTIwNH0.r4Q4jYSJ5IuX3z741lP9gHlO3bL5q8UVnVrjuKsF2N0'

// Create Supabase client without auth (since we're using our own auth system)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
})

export default supabase 