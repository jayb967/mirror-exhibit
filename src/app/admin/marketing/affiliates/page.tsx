// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

import BasicAdminLayout from '@/components/admin/BasicAdminLayout'
import AffiliatesManager from '@/components/admin/marketing/AffiliatesManager'

export default function AffiliatesPage() {
  return (
    <BasicAdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        <div className="tw-space-y-6">
          <div className="tw-flex tw-justify-between tw-items-center">
            <div>
              <h1 className="tw-text-2xl tw-font-semibold tw-text-gray-900">Affiliate Management</h1>
              <p className="tw-text-sm tw-text-gray-500 tw-mt-1">
                Manage affiliate partners, commissions, and track performance
              </p>
            </div>
            <button className="tw-bg-green-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-lg hover:tw-bg-green-700 tw-transition-colors">
              Add Affiliate
            </button>
          </div>
          <AffiliatesManager />
        </div>
      </div>
    </BasicAdminLayout>
  )
}
