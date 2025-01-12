'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    openSupport: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Get total orders
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      // Get total products  
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Get total customers
      const { count: customerCount } = await supabase
        .from('auth.users')
        .select('*', { count: 'exact', head: true })

      // Get open support requests
      const { count: supportCount } = await supabase
        .from('support_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')

      setStats({
        totalOrders: orderCount || 0,
        totalProducts: productCount || 0, 
        totalCustomers: customerCount || 0,
        openSupport: supportCount || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading stats...</div>
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-shopping-cart text-2xl text-indigo-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Orders
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.totalOrders}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-box text-2xl text-indigo-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Products
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.totalProducts}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-users text-2xl text-indigo-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Customers
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.totalCustomers}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-headset text-2xl text-indigo-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Open Support Requests
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.openSupport}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}