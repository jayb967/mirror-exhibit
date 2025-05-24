'use client';

import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@/utils/supabase-client';
import { toast } from 'react-toastify';

interface ShippingRule {
  id: string;
  name: string;
  description: string | null;
  rule_type: string;
  threshold_amount: number | null;
  category_id: string | null;
  product_id: string | null;
  country_codes: string[] | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
}

const ShippingRulesPage = () => {
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ShippingRule | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ruleType, setRuleType] = useState('threshold');
  const [thresholdAmount, setThresholdAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [productId, setProductId] = useState('');
  const [countryCodes, setCountryCodes] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState('10');

  const supabase = useSupabaseClient();

  useEffect(() => {
    fetchRules();
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('shipping_rules')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setRules(data || []);
    } catch (error) {
      console.error('Error fetching shipping rules:', error);
      toast.error('Failed to load shipping rules');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('id, name')
        .order('name');

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .order('name')
        .limit(100);

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const ruleData = {
        name,
        description: description || null,
        rule_type: ruleType,
        threshold_amount: ruleType === 'threshold' ? parseFloat(thresholdAmount) : null,
        category_id: ruleType === 'category_specific' ? categoryId : null,
        product_id: ruleType === 'product_specific' ? productId : null,
        country_codes: countryCodes ? countryCodes.split(',').map(code => code.trim()) : null,
        is_active: isActive,
        start_date: startDate || null,
        end_date: endDate || null,
        priority: parseInt(priority)
      };

      if (editingRule) {
        // Update existing rule
        const response = await fetch(`/api/shipping/rules`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: editingRule.id,
            ...ruleData
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update shipping rule');
        }

        toast.success('Shipping rule updated successfully');
      } else {
        // Create new rule
        const response = await fetch('/api/shipping/rules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(ruleData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create shipping rule');
        }

        toast.success('Shipping rule created successfully');
      }

      // Reset form and refresh rules
      resetForm();
      fetchRules();
    } catch (error) {
      console.error('Error saving shipping rule:', error);
      toast.error((error as Error).message);
    }
  };

  const handleEdit = (rule: ShippingRule) => {
    setEditingRule(rule);
    setName(rule.name);
    setDescription(rule.description || '');
    setRuleType(rule.rule_type);
    setThresholdAmount(rule.threshold_amount?.toString() || '');
    setCategoryId(rule.category_id || '');
    setProductId(rule.product_id || '');
    setCountryCodes(rule.country_codes?.join(', ') || '');
    setIsActive(rule.is_active);
    setStartDate(rule.start_date || '');
    setEndDate(rule.end_date || '');
    setPriority(rule.priority.toString());
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shipping rule?')) {
      return;
    }

    try {
      const response = await fetch(`/api/shipping/rules/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete shipping rule');
      }

      toast.success('Shipping rule deleted successfully');
      fetchRules();
    } catch (error) {
      console.error('Error deleting shipping rule:', error);
      toast.error((error as Error).message);
    }
  };

  const resetForm = () => {
    setEditingRule(null);
    setName('');
    setDescription('');
    setRuleType('threshold');
    setThresholdAmount('');
    setCategoryId('');
    setProductId('');
    setCountryCodes('');
    setIsActive(true);
    setStartDate('');
    setEndDate('');
    setPriority('10');
    setFormOpen(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
        <h1 className="tw-text-2xl tw-font-bold">Shipping Rules</h1>
        <button
          className="tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 tw-rounded"
          onClick={() => setFormOpen(!formOpen)}
        >
          {formOpen ? 'Cancel' : 'Add New Rule'}
        </button>
      </div>

      {formOpen && (
        <div className="tw-bg-white tw-rounded-lg tw-shadow-md tw-p-6 tw-mb-8">
          <h2 className="tw-text-xl tw-font-semibold tw-mb-4">
            {editingRule ? 'Edit Shipping Rule' : 'Create New Shipping Rule'}
          </h2>

          <form onSubmit={handleSubmit} className="tw-space-y-4">
            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Rule Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                required
              />
            </div>

            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                rows={2}
              />
            </div>

            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Rule Type</label>
              <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value)}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                required
              >
                <option value="threshold">Threshold-based (Free shipping over amount)</option>
                <option value="category_specific">Category-specific</option>
                <option value="product_specific">Product-specific</option>
              </select>
            </div>

            {ruleType === 'threshold' && (
              <div>
                <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Threshold Amount ($)</label>
                <input
                  type="number"
                  value={thresholdAmount}
                  onChange={(e) => setThresholdAmount(e.target.value)}
                  className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            )}

            {ruleType === 'category_specific' && (
              <div>
                <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {ruleType === 'product_specific' && (
              <div>
                <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Product</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">
                Country Codes (comma-separated, leave empty for all countries)
              </label>
              <input
                type="text"
                value={countryCodes}
                onChange={(e) => setCountryCodes(e.target.value)}
                className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                placeholder="US, CA, GB"
              />
              <p className="tw-text-xs tw-text-gray-500 tw-mt-1">
                Use ISO country codes (e.g., US, CA, GB)
              </p>
            </div>

            <div className="tw-flex tw-space-x-4">
              <div className="tw-flex-1">
                <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                />
              </div>

              <div className="tw-flex-1">
                <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                />
              </div>
            </div>

            <div className="tw-flex tw-space-x-4">
              <div className="tw-flex-1">
                <label className="tw-block tw-text-sm tw-font-medium tw-mb-1">Priority</label>
                <input
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="tw-w-full tw-border tw-border-gray-300 tw-rounded tw-px-3 tw-py-2"
                  min="0"
                  required
                />
                <p className="tw-text-xs tw-text-gray-500 tw-mt-1">
                  Higher number = higher priority
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
                className="tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 tw-rounded"
              >
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="tw-flex tw-justify-center tw-py-8">
          <div className="tw-animate-spin tw-rounded-full tw-h-8 tw-w-8 tw-border-b-2 tw-border-gray-900"></div>
        </div>
      ) : rules.length === 0 ? (
        <div className="tw-bg-gray-50 tw-p-8 tw-rounded tw-text-center">
          <p className="tw-text-gray-600">No shipping rules found.</p>
          <button
            className="tw-mt-4 tw-bg-blue-600 tw-text-white tw-px-4 tw-py-2 tw-rounded"
            onClick={() => setFormOpen(true)}
          >
            Create Your First Rule
          </button>
        </div>
      ) : (
        <div className="tw-overflow-x-auto">
          <table className="tw-min-w-full tw-bg-white tw-rounded-lg tw-shadow">
            <thead className="tw-bg-gray-100">
              <tr>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-medium">Name</th>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-medium">Type</th>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-medium">Details</th>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-medium">Dates</th>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-medium">Priority</th>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-medium">Status</th>
                <th className="tw-px-4 tw-py-3 tw-text-left tw-text-sm tw-font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="tw-divide-y tw-divide-gray-200">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:tw-bg-gray-50">
                  <td className="tw-px-4 tw-py-3 tw-text-sm">
                    <div className="tw-font-medium">{rule.name}</div>
                    {rule.description && (
                      <div className="tw-text-xs tw-text-gray-500">{rule.description}</div>
                    )}
                  </td>
                  <td className="tw-px-4 tw-py-3 tw-text-sm">
                    {rule.rule_type === 'threshold' && 'Threshold-based'}
                    {rule.rule_type === 'category_specific' && 'Category-specific'}
                    {rule.rule_type === 'product_specific' && 'Product-specific'}
                  </td>
                  <td className="tw-px-4 tw-py-3 tw-text-sm">
                    {rule.rule_type === 'threshold' && (
                      <span>Free shipping over ${rule.threshold_amount?.toFixed(2)}</span>
                    )}
                    {rule.rule_type === 'category_specific' && (
                      <span>
                        Category: {categories.find(c => c.id === rule.category_id)?.name || 'Unknown'}
                      </span>
                    )}
                    {rule.rule_type === 'product_specific' && (
                      <span>
                        Product: {products.find(p => p.id === rule.product_id)?.name || 'Unknown'}
                      </span>
                    )}
                    {rule.country_codes && rule.country_codes.length > 0 && (
                      <div className="tw-text-xs tw-text-gray-500 tw-mt-1">
                        Countries: {rule.country_codes.join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="tw-px-4 tw-py-3 tw-text-sm">
                    {rule.start_date && (
                      <div>From: {formatDate(rule.start_date)}</div>
                    )}
                    {rule.end_date && (
                      <div>To: {formatDate(rule.end_date)}</div>
                    )}
                    {!rule.start_date && !rule.end_date && (
                      <span>No date restrictions</span>
                    )}
                  </td>
                  <td className="tw-px-4 tw-py-3 tw-text-sm">{rule.priority}</td>
                  <td className="tw-px-4 tw-py-3 tw-text-sm">
                    <span
                      className={`tw-px-2 tw-py-1 tw-rounded-full tw-text-xs ${
                        rule.is_active
                          ? 'tw-bg-green-100 tw-text-green-800'
                          : 'tw-bg-red-100 tw-text-red-800'
                      }`}
                    >
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="tw-px-4 tw-py-3 tw-text-sm">
                    <div className="tw-flex tw-space-x-2">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="tw-text-blue-600 hover:tw-text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
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
  );
};

export default ShippingRulesPage;
