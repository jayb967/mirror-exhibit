'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  website_url: string;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand | null; // null for create, Brand object for edit
  onSave: () => void;
}

export default function BrandModal({ isOpen, onClose, brand, onSave }: BrandModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo_url: '',
    website_url: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or brand changes
  useEffect(() => {
    if (isOpen) {
      if (brand) {
        // Edit mode - populate form with brand data
        setFormData({
          name: brand.name || '',
          description: brand.description || '',
          logo_url: brand.logo_url || '',
          website_url: brand.website_url || '',
          is_active: brand.is_active
        });
      } else {
        // Create mode - reset form
        setFormData({
          name: '',
          description: '',
          logo_url: '',
          website_url: '',
          is_active: true
        });
      }
      setErrors({});
    }
  }, [isOpen, brand]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Brand name is required';
    }

    if (formData.website_url && !isValidUrl(formData.website_url)) {
      newErrors.website_url = 'Please enter a valid URL';
    }

    if (formData.logo_url && !isValidUrl(formData.logo_url)) {
      newErrors.logo_url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // URL validation helper
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const url = brand ? `/api/brands/${brand.id}` : '/api/brands';
      const method = brand ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(brand ? 'Brand updated successfully' : 'Brand created successfully');
        onSave();
        onClose();
      } else {
        toast.error(data.error || 'Failed to save brand');
      }
    } catch (error) {
      console.error('Error saving brand:', error);
      toast.error('Error saving brand');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {brand ? 'Edit Brand' : 'Create New Brand'}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                {/* Brand Name */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="name" className="form-label">
                    Brand Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Rolex, BMW, Nike"
                    disabled={loading}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                {/* Status */}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Status</label>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="is_active">
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-3">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the brand..."
                  disabled={loading}
                />
              </div>

              <div className="row">
                {/* Logo URL */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="logo_url" className="form-label">Logo URL</label>
                  <input
                    type="url"
                    className={`form-control ${errors.logo_url ? 'is-invalid' : ''}`}
                    id="logo_url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                    disabled={loading}
                  />
                  {errors.logo_url && <div className="invalid-feedback">{errors.logo_url}</div>}
                  {formData.logo_url && (
                    <div className="mt-2">
                      <img
                        src={formData.logo_url}
                        alt="Logo preview"
                        style={{ maxWidth: '100px', maxHeight: '50px', objectFit: 'contain' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Website URL */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="website_url" className="form-label">Website URL</label>
                  <input
                    type="url"
                    className={`form-control ${errors.website_url ? 'is-invalid' : ''}`}
                    id="website_url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleChange}
                    placeholder="https://brand-website.com"
                    disabled={loading}
                  />
                  {errors.website_url && <div className="invalid-feedback">{errors.website_url}</div>}
                </div>
              </div>

              {/* Show product count for existing brands */}
              {brand && (
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  This brand is currently assigned to <strong>{brand.product_count}</strong> product(s).
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="tw-bg-gray-500 tw-text-white tw-px-4 tw-py-2 hover:tw-bg-gray-600 tw-transition-colors tw-border-0 tw-mr-2"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="tw-bg-black tw-text-white tw-px-4 tw-py-2 hover:tw-bg-gray-800 tw-transition-colors tw-border-0 disabled:tw-bg-gray-400"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    {brand ? 'Update Brand' : 'Create Brand'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
