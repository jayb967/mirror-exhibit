// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

import BasicAdminLayout from '@/components/admin/BasicAdminLayout'
import AbandonedCartsManager from '@/components/admin/marketing/AbandonedCartsManager'

export default function AbandonedCartsPage() {
  return (
    <BasicAdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        <div className="tw-space-y-6">
          <div className="tw-flex tw-justify-between tw-items-center">
            <div>
              <h1 className="tw-text-2xl tw-font-semibold tw-text-gray-900">Abandoned Cart Recovery</h1>
              <p className="tw-text-sm tw-text-gray-500 tw-mt-1">
                Monitor and recover abandoned shopping carts with automated email sequences
              </p>
            </div>
            <button className="tw-bg-orange-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-lg hover:tw-bg-orange-700 tw-transition-colors">
              Send Recovery Email
            </button>
          </div>
          <AbandonedCartsManager />
        </div>
      </div>
    </BasicAdminLayout>
  )
}
