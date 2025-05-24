import { createClient } from '@supabase/supabase-js';

/**
 * Get a Supabase client with admin privileges
 * This client can be used to bypass RLS policies for admin operations
 * @returns Supabase client with admin privileges
 */
export function getAdminClient() {
  // Create a client with the service role key for admin operations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables for admin client');
    throw new Error('Missing Supabase environment variables for admin client');
  }

  // Use the service role key to bypass RLS policies
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
