// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

import BasicAdminLayout from '@/components/admin/BasicAdminLayout'
import EmailCampaignsManager from '@/components/admin/marketing/EmailCampaignsManager'

export default function EmailCampaignsPage() {
  return (
    <BasicAdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        <div className="tw-space-y-6">
          <div className="tw-flex tw-justify-between tw-items-center">
            <div>
              <h1 className="tw-text-2xl tw-font-semibold tw-text-gray-900">Email Campaigns</h1>
              <p className="tw-text-sm tw-text-gray-500 tw-mt-1">
                Create and manage email marketing campaigns with SendGrid
              </p>
            </div>
            <button className="tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-lg hover:tw-bg-blue-700 tw-transition-colors">
              Create Campaign
            </button>
          </div>
          <EmailCampaignsManager />
        </div>
      </div>
    </BasicAdminLayout>
  )
}
