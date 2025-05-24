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

// Email Campaign Functions
export const createEmailCampaign = async (campaignData: {
  name: string;
  subject: string;
  content: string;
  target_audience?: string;
}) => {
  const { data, error } = await supabase
    .from('email_campaigns')
    .insert([campaignData])
    .select()

  if (error) throw error
  return data
}