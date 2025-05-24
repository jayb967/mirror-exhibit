// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

import EmailCampaigns from '@/components/admin/marketing/EmailCampaigns'

export default function MarketingPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Marketing</h1>
      <EmailCampaigns />
    </div>
  )
}