'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-toastify';
import AdminLayout from '@/components/admin/layout/AdminLayout';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  starts_at: string;
  expires_at: string | null;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CouponsPage = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minPurchase, setMinPurchase] = useState('0');
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [isActive, setIsActive] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const couponData = {
        code: code.toUpperCase(),
        description: description || null,
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        min_purchase: parseFloat(minPurchase),
        starts_at: startsAt || new Date().toISOString(),
        expires_at: expiresAt || null,
        max_uses: maxUses ? parseInt(maxUses) : null,
        is_active: isActive
      };

      if (editingCoupon) {
        // Update existing coupon
        const { error } = await supabase
          .from('coupons')
          .update({
            ...couponData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCoupon.id);

        if (error) {
          throw error;
        }

        toast.success('Coupon updated successfully');
      } else {
        // Create new coupon
        const { error } = await supabase
          .from('coupons')
          .insert({
            ...couponData,
            current_uses: 0
          });

        if (error) {
          throw error;
        }

        toast.success('Coupon created successfully');
      }

      // Reset form and refresh coupons
      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error('Failed to save coupon');
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDescription(coupon.description || '');
    setDiscountType(coupon.discount_type);
    setDiscountValue(coupon.discount_value.toString());
    setMinPurchase(coupon.min_purchase.toString());
    setStartsAt(coupon.starts_at ? new Date(coupon.starts_at).toISOString().split('T')[0] : '');
    setExpiresAt(coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : '');
    setMaxUses(coupon.max_uses?.toString() || '');
    setIsActive(coupon.is_active);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Failed to delete coupon');
    }
  };

  const resetForm = () => {
    setEditingCoupon(null);
    setCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMinPurchase('0');
    setStartsAt('');
    setExpiresAt('');
    setMaxUses('');
    setIsActive(true);
    setFormOpen(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`;
    } else {
      return `$${coupon.discount_value.toFixed(2)}`;
    }
  };

  return (
    <AdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
        <h1 className="tw-text-2xl tw-font-bold">Coupons</h1>
        <button
          className="tw-bg-black tw-text-white tw-px-4 tw-py-2"
          onClick={() => setFormOpen(!formOpen)}
        >
          {formOpen ? 'Cancel' : 'Add New Coupon'}
        </button>
      </div>

      {formOpen && (
        <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6 tw-mb-8">
          <h2 className="tw-text-xl tw-font-semibold tw-mb-4">
            {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
          </h2>

          <form onSubmit={handleSubmit} className="tw-space-y-4">
            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Coupon Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2 tw-uppercase"
                required
                disabled={!!editingCoupon}
                placeholder="e.g., SUMMER20"
              />
            </div>

            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                rows={2}
                placeholder="e.g., Summer sale discount"
              />
            </div>

            <div className="tw-flex tw-space-x-4">
              <div className="tw-flex-1">
                <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                  className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div className="tw-flex-1">
                <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">
                  {discountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount ($)'}
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                  min="0"
                  step={discountType === 'percentage' ? '1' : '0.01'}
                  max={discountType === 'percentage' ? '100' : undefined}
                  required
                />
              </div>
            </div>

            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">
                Minimum Purchase Amount ($)
              </label>
              <input
                type="number"
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value)}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="tw-flex tw-space-x-4">
              <div className="tw-flex-1">
                <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Start Date</label>
                <input
                  type="date"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                />
                <p className="tw-text-xs tw-text-gray-500 tw-mt-1">
                  Leave empty to start immediately
                </p>
              </div>

              <div className="tw-flex-1">
                <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                />
                <p className="tw-text-xs tw-text-gray-500 tw-mt-1">
                  Leave empty for no expiration
                </p>
              </div>
            </div>

            <div className="tw-flex tw-space-x-4">
              <div className="tw-flex-1">
                <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">
                  Maximum Uses
                </label>
                <input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                  min="1"
                  step="1"
                />
                <p className="tw-text-xs tw-text-gray-500 tw-mt-1">
                  Leave empty for unlimited uses
                </p>
              </div>

              <div className="tw-flex-1">
                <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Status</label>
                <div className="tw-flex tw-items-center tw-space-x-4 tw-mt-2">
                  <label className="tw-flex tw-items-center">
                    <input
                      type="radio"
                      checked={isActive}
                      onChange={() => setIsActive(true)}
                      className="tw-mr-2"
                    />
                    Active
                  </label>
                  <label className="tw-flex tw-items-center">
                    <input
                      type="radio"
                      checked={!isActive}
                      onChange={() => setIsActive(false)}
                      className="tw-mr-2"
                    />
                    Inactive
                  </label>
                </div>
              </div>
            </div>

            <div className="tw-flex tw-justify-end tw-space-x-3 tw-pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="tw-bg-gray-200 tw-text-gray-800 tw-px-4 tw-py-2 tw-rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="tw-bg-[#A6A182] tw-text-white tw-px-4 tw-py-2"
              >
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="tw-flex tw-justify-center tw-py-8">
          <div className="tw-animate-spin tw-rounded-full tw-h-8 tw-w-8 tw-border-b-2 tw-border-gray-900"></div>
        </div>
      ) : coupons.length === 0 ? (
        <div className="tw-bg-gray-50 tw-p-8 tw-rounded tw-text-center">
          <p className="tw-text-gray-600">No coupons found.</p>
          <button
            className="tw-mt-4 tw-bg-black tw-text-white tw-px-4 tw-py-2"
            onClick={() => setFormOpen(true)}
          >
            Create Your First Coupon
          </button>
        </div>
      ) : (
        <div className="tw-overflow-x-auto">
          <table className="tw-min-w-full tw-bg-white tw-rounded-lg tw-shadow">
            <thead className="tw-bg-gray-100">
              <tr>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-medium">Code</th>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-medium">Discount</th>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-medium">Min. Purchase</th>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-medium">Validity</th>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-medium">Usage</th>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-medium">Status</th>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="tw-divide-y tw-divide-gray-200">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:tw-bg-gray-50">
                  <td className="tw-px-4 tw-py-3 tw-text-sm">
                    <div className="tw-font-medium">{coupon.code}</div>
                    {coupon.description && (
                      <div className="tw-text-xs tw-text-gray-500">{coupon.description}</div>
                    )}
                  </td>
                  <td className="tw-px-4 tw-py-3 tw-text-sm">
                    {formatDiscount(coupon)}
                  </td>
                  <td className="tw-px-4 tw-py-3 tw-text-sm">
                    ${coupon.min_purchase.toFixed(2)}
                  </td>
                  <td className="tw-px-4 tw-py-3 tw-text-sm">
                    <div>From: {formatDate(coupon.starts_at)}</div>
                    {coupon.expires_at && (
                      <div>To: {formatDate(coupon.expires_at)}</div>
                    )}
                  </td>
                  <td className="tw-px-4 tw-py-3 tw-text-sm">
                    {coupon.current_uses} / {coupon.max_uses || '∞'}
                  </td>
                  <td className="tw-px-4 tw-py-3 tw-text-sm">
                    <span
                      className={`tw-px-2 tw-py-1 tw-rounded-full tw-text-xs ${
                        coupon.is_active
                          ? 'tw-bg-green-100 tw-text-green-800'
                          : 'tw-bg-red-100 tw-text-red-800'
                      }`}
                    >
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="tw-px-4 tw-py-3 tw-text-sm">
                    <div className="tw-flex tw-space-x-2">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="tw-text-blue-600 hover:tw-text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="tw-text-red-600 hover:tw-text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default CouponsPage;
