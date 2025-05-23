'use client';

import React, { useState } from 'react';
import { 
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  tracking_number?: string;
  shipping_address: any;
  order_items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
}

interface OrderManagementProps {
  orders: Order[];
  onStatusUpdate: (orderId: string, newStatus: string, notes?: string) => Promise<void>;
  onViewOrder: (orderId: string) => void;
  loading?: boolean;
}

const OrderManagement: React.FC<OrderManagementProps> = ({
  orders,
  onStatusUpdate,
  onViewOrder,
  loading = false
}) => {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [statusUpdateModal, setStatusUpdateModal] = useState<{
    isOpen: boolean;
    orderId: string;
    currentStatus: string;
  }>({
    isOpen: false,
    orderId: '',
    currentStatus: ''
  });
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const orderStatuses = [
    { value: 'pending', label: 'Pending', color: 'tw-text-yellow-700 tw-bg-yellow-100' },
    { value: 'confirmed', label: 'Confirmed', color: 'tw-text-blue-700 tw-bg-blue-100' },
    { value: 'paid', label: 'Paid', color: 'tw-text-green-700 tw-bg-green-100' },
    { value: 'processing', label: 'Processing', color: 'tw-text-purple-700 tw-bg-purple-100' },
    { value: 'shipped', label: 'Shipped', color: 'tw-text-indigo-700 tw-bg-indigo-100' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'tw-text-blue-700 tw-bg-blue-100' },
    { value: 'delivered', label: 'Delivered', color: 'tw-text-green-700 tw-bg-green-100' },
    { value: 'canceled', label: 'Canceled', color: 'tw-text-red-700 tw-bg-red-100' },
    { value: 'refunded', label: 'Refunded', color: 'tw-text-gray-700 tw-bg-gray-100' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const statusConfig = orderStatuses.find(s => s.value === status);
    return statusConfig?.color || 'tw-text-gray-700 tw-bg-gray-100';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className="tw-h-4 tw-w-4 tw-text-green-600" />;
      case 'shipped':
      case 'out_for_delivery':
        return <TruckIcon className="tw-h-4 tw-w-4" style={{ color: '#A6A182' }} />;
      case 'canceled':
      case 'refunded':
        return <ExclamationTriangleIcon className="tw-h-4 tw-w-4 tw-text-red-600" />;
      default:
        return <ClockIcon className="tw-h-4 tw-w-4" style={{ color: '#A6A182' }} />;
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return;

    try {
      setUpdating(true);
      await Promise.all(
        selectedOrders.map(orderId => onStatusUpdate(orderId, bulkAction))
      );
      setSelectedOrders([]);
      setBulkAction('');
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;

    try {
      setUpdating(true);
      await onStatusUpdate(statusUpdateModal.orderId, newStatus, statusNotes);
      setStatusUpdateModal({ isOpen: false, orderId: '', currentStatus: '' });
      setNewStatus('');
      setStatusNotes('');
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const openStatusModal = (orderId: string, currentStatus: string) => {
    setStatusUpdateModal({ isOpen: true, orderId, currentStatus });
    setNewStatus(currentStatus);
  };

  if (loading) {
    return (
      <div className="tw-flex tw-items-center tw-justify-center tw-h-64">
        <div className="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-b-2" style={{ borderColor: '#A6A182' }}></div>
      </div>
    );
  }

  return (
    <div className="tw-space-y-4">
      {/* Bulk Actions */}
      {orders.length > 0 && (
        <div className="tw-bg-white tw-p-4 tw-rounded-lg tw-shadow tw-flex tw-items-center tw-justify-between">
          <div className="tw-flex tw-items-center tw-space-x-4">
            <label className="tw-flex tw-items-center">
              <input
                type="checkbox"
                checked={selectedOrders.length === orders.length && orders.length > 0}
                onChange={handleSelectAll}
                className="tw-rounded tw-border-gray-300 tw-text-indigo-600 tw-shadow-sm focus:tw-border-indigo-300 focus:tw-ring focus:tw-ring-indigo-200 focus:tw-ring-opacity-50"
              />
              <span className="tw-ml-2 tw-text-sm tw-text-gray-700">
                Select All ({selectedOrders.length} selected)
              </span>
            </label>
            
            {selectedOrders.length > 0 && (
              <div className="tw-flex tw-items-center tw-space-x-2">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="tw-block tw-pl-3 tw-pr-10 tw-py-2 tw-text-sm tw-border-gray-300 focus:tw-outline-none tw-rounded-md"
                  style={{ borderColor: '#A6A182' }}
                >
                  <option value="">Bulk Actions</option>
                  {orderStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      Mark as {status.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction || updating}
                  className="tw-px-3 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-md tw-text-white tw-shadow-sm hover:tw-opacity-90 disabled:tw-opacity-50"
                  style={{ backgroundColor: '#A6A182' }}
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="tw-bg-white tw-shadow tw-rounded-lg tw-overflow-hidden">
        {orders.length > 0 ? (
          <div className="tw-divide-y tw-divide-gray-200">
            {orders.map((order) => (
              <div key={order.id} className="tw-p-6 hover:tw-bg-gray-50 tw-transition-colors">
                <div className="tw-flex tw-items-start tw-space-x-4">
                  <label className="tw-flex tw-items-center tw-mt-1">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleSelectOrder(order.id)}
                      className="tw-rounded tw-border-gray-300 tw-text-indigo-600 tw-shadow-sm focus:tw-border-indigo-300 focus:tw-ring focus:tw-ring-indigo-200 focus:tw-ring-opacity-50"
                    />
                  </label>
                  
                  <div className="tw-flex-1 tw-min-w-0">
                    <div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
                      <div className="tw-flex tw-items-center tw-space-x-3">
                        <h3 className="tw-text-lg tw-font-medium tw-text-gray-900">
                          Order #{order.id.substring(0, 8)}
                        </h3>
                        <div className="tw-flex tw-items-center tw-space-x-1">
                          {getStatusIcon(order.status)}
                          <span className={`tw-px-2 tw-py-1 tw-text-xs tw-font-medium tw-rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="tw-text-right">
                        <p className="tw-text-lg tw-font-medium tw-text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </p>
                        <p className="tw-text-sm tw-text-gray-500">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4 tw-mb-4">
                      <div>
                        <p className="tw-text-sm tw-font-medium tw-text-gray-900">Customer</p>
                        <p className="tw-text-sm tw-text-gray-600">{order.customer_name}</p>
                        <p className="tw-text-sm tw-text-gray-600">{order.customer_email}</p>
                      </div>
                      <div>
                        <p className="tw-text-sm tw-font-medium tw-text-gray-900">Items</p>
                        <p className="tw-text-sm tw-text-gray-600">
                          {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                          {order.order_items.length > 0 && (
                            <span className="tw-ml-2">
                              {order.order_items[0].product_name}
                              {order.order_items.length > 1 && ` +${order.order_items.length - 1} more`}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {order.tracking_number && (
                      <div className="tw-mb-4 tw-p-3 tw-bg-gray-50 tw-rounded-md">
                        <div className="tw-flex tw-items-center tw-space-x-2">
                          <TruckIcon className="tw-h-4 tw-w-4" style={{ color: '#A6A182' }} />
                          <span className="tw-text-sm tw-font-medium tw-text-gray-900">
                            Tracking: {order.tracking_number}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="tw-flex tw-items-center tw-justify-between">
                      <div className="tw-flex tw-space-x-2">
                        <button
                          onClick={() => onViewOrder(order.id)}
                          className="tw-inline-flex tw-items-center tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-shadow-sm tw-text-sm tw-leading-4 tw-font-medium tw-rounded-md tw-text-gray-700 tw-bg-white hover:tw-bg-gray-50"
                        >
                          <EyeIcon className="tw--ml-0.5 tw-mr-2 tw-h-4 tw-w-4" />
                          View Details
                        </button>
                        
                        <button
                          onClick={() => openStatusModal(order.id, order.status)}
                          className="tw-inline-flex tw-items-center tw-px-3 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-leading-4 tw-font-medium tw-rounded-md tw-text-white tw-shadow-sm hover:tw-opacity-90"
                          style={{ backgroundColor: '#A6A182' }}
                        >
                          <PencilIcon className="tw--ml-0.5 tw-mr-2 tw-h-4 tw-w-4" />
                          Update Status
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="tw-text-center tw-py-12">
            <div className="tw-mx-auto tw-h-12 tw-w-12 tw-text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="tw-mt-2 tw-text-sm tw-font-medium tw-text-gray-900">No orders found</h3>
            <p className="tw-mt-1 tw-text-sm tw-text-gray-500">
              Orders will appear here when customers place them.
            </p>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {statusUpdateModal.isOpen && (
        <div className="tw-fixed tw-inset-0 tw-z-50 tw-overflow-y-auto">
          <div className="tw-flex tw-items-end tw-justify-center tw-min-h-screen tw-pt-4 tw-px-4 tw-pb-20 tw-text-center sm:tw-block sm:tw-p-0">
            <div className="tw-fixed tw-inset-0 tw-bg-gray-500 tw-bg-opacity-75 tw-transition-opacity" onClick={() => setStatusUpdateModal({ isOpen: false, orderId: '', currentStatus: '' })}></div>
            
            <div className="tw-inline-block tw-align-bottom tw-bg-white tw-rounded-lg tw-text-left tw-overflow-hidden tw-shadow-xl tw-transform tw-transition-all sm:tw-my-8 sm:tw-align-middle sm:tw-max-w-lg sm:tw-w-full">
              <div className="tw-bg-white tw-px-4 tw-pt-5 tw-pb-4 sm:tw-p-6 sm:tw-pb-4">
                <h3 className="tw-text-lg tw-leading-6 tw-font-medium tw-text-gray-900 tw-mb-4">
                  Update Order Status
                </h3>
                
                <div className="tw-space-y-4">
                  <div>
                    <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                      New Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="tw-block tw-w-full tw-pl-3 tw-pr-10 tw-py-2 tw-text-base tw-border-gray-300 focus:tw-outline-none tw-rounded-md"
                      style={{ borderColor: '#A6A182' }}
                    >
                      {orderStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      rows={3}
                      className="tw-block tw-w-full tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-ring-indigo-500 focus:tw-border-indigo-500"
                      placeholder="Add any notes about this status change..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="tw-bg-gray-50 tw-px-4 tw-py-3 sm:tw-px-6 sm:tw-flex sm:tw-flex-row-reverse">
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating || !newStatus}
                  className="tw-w-full tw-inline-flex tw-justify-center tw-rounded-md tw-border tw-border-transparent tw-shadow-sm tw-px-4 tw-py-2 tw-text-base tw-font-medium tw-text-white sm:tw-ml-3 sm:tw-w-auto sm:tw-text-sm disabled:tw-opacity-50"
                  style={{ backgroundColor: '#A6A182' }}
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
                <button
                  onClick={() => setStatusUpdateModal({ isOpen: false, orderId: '', currentStatus: '' })}
                  className="tw-mt-3 tw-w-full tw-inline-flex tw-justify-center tw-rounded-md tw-border tw-border-gray-300 tw-shadow-sm tw-px-4 tw-py-2 tw-bg-white tw-text-base tw-font-medium tw-text-gray-700 hover:tw-bg-gray-50 sm:tw-mt-0 sm:tw-ml-3 sm:tw-w-auto sm:tw-text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
