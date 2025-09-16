import { createClient } from '@supabase/supabase-js'

// Admin client using service role key for admin operations
// This bypasses RLS policies and should only be used server-side
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export default supabaseAdmin
