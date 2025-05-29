'use client'

import { useState } from 'react'
import { 
  EnvelopeIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface EmailCampaign {
  id: string
  name: string
  subject: string
  status: 'draft' | 'scheduled' | 'sent' | 'sending'
  recipients: number
  openRate?: number
  clickRate?: number
  createdAt: string
  scheduledAt?: string
  sentAt?: string
}

const mockCampaigns: EmailCampaign[] = [
  {
    id: '1',
    name: 'Welcome Series - New Customers',
    subject: 'Welcome to Mirror Exhibit!',
    status: 'sent',
    recipients: 245,
    openRate: 68.5,
    clickRate: 12.3,
    createdAt: '2024-01-15',
    sentAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Abandoned Cart Recovery',
    subject: 'Complete your purchase - 10% off inside!',
    status: 'sending',
    recipients: 89,
    createdAt: '2024-01-20',
    scheduledAt: '2024-01-20'
  },
  {
    id: '3',
    name: 'New Product Launch',
    subject: 'Introducing our latest mirror collection',
    status: 'scheduled',
    recipients: 1250,
    createdAt: '2024-01-18',
    scheduledAt: '2024-01-25'
  },
  {
    id: '4',
    name: 'Customer Feedback Survey',
    subject: 'How was your experience with us?',
    status: 'draft',
    recipients: 0,
    createdAt: '2024-01-22'
  }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'sent':
      return (
        <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-green-100 tw-text-green-800">
          <CheckCircleIcon className="tw-w-3 tw-h-3 tw-mr-1" />
          Sent
        </span>
      )
    case 'sending':
      return (
        <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-blue-100 tw-text-blue-800">
          <ClockIcon className="tw-w-3 tw-h-3 tw-mr-1" />
          Sending
        </span>
      )
    case 'scheduled':
      return (
        <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-yellow-100 tw-text-yellow-800">
          <ClockIcon className="tw-w-3 tw-h-3 tw-mr-1" />
          Scheduled
        </span>
      )
    case 'draft':
      return (
        <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-gray-100 tw-text-gray-800">
          <PencilIcon className="tw-w-3 tw-h-3 tw-mr-1" />
          Draft
        </span>
      )
    default:
      return null
  }
}

export default function EmailCampaignsManager() {
  const [campaigns] = useState<EmailCampaign[]>(mockCampaigns)
  const [selectedTab, setSelectedTab] = useState<string>('all')

  const filteredCampaigns = selectedTab === 'all' 
    ? campaigns 
    : campaigns.filter(campaign => campaign.status === selectedTab)

  return (
    <div className="tw-space-y-6">
      {/* Stats Overview */}
      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-6">
        <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-shadow tw-border">
          <div className="tw-flex tw-items-center">
            <div className="tw-flex-shrink-0">
              <EnvelopeIcon className="tw-h-8 tw-w-8 tw-text-blue-600" />
            </div>
            <div className="tw-ml-4">
              <p className="tw-text-sm tw-font-medium tw-text-gray-500">Total Campaigns</p>
              <p className="tw-text-2xl tw-font-semibold tw-text-gray-900">{campaigns.length}</p>
            </div>
          </div>
        </div>

        <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-shadow tw-border">
          <div className="tw-flex tw-items-center">
            <div className="tw-flex-shrink-0">
              <ChartBarIcon className="tw-h-8 tw-w-8 tw-text-green-600" />
            </div>
            <div className="tw-ml-4">
              <p className="tw-text-sm tw-font-medium tw-text-gray-500">Avg. Open Rate</p>
              <p className="tw-text-2xl tw-font-semibold tw-text-gray-900">68.5%</p>
            </div>
          </div>
        </div>

        <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-shadow tw-border">
          <div className="tw-flex tw-items-center">
            <div className="tw-flex-shrink-0">
              <ChartBarIcon className="tw-h-8 tw-w-8 tw-text-purple-600" />
            </div>
            <div className="tw-ml-4">
              <p className="tw-text-sm tw-font-medium tw-text-gray-500">Avg. Click Rate</p>
              <p className="tw-text-2xl tw-font-semibold tw-text-gray-900">12.3%</p>
            </div>
          </div>
        </div>

        <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-shadow tw-border">
          <div className="tw-flex tw-items-center">
            <div className="tw-flex-shrink-0">
              <EnvelopeIcon className="tw-h-8 tw-w-8 tw-text-orange-600" />
            </div>
            <div className="tw-ml-4">
              <p className="tw-text-sm tw-font-medium tw-text-gray-500">Total Recipients</p>
              <p className="tw-text-2xl tw-font-semibold tw-text-gray-900">1,584</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tw-border-b tw-border-gray-200">
        <nav className="-tw-mb-px tw-flex tw-space-x-8">
          {[
            { key: 'all', label: 'All Campaigns' },
            { key: 'draft', label: 'Drafts' },
            { key: 'scheduled', label: 'Scheduled' },
            { key: 'sent', label: 'Sent' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`tw-py-2 tw-px-1 tw-border-b-2 tw-font-medium tw-text-sm ${
                selectedTab === tab.key
                  ? 'tw-border-blue-500 tw-text-blue-600'
                  : 'tw-border-transparent tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Campaigns Table */}
      <div className="tw-bg-white tw-rounded-lg tw-shadow tw-border tw-overflow-hidden">
        <div className="tw-overflow-x-auto">
          <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
            <thead className="tw-bg-gray-50">
              <tr>
                <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Campaign
                </th>
                <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Status
                </th>
                <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Recipients
                </th>
                <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Performance
                </th>
                <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Date
                </th>
                <th className="tw-px-6 tw-py-3 tw-text-right tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:tw-bg-gray-50">
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                    <div>
                      <div className="tw-text-sm tw-font-medium tw-text-gray-900">
                        {campaign.name}
                      </div>
                      <div className="tw-text-sm tw-text-gray-500">
                        {campaign.subject}
                      </div>
                    </div>
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                    {getStatusBadge(campaign.status)}
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-900">
                    {campaign.recipients.toLocaleString()}
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-900">
                    {campaign.openRate && campaign.clickRate ? (
                      <div>
                        <div>Open: {campaign.openRate}%</div>
                        <div>Click: {campaign.clickRate}%</div>
                      </div>
                    ) : (
                      <span className="tw-text-gray-400">-</span>
                    )}
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                    {campaign.sentAt || campaign.scheduledAt || campaign.createdAt}
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-right tw-text-sm tw-font-medium">
                    <div className="tw-flex tw-justify-end tw-space-x-2">
                      <button className="tw-text-blue-600 hover:tw-text-blue-900">
                        <EyeIcon className="tw-h-4 tw-w-4" />
                      </button>
                      <button className="tw-text-gray-600 hover:tw-text-gray-900">
                        <PencilIcon className="tw-h-4 tw-w-4" />
                      </button>
                      <button className="tw-text-red-600 hover:tw-text-red-900">
                        <TrashIcon className="tw-h-4 tw-w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg tw-p-4">
        <div className="tw-flex">
          <div className="tw-flex-shrink-0">
            <EnvelopeIcon className="tw-h-5 tw-w-5 tw-text-blue-400" />
          </div>
          <div className="tw-ml-3">
            <h3 className="tw-text-sm tw-font-medium tw-text-blue-800">
              Email Campaign Builder Coming Soon
            </h3>
            <div className="tw-mt-2 tw-text-sm tw-text-blue-700">
              <p>
                Full email campaign creation, template management, and automation features are currently in development. 
                This interface shows the planned functionality for managing your SendGrid email campaigns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
