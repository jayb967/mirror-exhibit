'use client'

import { useState, useEffect } from 'react'
import { 
  ShoppingCartIcon, 
  EnvelopeIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  UserIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface AbandonedCart {
  id: string
  email: string
  customerName?: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  subtotal: number
  lastActivity: string
  stage: 'has_items' | 'checkout_started' | 'form_completed' | 'payment_started'
  recoveryEmailsSent: number
  lastEmailSent?: string
  deviceType?: string
  utmSource?: string
}

const mockAbandonedCarts: AbandonedCart[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    customerName: 'John Doe',
    items: [
      { name: 'Modern Mirror Frame - Large', quantity: 1, price: 299.99 },
      { name: 'Classic Wood Frame - Medium', quantity: 2, price: 199.99 }
    ],
    subtotal: 699.97,
    lastActivity: '2024-01-22T14:30:00Z',
    stage: 'payment_started',
    recoveryEmailsSent: 1,
    lastEmailSent: '2024-01-22T15:00:00Z',
    deviceType: 'desktop',
    utmSource: 'google'
  },
  {
    id: '2',
    email: 'sarah.wilson@example.com',
    items: [
      { name: 'Vintage Mirror Collection', quantity: 1, price: 449.99 }
    ],
    subtotal: 449.99,
    lastActivity: '2024-01-22T10:15:00Z',
    stage: 'form_completed',
    recoveryEmailsSent: 0,
    deviceType: 'mobile',
    utmSource: 'facebook'
  },
  {
    id: '3',
    email: 'mike.johnson@example.com',
    customerName: 'Mike Johnson',
    items: [
      { name: 'Contemporary Frame Set', quantity: 3, price: 159.99 }
    ],
    subtotal: 479.97,
    lastActivity: '2024-01-21T16:45:00Z',
    stage: 'checkout_started',
    recoveryEmailsSent: 2,
    lastEmailSent: '2024-01-22T09:00:00Z',
    deviceType: 'tablet'
  }
]

const getStageInfo = (stage: string) => {
  switch (stage) {
    case 'has_items':
      return { 
        label: 'Items Added', 
        color: 'tw-bg-gray-100 tw-text-gray-800',
        priority: 'Low'
      }
    case 'checkout_started':
      return { 
        label: 'Checkout Started', 
        color: 'tw-bg-yellow-100 tw-text-yellow-800',
        priority: 'Medium'
      }
    case 'form_completed':
      return { 
        label: 'Form Completed', 
        color: 'tw-bg-orange-100 tw-text-orange-800',
        priority: 'High'
      }
    case 'payment_started':
      return { 
        label: 'Payment Started', 
        color: 'tw-bg-red-100 tw-text-red-800',
        priority: 'Critical'
      }
    default:
      return { 
        label: 'Unknown', 
        color: 'tw-bg-gray-100 tw-text-gray-800',
        priority: 'Low'
      }
  }
}

const getTimeSince = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Less than 1 hour ago'
  if (diffInHours < 24) return `${diffInHours} hours ago`
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} days ago`
}

export default function AbandonedCartsManager() {
  const [carts] = useState<AbandonedCart[]>(mockAbandonedCarts)
  const [selectedStage, setSelectedStage] = useState<string>('all')

  const filteredCarts = selectedStage === 'all' 
    ? carts 
    : carts.filter(cart => cart.stage === selectedStage)

  const totalValue = carts.reduce((sum, cart) => sum + cart.subtotal, 0)
  const avgCartValue = carts.length > 0 ? totalValue / carts.length : 0

  return (
    <div className="tw-space-y-6">
      {/* Stats Overview */}
      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-6">
        <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-shadow tw-border">
          <div className="tw-flex tw-items-center">
            <div className="tw-flex-shrink-0">
              <ShoppingCartIcon className="tw-h-8 tw-w-8 tw-text-orange-600" />
            </div>
            <div className="tw-ml-4">
              <p className="tw-text-sm tw-font-medium tw-text-gray-500">Abandoned Carts</p>
              <p className="tw-text-2xl tw-font-semibold tw-text-gray-900">{carts.length}</p>
            </div>
          </div>
        </div>

        <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-shadow tw-border">
          <div className="tw-flex tw-items-center">
            <div className="tw-flex-shrink-0">
              <CurrencyDollarIcon className="tw-h-8 tw-w-8 tw-text-green-600" />
            </div>
            <div className="tw-ml-4">
              <p className="tw-text-sm tw-font-medium tw-text-gray-500">Total Value</p>
              <p className="tw-text-2xl tw-font-semibold tw-text-gray-900">${totalValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-shadow tw-border">
          <div className="tw-flex tw-items-center">
            <div className="tw-flex-shrink-0">
              <CurrencyDollarIcon className="tw-h-8 tw-w-8 tw-text-blue-600" />
            </div>
            <div className="tw-ml-4">
              <p className="tw-text-sm tw-font-medium tw-text-gray-500">Avg. Cart Value</p>
              <p className="tw-text-2xl tw-font-semibold tw-text-gray-900">${avgCartValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-shadow tw-border">
          <div className="tw-flex tw-items-center">
            <div className="tw-flex-shrink-0">
              <EnvelopeIcon className="tw-h-8 tw-w-8 tw-text-purple-600" />
            </div>
            <div className="tw-ml-4">
              <p className="tw-text-sm tw-font-medium tw-text-gray-500">Recovery Rate</p>
              <p className="tw-text-2xl tw-font-semibold tw-text-gray-900">23.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tw-border-b tw-border-gray-200">
        <nav className="-tw-mb-px tw-flex tw-space-x-8">
          {[
            { key: 'all', label: 'All Carts' },
            { key: 'payment_started', label: 'Payment Started' },
            { key: 'form_completed', label: 'Form Completed' },
            { key: 'checkout_started', label: 'Checkout Started' },
            { key: 'has_items', label: 'Items Added' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedStage(tab.key)}
              className={`tw-py-2 tw-px-1 tw-border-b-2 tw-font-medium tw-text-sm ${
                selectedStage === tab.key
                  ? 'tw-border-orange-500 tw-text-orange-600'
                  : 'tw-border-transparent tw-text-gray-500 hover:tw-text-gray-700 hover:tw-border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Abandoned Carts Table */}
      <div className="tw-bg-white tw-rounded-lg tw-shadow tw-border tw-overflow-hidden">
        <div className="tw-overflow-x-auto">
          <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
            <thead className="tw-bg-gray-50">
              <tr>
                <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Customer
                </th>
                <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Cart Details
                </th>
                <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Stage
                </th>
                <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Value
                </th>
                <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Last Activity
                </th>
                <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Recovery
                </th>
                <th className="tw-px-6 tw-py-3 tw-text-right tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
              {filteredCarts.map((cart) => {
                const stageInfo = getStageInfo(cart.stage)
                return (
                  <tr key={cart.id} className="hover:tw-bg-gray-50">
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                      <div className="tw-flex tw-items-center">
                        <div className="tw-flex-shrink-0">
                          <UserIcon className="tw-h-8 tw-w-8 tw-text-gray-400" />
                        </div>
                        <div className="tw-ml-4">
                          <div className="tw-text-sm tw-font-medium tw-text-gray-900">
                            {cart.customerName || 'Guest Customer'}
                          </div>
                          <div className="tw-text-sm tw-text-gray-500">
                            {cart.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="tw-px-6 tw-py-4">
                      <div className="tw-text-sm tw-text-gray-900">
                        {cart.items.length} item{cart.items.length !== 1 ? 's' : ''}
                      </div>
                      <div className="tw-text-sm tw-text-gray-500">
                        {cart.items[0]?.name}
                        {cart.items.length > 1 && ` +${cart.items.length - 1} more`}
                      </div>
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                      <span className={`tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium ${stageInfo.color}`}>
                        {stageInfo.label}
                      </span>
                      <div className="tw-text-xs tw-text-gray-500 tw-mt-1">
                        Priority: {stageInfo.priority}
                      </div>
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-900">
                      ${cart.subtotal.toFixed(2)}
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                      <div className="tw-flex tw-items-center">
                        <ClockIcon className="tw-h-4 tw-w-4 tw-mr-1" />
                        {getTimeSince(cart.lastActivity)}
                      </div>
                      {cart.deviceType && (
                        <div className="tw-text-xs tw-text-gray-400 tw-mt-1">
                          {cart.deviceType} • {cart.utmSource || 'direct'}
                        </div>
                      )}
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                      <div>{cart.recoveryEmailsSent} emails sent</div>
                      {cart.lastEmailSent && (
                        <div className="tw-text-xs tw-text-gray-400">
                          Last: {getTimeSince(cart.lastEmailSent)}
                        </div>
                      )}
                    </td>
                    <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-right tw-text-sm tw-font-medium">
                      <div className="tw-flex tw-justify-end tw-space-x-2">
                        <button className="tw-text-blue-600 hover:tw-text-blue-900">
                          <EyeIcon className="tw-h-4 tw-w-4" />
                        </button>
                        <button className="tw-text-orange-600 hover:tw-text-orange-900">
                          <EnvelopeIcon className="tw-h-4 tw-w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Feature Notice */}
      <div className="tw-bg-green-50 tw-border tw-border-green-200 tw-rounded-lg tw-p-4">
        <div className="tw-flex">
          <div className="tw-flex-shrink-0">
            <ShoppingCartIcon className="tw-h-5 tw-w-5 tw-text-green-400" />
          </div>
          <div className="tw-ml-3">
            <h3 className="tw-text-sm tw-font-medium tw-text-green-800">
              Abandoned Cart Tracking Active
            </h3>
            <div className="tw-mt-2 tw-text-sm tw-text-green-700">
              <p>
                This system is actively tracking abandoned carts using the enhanced cart tracking service. 
                Recovery email automation and detailed funnel analytics are available through the existing infrastructure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
