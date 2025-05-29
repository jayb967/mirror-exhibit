'use client'

import { useState } from 'react'
import { 
  EnvelopeIcon, 
  ShoppingCartIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  GiftIcon,
  CogIcon,
  DocumentChartBarIcon,
  BoltIcon
} from '@heroicons/react/24/outline'

interface MarketingCard {
  title: string
  description: string
  icon: React.ComponentType<any>
  href: string
  status: 'active' | 'coming-soon' | 'beta'
  features: string[]
}

const marketingFeatures: MarketingCard[] = [
  {
    title: 'Email Marketing',
    description: 'Create and manage email campaigns with SendGrid integration',
    icon: EnvelopeIcon,
    href: '/admin/marketing/email-campaigns',
    status: 'active',
    features: [
      'Campaign Management',
      'Email Templates',
      'A/B Testing',
      'Performance Analytics',
      'Customer Segmentation'
    ]
  },
  {
    title: 'Abandoned Cart Recovery',
    description: 'Recover lost sales with automated cart abandonment campaigns',
    icon: ShoppingCartIcon,
    href: '/admin/marketing/abandoned-carts',
    status: 'active',
    features: [
      'Real-time Cart Tracking',
      'Automated Recovery Emails',
      'Recovery Analytics',
      'Custom Incentives',
      'Multi-stage Sequences'
    ]
  },
  {
    title: 'Affiliate Management',
    description: 'Manage affiliate partners and track their performance',
    icon: UserGroupIcon,
    href: '/admin/marketing/affiliates',
    status: 'coming-soon',
    features: [
      'Affiliate Registration',
      'Commission Management',
      'Link Generation',
      'Performance Tracking',
      'Payment Processing'
    ]
  },
  {
    title: 'Customer Analytics',
    description: 'Deep insights into customer behavior and lifetime value',
    icon: ChartBarIcon,
    href: '/admin/marketing/analytics',
    status: 'beta',
    features: [
      'Customer Lifetime Value',
      'Purchase Behavior',
      'Segmentation',
      'Retention Metrics',
      'Churn Analysis'
    ]
  },
  {
    title: 'Promotional Tools',
    description: 'Create and manage discounts, referrals, and loyalty programs',
    icon: GiftIcon,
    href: '/admin/marketing/promotions',
    status: 'coming-soon',
    features: [
      'Discount Management',
      'Flash Sales',
      'Referral Programs',
      'Loyalty Points',
      'Social Integration'
    ]
  },
  {
    title: 'Marketing Automation',
    description: 'Build automated workflows and customer journeys',
    icon: BoltIcon,
    href: '/admin/marketing/automation',
    status: 'coming-soon',
    features: [
      'Workflow Builder',
      'Trigger Campaigns',
      'Journey Mapping',
      'Lead Nurturing',
      'Re-engagement'
    ]
  },
  {
    title: 'Reports & Analytics',
    description: 'Comprehensive marketing performance and ROI analysis',
    icon: DocumentChartBarIcon,
    href: '/admin/marketing/reports',
    status: 'beta',
    features: [
      'ROI Dashboard',
      'Campaign Performance',
      'Conversion Funnels',
      'Revenue Attribution',
      'Custom Reports'
    ]
  },
  {
    title: 'Settings & Integration',
    description: 'Configure marketing tools and third-party integrations',
    icon: CogIcon,
    href: '/admin/marketing/settings',
    status: 'active',
    features: [
      'SendGrid Configuration',
      'API Integrations',
      'Webhook Management',
      'Template Settings',
      'Notification Preferences'
    ]
  }
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return (
        <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-green-100 tw-text-green-800">
          Active
        </span>
      )
    case 'beta':
      return (
        <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-yellow-100 tw-text-yellow-800">
          Beta
        </span>
      )
    case 'coming-soon':
      return (
        <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-gray-100 tw-text-gray-800">
          Coming Soon
        </span>
      )
    default:
      return null
  }
}

export default function MarketingDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredFeatures = selectedCategory === 'all' 
    ? marketingFeatures 
    : marketingFeatures.filter(feature => feature.status === selectedCategory)

  return (
    <div className="tw-space-y-6">
      {/* Quick Stats */}
      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-6">
        <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-shadow tw-border">
          <div className="tw-flex tw-items-center">
            <div className="tw-flex-shrink-0">
              <EnvelopeIcon className="tw-h-8 tw-w-8 tw-text-blue-600" />
            </div>
            <div className="tw-ml-4">
              <p className="tw-text-sm tw-font-medium tw-text-gray-500">Email Campaigns</p>
              <p className="tw-text-2xl tw-font-semibold tw-text-gray-900">12</p>
            </div>
          </div>
        </div>

        <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-shadow tw-border">
          <div className="tw-flex tw-items-center">
            <div className="tw-flex-shrink-0">
              <ShoppingCartIcon className="tw-h-8 tw-w-8 tw-text-orange-600" />
            </div>
            <div className="tw-ml-4">
              <p className="tw-text-sm tw-font-medium tw-text-gray-500">Abandoned Carts</p>
              <p className="tw-text-2xl tw-font-semibold tw-text-gray-900">47</p>
            </div>
          </div>
        </div>

        <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-shadow tw-border">
          <div className="tw-flex tw-items-center">
            <div className="tw-flex-shrink-0">
              <UserGroupIcon className="tw-h-8 tw-w-8 tw-text-green-600" />
            </div>
            <div className="tw-ml-4">
              <p className="tw-text-sm tw-font-medium tw-text-gray-500">Active Affiliates</p>
              <p className="tw-text-2xl tw-font-semibold tw-text-gray-900">8</p>
            </div>
          </div>
        </div>

        <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-shadow tw-border">
          <div className="tw-flex tw-items-center">
            <div className="tw-flex-shrink-0">
              <ChartBarIcon className="tw-h-8 tw-w-8 tw-text-purple-600" />
            </div>
            <div className="tw-ml-4">
              <p className="tw-text-sm tw-font-medium tw-text-gray-500">Conversion Rate</p>
              <p className="tw-text-2xl tw-font-semibold tw-text-gray-900">3.2%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tw-border-b tw-border-gray-200">
        <nav className="-tw-mb-px tw-flex tw-space-x-8">
          {[
            { key: 'all', label: 'All Features' },
            { key: 'active', label: 'Active' },
            { key: 'beta', label: 'Beta' },
            { key: 'coming-soon', label: 'Coming Soon' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedCategory(tab.key)}
              className={`tw-py-2 tw-px-1 tw-border-b-2 tw-font-medium tw-text-sm ${
                selectedCategory === tab.key
                  ? 'tw-border-blue-500 tw-text-blue-600'
                  : 'tw-border-transparent tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Marketing Features Grid */}
      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6">
        {filteredFeatures.map((feature, index) => {
          const IconComponent = feature.icon
          const isClickable = feature.status === 'active' || feature.status === 'beta'
          
          return (
            <div
              key={index}
              className={`tw-bg-white tw-rounded-lg tw-shadow tw-border tw-p-6 tw-transition-all tw-duration-200 ${
                isClickable 
                  ? 'hover:tw-shadow-lg hover:tw-border-blue-300 tw-cursor-pointer' 
                  : 'tw-opacity-75 tw-cursor-not-allowed'
              }`}
              onClick={() => {
                if (isClickable) {
                  // Navigate to feature page
                  window.location.href = feature.href
                }
              }}
            >
              <div className="tw-flex tw-items-start tw-justify-between">
                <div className="tw-flex tw-items-center">
                  <div className="tw-flex-shrink-0">
                    <IconComponent className="tw-h-8 tw-w-8 tw-text-blue-600" />
                  </div>
                  <div className="tw-ml-4">
                    <h3 className="tw-text-lg tw-font-medium tw-text-gray-900">
                      {feature.title}
                    </h3>
                  </div>
                </div>
                {getStatusBadge(feature.status)}
              </div>
              
              <p className="tw-mt-3 tw-text-sm tw-text-gray-500">
                {feature.description}
              </p>
              
              <div className="tw-mt-4">
                <h4 className="tw-text-sm tw-font-medium tw-text-gray-900 tw-mb-2">
                  Key Features:
                </h4>
                <ul className="tw-text-sm tw-text-gray-500 tw-space-y-1">
                  {feature.features.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="tw-flex tw-items-center">
                      <span className="tw-w-1.5 tw-h-1.5 tw-bg-blue-600 tw-rounded-full tw-mr-2"></span>
                      {item}
                    </li>
                  ))}
                  {feature.features.length > 3 && (
                    <li className="tw-text-xs tw-text-gray-400">
                      +{feature.features.length - 3} more features
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
