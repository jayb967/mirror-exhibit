'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  category: string;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tag: Tag | null; // null for create, Tag object for edit
  onSave: () => void;
}

const categories = [
  { value: 'fashion', label: 'Fashion', description: 'Style and fashion related tags' },
  { value: 'emotion', label: 'Emotion', description: 'Emotional and mood tags' },
  { value: 'style', label: 'Style', description: 'Design and aesthetic tags' },
  { value: 'theme', label: 'Theme', description: 'Thematic and subject tags' }
];

const predefinedColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
];

export default function TagModal({ isOpen, onClose, tag, onSave }: TagModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#4ECDC4',
    category: 'theme',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or tag changes
  useEffect(() => {
    if (isOpen) {
      if (tag) {
        // Edit mode - populate form with tag data
        setFormData({
          name: tag.name || '',
          description: tag.description || '',
          color: tag.color || '#4ECDC4',
          category: tag.category || 'theme',
          is_active: tag.is_active
        });
      } else {
        // Create mode - reset form
        setFormData({
          name: '',
          description: '',
          color: '#4ECDC4',
          category: 'theme',
          is_active: true
        });
      }
      setErrors({});
    }
  }, [isOpen, tag]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setFormData(prev => ({
      ...prev,
      color
    }));
    if (errors.color) {
      setErrors(prev => ({
        ...prev,
        color: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tag name is required';
    }

    if (!formData.color || !/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      newErrors.color = 'Please select a valid color';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const url = tag ? `/api/tags/${tag.id}` : '/api/tags';
      const method = tag ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(tag ? 'Tag updated successfully' : 'Tag created successfully');
        onSave();
        onClose();
      } else {
        toast.error(data.error || 'Failed to save tag');
      }
    } catch (error) {
      console.error('Error saving tag:', error);
      toast.error('Error saving tag');
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
              {tag ? 'Edit Tag' : 'Create New Tag'}
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
                {/* Tag Name */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="name" className="form-label">
                    Tag Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Luxury, Modern, Vintage"
                    disabled={loading}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                {/* Category */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="category" className="form-label">
                    Category <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && <div className="invalid-feedback">{errors.category}</div>}
                  <div className="form-text">
                    {categories.find(c => c.value === formData.category)?.description}
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
                  placeholder="Brief description of when to use this tag..."
                  disabled={loading}
                />
              </div>

              {/* Color Selection */}
              <div className="mb-3">
                <label className="form-label">
                  Tag Color <span className="text-danger">*</span>
                </label>
                <div className="d-flex align-items-center mb-2">
                  <input
                    type="color"
                    className={`form-control form-control-color me-3 ${errors.color ? 'is-invalid' : ''}`}
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    disabled={loading}
                    style={{ width: '60px', height: '40px' }}
                  />
                  <input
                    type="text"
                    className="form-control"
                    value={formData.color}
                    onChange={handleChange}
                    name="color"
                    placeholder="#000000"
                    disabled={loading}
                    style={{ maxWidth: '120px' }}
                  />
                  <div className="ms-3">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: formData.color,
                        color: getContrastColor(formData.color),
                        fontSize: '14px',
                        padding: '8px 12px'
                      }}
                    >
                      {formData.name || 'Preview'}
                    </span>
                  </div>
                </div>

                {/* Predefined Colors */}
                <div className="mb-2">
                  <small className="text-muted">Quick colors:</small>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {predefinedColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`btn p-0 ${formData.color === color ? 'border border-dark border-2' : ''}`}
                        style={{
                          width: '30px',
                          height: '30px',
                          backgroundColor: color,
                          borderRadius: '50%'
                        }}
                        onClick={() => handleColorSelect(color)}
                        disabled={loading}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                {errors.color && <div className="text-danger small">{errors.color}</div>}
              </div>

              {/* Status */}
              <div className="mb-3">
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

              {/* Show product count for existing tags */}
              {tag && (
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  This tag is currently assigned to <strong>{tag.product_count}</strong> product(s).
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
                    {tag ? 'Update Tag' : 'Create Tag'}
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

// Helper function to get contrasting text color
function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#ffffff';
}
