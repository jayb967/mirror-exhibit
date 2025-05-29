'use client'

import { useState } from 'react'
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  LinkIcon, 
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface Affiliate {
  id: string
  name: string
  email: string
  status: 'active' | 'pending' | 'suspended'
  commissionRate: number
  totalEarnings: number
  totalSales: number
  clicksThisMonth: number
  conversionsThisMonth: number
  joinedDate: string
  lastActivity: string
  paymentMethod: string
}

const mockAffiliates: Affiliate[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@influencer.com',
    status: 'active',
    commissionRate: 15,
    totalEarnings: 2450.75,
    totalSales: 16338.33,
    clicksThisMonth: 342,
    conversionsThisMonth: 12,
    joinedDate: '2023-08-15',
    lastActivity: '2024-01-22',
    paymentMethod: 'PayPal'
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@designblog.com',
    status: 'active',
    commissionRate: 12,
    totalEarnings: 1875.20,
    totalSales: 15626.67,
    clicksThisMonth: 198,
    conversionsThisMonth: 8,
    joinedDate: '2023-11-02',
    lastActivity: '2024-01-21',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    email: 'emma@homedecor.net',
    status: 'pending',
    commissionRate: 10,
    totalEarnings: 0,
    totalSales: 0,
    clicksThisMonth: 0,
    conversionsThisMonth: 0,
    joinedDate: '2024-01-20',
    lastActivity: '2024-01-20',
    paymentMethod: 'PayPal'
  }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return (
        <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-green-100 tw-text-green-800">
          <CheckCircleIcon className="tw-w-3 tw-h-3 tw-mr-1" />
          Active
        </span>
      )
    case 'pending':
      return (
        <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-yellow-100 tw-text-yellow-800">
          <ClockIcon className="tw-w-3 tw-h-3 tw-mr-1" />
          Pending
        </span>
      )
    case 'suspended':
      return (
        <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-red-100 tw-text-red-800">
          <XCircleIcon className="tw-w-3 tw-h-3 tw-mr-1" />
          Suspended
        </span>
      )
    default:
      return null
  }
}

export default function AffiliatesManager() {
  const [affiliates] = useState<Affiliate[]>(mockAffiliates)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const filteredAffiliates = selectedStatus === 'all' 
    ? affiliates 
    : affiliates.filter(affiliate => affiliate.status === selectedStatus)

  const totalAffiliates = affiliates.length
  const activeAffiliates = affiliates.filter(a => a.status === 'active').length
  const totalEarnings = affiliates.reduce((sum, affiliate) => sum + affiliate.totalEarnings, 0)
  const totalSales = affiliates.reduce((sum, affiliate) => sum + affiliate.totalSales, 0)

  return (
    <div className="tw-space-y-6">
      {/* Stats Overview */}
      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-6">
        <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-shadow tw-border">
          <div className="tw-flex tw-items-center">
            <div className="tw-flex-shrink-0">
              <UserGroupIcon className="tw-h-8 tw-w-8 tw-text-green-600" />
            </div>
            <div className="tw-ml-4">
              <p className="tw-text-sm tw-font-medium tw-text-gray-500">Total Affiliates</p>
              <p className="tw-text-2xl tw-font-semibold tw-text-gray-900">{totalAffiliates}</p>
              <p className="tw-text-xs tw-text-gray-500">{activeAffiliates} active</p>
            </div>
          </div>
        </div>

        <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-shadow tw-border">
          <div className="tw-flex tw-items-center">
            <div className="tw-flex-shrink-0">
              <CurrencyDollarIcon className="tw-h-8 tw-w-8 tw-text-blue-600" />
            </div>
            <div className="tw-ml-4">
              <p className="tw-text-sm tw-font-medium tw-text-gray-500">Total Commissions</p>
              <p className="tw-text-2xl tw-font-semibold tw-text-gray-900">${totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-shadow tw-border">
          <div className="tw-flex tw-items-center">
            <div className="tw-flex-shrink-0">
              <ChartBarIcon className="tw-h-8 tw-w-8 tw-text-purple-600" />
            </div>
            <div className="tw-ml-4">
              <p className="tw-text-sm tw-font-medium tw-text-gray-500">Affiliate Sales</p>
              <p className="tw-text-2xl tw-font-semibold tw-text-gray-900">${totalSales.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-shadow tw-border">
          <div className="tw-flex tw-items-center">
            <div className="tw-flex-shrink-0">
              <ChartBarIcon className="tw-h-8 tw-w-8 tw-text-orange-600" />
            </div>
            <div className="tw-ml-4">
              <p className="tw-text-sm tw-font-medium tw-text-gray-500">Avg. Commission</p>
              <p className="tw-text-2xl tw-font-semibold tw-text-gray-900">12.3%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tw-border-b tw-border-gray-200">
        <nav className="-tw-mb-px tw-flex tw-space-x-8">
          {[
            { key: 'all', label: 'All Affiliates' },
            { key: 'active', label: 'Active' },
            { key: 'pending', label: 'Pending' },
            { key: 'suspended', label: 'Suspended' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              className={`tw-py-2 tw-px-1 tw-border-b-2 tw-font-medium tw-text-sm ${
                selectedStatus === tab.key
                  ? 'tw-border-green-500 tw-text-green-600'
                  : 'tw-border-transparent tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Affiliates Table */}
      <div className="tw-bg-white tw-rounded-lg tw-shadow tw-border tw-overflow-hidden">
        <div className="tw-overflow-x-auto">
          <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
            <thead className="tw-bg-gray-50">
              <tr>
                <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Affiliate
                </th>
                <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Status
                </th>
                <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Commission Rate
                </th>
                <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Earnings
                </th>
                <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  This Month
                </th>
                <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Joined
                </th>
                <th className="tw-px-6 tw-py-3 tw-text-right tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
              {filteredAffiliates.map((affiliate) => (
                <tr key={affiliate.id} className="hover:tw-bg-gray-50">
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                    <div>
                      <div className="tw-text-sm tw-font-medium tw-text-gray-900">
                        {affiliate.name}
                      </div>
                      <div className="tw-text-sm tw-text-gray-500">
                        {affiliate.email}
                      </div>
                    </div>
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                    {getStatusBadge(affiliate.status)}
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-900">
                    {affiliate.commissionRate}%
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                    <div className="tw-text-sm tw-text-gray-900">
                      ${affiliate.totalEarnings.toFixed(2)}
                    </div>
                    <div className="tw-text-sm tw-text-gray-500">
                      from ${affiliate.totalSales.toFixed(2)} sales
                    </div>
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                    <div className="tw-text-sm tw-text-gray-900">
                      {affiliate.clicksThisMonth} clicks
                    </div>
                    <div className="tw-text-sm tw-text-gray-500">
                      {affiliate.conversionsThisMonth} conversions
                    </div>
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                    {new Date(affiliate.joinedDate).toLocaleDateString()}
                  </td>
                  <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-right tw-text-sm tw-font-medium">
                    <div className="tw-flex tw-justify-end tw-space-x-2">
                      <button className="tw-text-blue-600 hover:tw-text-blue-900">
                        <EyeIcon className="tw-h-4 tw-w-4" />
                      </button>
                      <button className="tw-text-gray-600 hover:tw-text-gray-900">
                        <PencilIcon className="tw-h-4 tw-w-4" />
                      </button>
                      <button className="tw-text-green-600 hover:tw-text-green-900">
                        <LinkIcon className="tw-h-4 tw-w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Affiliate Features Overview */}
      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
        <div className="tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg tw-p-6">
          <h3 className="tw-text-lg tw-font-medium tw-text-blue-900 tw-mb-4">
            Planned Affiliate Features
          </h3>
          <ul className="tw-space-y-2 tw-text-sm tw-text-blue-800">
            <li className="tw-flex tw-items-center">
              <span className="tw-w-1.5 tw-h-1.5 tw-bg-blue-600 tw-rounded-full tw-mr-2"></span>
              Automated affiliate registration & approval
            </li>
            <li className="tw-flex tw-items-center">
              <span className="tw-w-1.5 tw-h-1.5 tw-bg-blue-600 tw-rounded-full tw-mr-2"></span>
              Custom commission structures per affiliate
            </li>
            <li className="tw-flex tw-items-center">
              <span className="tw-w-1.5 tw-h-1.5 tw-bg-blue-600 tw-rounded-full tw-mr-2"></span>
              Unique tracking links generation
            </li>
            <li className="tw-flex tw-items-center">
              <span className="tw-w-1.5 tw-h-1.5 tw-bg-blue-600 tw-rounded-full tw-mr-2"></span>
              Real-time performance analytics
            </li>
            <li className="tw-flex tw-items-center">
              <span className="tw-w-1.5 tw-h-1.5 tw-bg-blue-600 tw-rounded-full tw-mr-2"></span>
              Automated payment processing
            </li>
          </ul>
        </div>

        <div className="tw-bg-green-50 tw-border tw-border-green-200 tw-rounded-lg tw-p-6">
          <h3 className="tw-text-lg tw-font-medium tw-text-green-900 tw-mb-4">
            Integration Options
          </h3>
          <ul className="tw-space-y-2 tw-text-sm tw-text-green-800">
            <li className="tw-flex tw-items-center">
              <span className="tw-w-1.5 tw-h-1.5 tw-bg-green-600 tw-rounded-full tw-mr-2"></span>
              Third-party affiliate networks (ShareASale, CJ)
            </li>
            <li className="tw-flex tw-items-center">
              <span className="tw-w-1.5 tw-h-1.5 tw-bg-green-600 tw-rounded-full tw-mr-2"></span>
              Custom affiliate portal dashboard
            </li>
            <li className="tw-flex tw-items-center">
              <span className="tw-w-1.5 tw-h-1.5 tw-bg-green-600 tw-rounded-full tw-mr-2"></span>
              API for affiliate management
            </li>
            <li className="tw-flex tw-items-center">
              <span className="tw-w-1.5 tw-h-1.5 tw-bg-green-600 tw-rounded-full tw-mr-2"></span>
              Multi-tier commission structures
            </li>
            <li className="tw-flex tw-items-center">
              <span className="tw-w-1.5 tw-h-1.5 tw-bg-green-600 tw-rounded-full tw-mr-2"></span>
              Fraud detection & prevention
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
