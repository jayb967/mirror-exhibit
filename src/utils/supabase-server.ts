import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client with the anonymous key for public operations
 * This should be used for operations that don't require elevated privileges
 */
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables (URL or ANON_KEY)');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Creates a Supabase client with the service role key for admin operations
 * This bypasses RLS policies and should only be used in secure server contexts
 */
export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables (URL or SERVICE_ROLE_KEY)');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
