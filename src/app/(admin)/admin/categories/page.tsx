'use client';

import { useState, useEffect } from 'react';
import SimpleAdminLayout from '@/components/admin/SimpleAdminLayout';
import CategoryModal from '@/components/admin/CategoryModal';
import { toast } from 'react-toastify';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  parent_id: string | null;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (showInactive) params.append('includeInactive', 'true');
      if (searchTerm) params.append('search', searchTerm);
      params.append('includeProductCount', 'true');

      const response = await fetch(`/api/admin/categories?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories);
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error loading categories');
    } finally {
      setLoading(false);
    }
  };

  // Load categories on component mount and when filters change
  useEffect(() => {
    if (mounted) {
      fetchCategories();
    }
  }, [mounted, searchTerm, showInactive]);

  // Handle create new category
  const handleCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  // Handle edit category
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  // Handle delete category
  const handleDelete = async (category: Category) => {
    if (category.product_count > 0) {
      toast.error('Cannot delete category that has products assigned to it');
      return;
    }

    if (!confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Category deleted successfully');
        fetchCategories(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error deleting category');
    }
  };

  // Handle modal save
  const handleModalSave = () => {
    setModalOpen(false);
    setEditingCategory(null);
    fetchCategories(); // Refresh the list
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group categories by parent/child relationship
  const topLevelCategories = filteredCategories.filter(cat => !cat.parent_id);
  const subcategories = filteredCategories.filter(cat => cat.parent_id);

  if (!mounted) {
    return (
      <SimpleAdminLayout>
        <div className="admin-categories-page">
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </SimpleAdminLayout>
    );
  }

  return (
    <SimpleAdminLayout>
      <div className="admin-categories-page">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Category Management</h1>
          <button
            className="tw-bg-black tw-text-white tw-px-4 tw-py-2 hover:tw-bg-gray-800 tw-transition-colors tw-border-0"
            onClick={handleCreate}
          >
            <i className="fas fa-plus me-2"></i>
            Add New Category
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="search" className="form-label">Search Categories</label>
                  <input
                    type="text"
                    className="form-control"
                    id="search"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label">Options</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="showInactive"
                      checked={showInactive}
                      onChange={(e) => setShowInactive(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="showInactive">
                      Show inactive categories
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <div className="card">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Parent</th>
                      <th>Products</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          No categories found
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((category) => {
                        const parentCategory = categories.find(cat => cat.id === category.parent_id);
                        
                        return (
                          <tr
                            key={category.id}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleEdit(category)}
                          >
                            <td>
                              {category.image_url ? (
                                <img
                                  src={category.image_url}
                                  alt={category.name}
                                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                  className="rounded"
                                />
                              ) : (
                                <div
                                  style={{ width: '50px', height: '50px' }}
                                  className="bg-light rounded d-flex align-items-center justify-content-center"
                                >
                                  <i className="fas fa-image text-muted"></i>
                                </div>
                              )}
                            </td>
                            <td>
                              <strong>{category.name}</strong>
                              {category.parent_id && (
                                <div className="text-muted small">
                                  <i className="fas fa-level-up-alt me-1"></i>
                                  Subcategory
                                </div>
                              )}
                            </td>
                            <td>
                              <div style={{ maxWidth: '200px' }}>
                                {category.description || <span className="text-muted">No description</span>}
                              </div>
                            </td>
                            <td>
                              {parentCategory ? (
                                <span className="badge bg-secondary">
                                  {parentCategory.name}
                                </span>
                              ) : (
                                <span className="text-muted">Top Level</span>
                              )}
                            </td>
                            <td>
                              <span className="badge bg-info">
                                {category.product_count || 0}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${category.is_active ? 'bg-success' : 'bg-danger'}`}>
                                {category.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(category);
                                  }}
                                  title="Edit"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(category);
                                  }}
                                  title="Delete"
                                  disabled={category.product_count > 0}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Category Modal */}
        <CategoryModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleModalSave}
          category={editingCategory}
          categories={categories}
        />
      </div>
    </SimpleAdminLayout>
  );
}
