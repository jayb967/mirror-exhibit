import { supabase } from './client'

// Support Request Functions
export const createSupportRequest = async (subject: string, message: string) => {
  const { data, error } = await supabase
    .from('support_requests')
    .insert([{ subject, message }])
    .select()

  if (error) throw error
  return data
}

// ... rest of the functions remain the same ...