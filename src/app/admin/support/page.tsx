// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

import SupportList from '@/components/admin/support/SupportList'

export default function SupportPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Support Requests</h1>
      <SupportList />
    </div>
  )
}