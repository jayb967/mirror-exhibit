'use client';

import React, { useState, useEffect } from 'react';
import BasicAdminLayout from '@/components/admin/BasicAdminLayout';
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
    revenueGrowth: number;
    orderGrowth: number;
    customerGrowth: number;
  };
  recentOrders: Array<{
    id: string;
    created_at: string;
    total_amount: number;
    customer_name: string;
    status: string;
  }>;
  topProducts: Array<{
    product_name: string;
    total_sold: number;
    revenue: number;
  }>;
  ordersByStatus: Record<string, number>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

const AdminAnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30_days');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        console.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 
      ? <TrendingUpIcon className="tw-h-4 tw-w-4 tw-text-green-500" />
      : <TrendingDownIcon className="tw-h-4 tw-w-4 tw-text-red-500" />;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'tw-text-green-600' : 'tw-text-red-600';
  };

  const timeRangeOptions = [
    { value: '7_days', label: 'Last 7 Days' },
    { value: '30_days', label: 'Last 30 Days' },
    { value: '90_days', label: 'Last 90 Days' },
    { value: '1_year', label: 'Last Year' },
  ];

  if (loading) {
    return (
      <BasicAdminLayout>
        <div className="tw-flex tw-items-center tw-justify-center tw-h-64">
          <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2" style={{ borderColor: '#A6A182' }}></div>
        </div>
      </BasicAdminLayout>
    );
  }

  if (!analyticsData) {
    return (
      <BasicAdminLayout>
        <div className="tw-text-center tw-py-12">
          <p className="tw-text-gray-500">Failed to load analytics data.</p>
        </div>
      </BasicAdminLayout>
    );
  }

  return (
    <BasicAdminLayout>
      <div className="tw-space-y-6">
        {/* Header */}
        <div className="tw-flex tw-items-center tw-justify-between">
          <div>
            <h1 className="tw-text-2xl tw-font-bold tw-text-gray-900">Analytics Dashboard</h1>
            <p className="tw-mt-1 tw-text-sm tw-text-gray-600">
              Track your business performance and insights
            </p>
          </div>
          <div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="tw-block tw-pl-3 tw-pr-10 tw-py-2 tw-text-base tw-border-gray-300 focus:tw-outline-none tw-rounded-md"
              style={{ borderColor: '#A6A182' }}
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6">
          <div className="tw-bg-white tw-overflow-hidden tw-shadow tw-rounded-lg">
            <div className="tw-p-5">
              <div className="tw-flex tw-items-center">
                <div className="tw-flex-shrink-0">
                  <CurrencyDollarIcon className="tw-h-6 tw-w-6" style={{ color: '#A6A182' }} />
                </div>
                <div className="tw-ml-5 tw-w-0 tw-flex-1">
                  <dl>
                    <dt className="tw-text-sm tw-font-medium tw-text-gray-500 tw-truncate">
                      Total Revenue
                    </dt>
                    <dd className="tw-flex tw-items-baseline">
                      <div className="tw-text-2xl tw-font-semibold tw-text-gray-900">
                        {formatCurrency(analyticsData.overview.totalRevenue)}
                      </div>
                      <div className={`tw-ml-2 tw-flex tw-items-baseline tw-text-sm tw-font-semibold ${getGrowthColor(analyticsData.overview.revenueGrowth)}`}>
                        {getGrowthIcon(analyticsData.overview.revenueGrowth)}
                        <span className="tw-ml-1">
                          {formatPercentage(analyticsData.overview.revenueGrowth)}
                        </span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="tw-bg-white tw-overflow-hidden tw-shadow tw-rounded-lg">
            <div className="tw-p-5">
              <div className="tw-flex tw-items-center">
                <div className="tw-flex-shrink-0">
                  <ShoppingBagIcon className="tw-h-6 tw-w-6" style={{ color: '#A6A182' }} />
                </div>
                <div className="tw-ml-5 tw-w-0 tw-flex-1">
                  <dl>
                    <dt className="tw-text-sm tw-font-medium tw-text-gray-500 tw-truncate">
                      Total Orders
                    </dt>
                    <dd className="tw-flex tw-items-baseline">
                      <div className="tw-text-2xl tw-font-semibold tw-text-gray-900">
                        {formatNumber(analyticsData.overview.totalOrders)}
                      </div>
                      <div className={`tw-ml-2 tw-flex tw-items-baseline tw-text-sm tw-font-semibold ${getGrowthColor(analyticsData.overview.orderGrowth)}`}>
                        {getGrowthIcon(analyticsData.overview.orderGrowth)}
                        <span className="tw-ml-1">
                          {formatPercentage(analyticsData.overview.orderGrowth)}
                        </span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="tw-bg-white tw-overflow-hidden tw-shadow tw-rounded-lg">
            <div className="tw-p-5">
              <div className="tw-flex tw-items-center">
                <div className="tw-flex-shrink-0">
                  <UsersIcon className="tw-h-6 tw-w-6" style={{ color: '#A6A182' }} />
                </div>
                <div className="tw-ml-5 tw-w-0 tw-flex-1">
                  <dl>
                    <dt className="tw-text-sm tw-font-medium tw-text-gray-500 tw-truncate">
                      Total Customers
                    </dt>
                    <dd className="tw-flex tw-items-baseline">
                      <div className="tw-text-2xl tw-font-semibold tw-text-gray-900">
                        {formatNumber(analyticsData.overview.totalCustomers)}
                      </div>
                      <div className={`tw-ml-2 tw-flex tw-items-baseline tw-text-sm tw-font-semibold ${getGrowthColor(analyticsData.overview.customerGrowth)}`}>
                        {getGrowthIcon(analyticsData.overview.customerGrowth)}
                        <span className="tw-ml-1">
                          {formatPercentage(analyticsData.overview.customerGrowth)}
                        </span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="tw-bg-white tw-overflow-hidden tw-shadow tw-rounded-lg">
            <div className="tw-p-5">
              <div className="tw-flex tw-items-center">
                <div className="tw-flex-shrink-0">
                  <ChartBarIcon className="tw-h-6 tw-w-6" style={{ color: '#A6A182' }} />
                </div>
                <div className="tw-ml-5 tw-w-0 tw-flex-1">
                  <dl>
                    <dt className="tw-text-sm tw-font-medium tw-text-gray-500 tw-truncate">
                      Avg Order Value
                    </dt>
                    <dd className="tw-text-2xl tw-font-semibold tw-text-gray-900">
                      {formatCurrency(analyticsData.overview.averageOrderValue)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6">
          {/* Orders by Status */}
          <div className="tw-bg-white tw-shadow tw-rounded-lg">
            <div className="tw-px-6 tw-py-4 tw-border-b tw-border-gray-200">
              <h3 className="tw-text-lg tw-font-medium tw-text-gray-900">Orders by Status</h3>
            </div>
            <div className="tw-p-6">
              <div className="tw-space-y-4">
                {Object.entries(analyticsData.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="tw-flex tw-items-center tw-justify-between">
                    <div className="tw-flex tw-items-center">
                      <div className="tw-w-3 tw-h-3 tw-rounded-full tw-mr-3" style={{ backgroundColor: '#A6A182' }}></div>
                      <span className="tw-text-sm tw-font-medium tw-text-gray-900 tw-capitalize">
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="tw-text-sm tw-text-gray-600">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="tw-bg-white tw-shadow tw-rounded-lg">
            <div className="tw-px-6 tw-py-4 tw-border-b tw-border-gray-200">
              <h3 className="tw-text-lg tw-font-medium tw-text-gray-900">Top Products</h3>
            </div>
            <div className="tw-p-6">
              <div className="tw-space-y-4">
                {analyticsData.topProducts.slice(0, 5).map((product, index) => (
                  <div key={index} className="tw-flex tw-items-center tw-justify-between">
                    <div className="tw-flex-1 tw-min-w-0">
                      <p className="tw-text-sm tw-font-medium tw-text-gray-900 tw-truncate">
                        {product.product_name}
                      </p>
                      <p className="tw-text-sm tw-text-gray-500">
                        {product.total_sold} sold
                      </p>
                    </div>
                    <div className="tw-text-right">
                      <p className="tw-text-sm tw-font-medium tw-text-gray-900">
                        {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="tw-bg-white tw-shadow tw-rounded-lg">
          <div className="tw-px-6 tw-py-4 tw-border-b tw-border-gray-200">
            <h3 className="tw-text-lg tw-font-medium tw-text-gray-900">Recent Orders</h3>
          </div>
          <div className="tw-overflow-hidden">
            <div className="tw-overflow-x-auto">
              <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
                <thead className="tw-bg-gray-50">
                  <tr>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Order ID
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Customer
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Date
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Amount
                    </th>
                    <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
                  {analyticsData.recentOrders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="hover:tw-bg-gray-50">
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-font-medium tw-text-gray-900">
                        #{order.id.substring(0, 8)}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                        {order.customer_name}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                        <span className="tw-px-2 tw-inline-flex tw-text-xs tw-leading-5 tw-font-semibold tw-rounded-full tw-bg-green-100 tw-text-green-800">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Revenue Chart Placeholder */}
        <div className="tw-bg-white tw-shadow tw-rounded-lg">
          <div className="tw-px-6 tw-py-4 tw-border-b tw-border-gray-200">
            <h3 className="tw-text-lg tw-font-medium tw-text-gray-900">Revenue Trend</h3>
          </div>
          <div className="tw-p-6">
            <div className="tw-h-64 tw-flex tw-items-center tw-justify-center tw-bg-gray-50 tw-rounded-lg">
              <div className="tw-text-center">
                <ChartBarIcon className="tw-mx-auto tw-h-12 tw-w-12 tw-text-gray-400" />
                <p className="tw-mt-2 tw-text-sm tw-text-gray-500">
                  Chart visualization would go here
                </p>
                <p className="tw-text-xs tw-text-gray-400">
                  Integration with charting library needed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BasicAdminLayout>
  );
};

export default AdminAnalyticsPage;
