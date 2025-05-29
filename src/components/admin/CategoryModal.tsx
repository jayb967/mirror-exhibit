'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  parent_id: string | null;
  is_active: boolean;
  product_count?: number;
  created_at: string;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  category?: Category | null;
  categories: Category[]; // For parent category selection
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category,
  categories
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    parent_id: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (isOpen) {
      if (category) {
        // Editing existing category
        setFormData({
          name: category.name || '',
          description: category.description || '',
          image_url: category.image_url || '',
          parent_id: category.parent_id || '',
          is_active: category.is_active !== undefined ? category.is_active : true
        });
      } else {
        // Creating new category
        setFormData({
          name: '',
          description: '',
          image_url: '',
          parent_id: '',
          is_active: true
        });
      }
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setLoading(true);

    try {
      const url = category 
        ? `/api/admin/categories/${category.id}`
        : '/api/admin/categories';
      
      const method = category ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          parent_id: formData.parent_id || null
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(category ? 'Category updated successfully' : 'Category created successfully');
        onSave();
      } else {
        toast.error(data.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Error saving category');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Filter out current category from parent options to prevent circular reference
  const availableParentCategories = categories.filter(cat => 
    cat.id !== category?.id && cat.parent_id !== category?.id
  );

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {category ? 'Edit Category' : 'Add New Category'}
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
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="parent_id" className="form-label">
                      Parent Category
                    </label>
                    <select
                      className="form-select"
                      id="parent_id"
                      name="parent_id"
                      value={formData.parent_id}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="">No Parent (Top Level)</option>
                      {availableParentCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="image_url" className="form-label">
                  Image URL
                </label>
                <input
                  type="url"
                  className="form-control"
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  disabled={loading}
                />
                {formData.image_url && (
                  <div className="mt-2">
                    <img
                      src={formData.image_url}
                      alt="Category preview"
                      style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'cover' }}
                      className="border rounded"
                    />
                  </div>
                )}
              </div>

              <div className="mb-3">
                <div className="form-check">
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
                    Active
                  </label>
                </div>
              </div>

              {category && category.product_count !== undefined && (
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  This category has {category.product_count} product(s) assigned to it.
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving...
                  </>
                ) : (
                  category ? 'Update Category' : 'Create Category'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
