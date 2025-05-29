// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

import BasicAdminLayout from '@/components/admin/BasicAdminLayout'
import MarketingDashboard from '@/components/admin/marketing/MarketingDashboard'

export default function MarketingPage() {
  return (
    <BasicAdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        <div className="tw-space-y-6">
          <div className="tw-flex tw-justify-between tw-items-center">
            <h1 className="tw-text-2xl tw-font-semibold tw-text-gray-900">Marketing Hub</h1>
            <div className="tw-text-sm tw-text-gray-500">
              Manage campaigns, affiliates, and customer engagement
            </div>
          </div>
          <MarketingDashboard />
        </div>
      </div>
    </BasicAdminLayout>
  )
}