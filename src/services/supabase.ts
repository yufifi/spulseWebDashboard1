import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vokjwwivvluuqsesodyi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZva2p3d2l2dmx1dXFzZXNvZHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc4MTAxNzYsImV4cCI6MjA0MzM4NjE3Nn0.ZaPKeIX3JslzlY5-uIx_MDq9UV65sHcV1qYVR8s9Wg8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Alterado para true no ambiente web
  },
})