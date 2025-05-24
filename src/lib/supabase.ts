import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';

// Create a Supabase client for the browser
export const createBrowserClient = () => {
  return createClientComponentClient<Database>();
};

// Create a Supabase client for server-side usage with service role
export const createServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient<Database>(supabaseUrl, supabaseKey);
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: unknown) => {
  console.error('Supabase error:', error);
  
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as Error).message;
  }
  
  return 'An unexpected error occurred';
}; 