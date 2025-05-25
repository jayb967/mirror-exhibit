'use client';

import { useState, useEffect } from 'react';
import SimpleAdminLayout from '@/components/admin/SimpleAdminLayout';
import TagModal from '@/components/admin/TagModal';
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

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const categories = ['fashion', 'emotion', 'style', 'theme'];

  // Fetch tags from API
  const fetchTags = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (showInactive) params.append('includeInactive', 'true');
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/tags?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setTags(data.tags);
      } else {
        toast.error('Failed to fetch tags');
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast.error('Error loading tags');
    } finally {
      setLoading(false);
    }
  };

  // Load tags on component mount and when filters change
  useEffect(() => {
    fetchTags();
  }, [searchTerm, selectedCategory, showInactive]);

  // Handle create new tag
  const handleCreate = () => {
    setEditingTag(null);
    setModalOpen(true);
  };

  // Handle edit tag
  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setModalOpen(true);
  };

  // Handle delete tag
  const handleDelete = async (tag: Tag) => {
    if (tag.product_count > 0) {
      toast.error(`Cannot delete ${tag.name} - it's assigned to ${tag.product_count} products`);
      return;
    }

    if (!confirm(`Are you sure you want to delete "${tag.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tags/${tag.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Tag deleted successfully');
        fetchTags(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to delete tag');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('Error deleting tag');
    }
  };

  // Handle modal save
  const handleModalSave = () => {
    setModalOpen(false);
    setEditingTag(null);
    fetchTags(); // Refresh the list
  };

  // Group tags by category
  const groupedTags = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  return (
    <SimpleAdminLayout>
      <div className="admin-tags-page">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Tag Management</h1>
          <button
            className="tw-bg-black tw-text-white tw-px-4 tw-py-2 hover:tw-bg-gray-800 tw-transition-colors tw-border-0"
            onClick={handleCreate}
          >
            <i className="fas fa-plus me-2"></i>
            Add New Tag
          </button>
        </div>

        {/* Filters */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="showInactive"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="showInactive">
                Show inactive tags
              </label>
            </div>
          </div>
        </div>

        {/* Tags Display */}
        <div className="card">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : Object.keys(groupedTags).length === 0 ? (
              <div className="text-center py-4">
                <p>No tags found</p>
              </div>
            ) : (
              <div>
                {categories.map(category => {
                  const categoryTags = groupedTags[category] || [];
                  if (categoryTags.length === 0) return null;

                  return (
                    <div key={category} className="mb-4">
                      <h5 className="text-capitalize mb-3">
                        {category} Tags ({categoryTags.length})
                      </h5>
                      <div className="row">
                        {categoryTags.map((tag) => (
                          <div key={tag.id} className="col-md-6 col-lg-4 mb-3">
                            <div
                              className="card h-100"
                              style={{ cursor: 'pointer', borderLeft: `4px solid ${tag.color}` }}
                              onClick={() => handleEdit(tag)}
                            >
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div className="d-flex align-items-center">
                                    <div
                                      style={{
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: tag.color,
                                        borderRadius: '50%',
                                        marginRight: '8px',
                                        border: '1px solid #dee2e6'
                                      }}
                                    ></div>
                                    <h6 className="card-title mb-0">{tag.name}</h6>
                                  </div>
                                  <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      className="tw-bg-gray-100 tw-text-gray-600 tw-px-2 tw-py-1 tw-text-xs hover:tw-bg-gray-200 tw-transition-colors tw-border-0 dropdown-toggle"
                                      type="button"
                                      data-bs-toggle="dropdown"
                                    >
                                      <i className="fas fa-ellipsis-v"></i>
                                    </button>
                                    <ul className="dropdown-menu">
                                      <li>
                                        <button
                                          className="dropdown-item"
                                          onClick={() => handleEdit(tag)}
                                        >
                                          <i className="fas fa-edit me-2"></i>Edit
                                        </button>
                                      </li>
                                      <li>
                                        <button
                                          className="dropdown-item text-danger"
                                          onClick={() => handleDelete(tag)}
                                          disabled={tag.product_count > 0}
                                        >
                                          <i className="fas fa-trash me-2"></i>Delete
                                        </button>
                                      </li>
                                    </ul>
                                  </div>
                                </div>

                                <p className="card-text small text-muted mb-2">
                                  {tag.description || 'No description'}
                                </p>

                                <div className="d-flex justify-content-between align-items-center">
                                  <span className="badge bg-info">
                                    {tag.product_count} products
                                  </span>
                                  <span className={`badge ${tag.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                    {tag.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Tag Modal */}
        <TagModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          tag={editingTag}
          onSave={handleModalSave}
        />
      </div>
    </SimpleAdminLayout>
  );
}
