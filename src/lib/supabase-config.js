import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_PROJECT_ID = 'ovjjujxnxlxqcjhnnmbs';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92amp1anhueGx4cWNqaG5ubWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MDkyMDQsImV4cCI6MjA2NTM4NTIwNH0.r4Q4jYSJ5IuX3z741lP9gHlO3bL5q8UVnVrjuKsF2N0';

// Create Supabase client
export const createSupabaseClient = () => {
  const supabaseUrl = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
  
  const client = createClient(supabaseUrl, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'ecotech-web-app'
      }
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });
  
  return client;
};

 