'use client';

import { useState, useEffect } from 'react';
import SimpleAdminLayout from '@/components/admin/SimpleAdminLayout';
import BrandModal from '@/components/admin/BrandModal';
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

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fetch brands from API
  const fetchBrands = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (showInactive) params.append('includeInactive', 'true');
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/brands?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setBrands(data.brands);
      } else {
        toast.error('Failed to fetch brands');
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Error loading brands');
    } finally {
      setLoading(false);
    }
  };

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load brands on component mount and when filters change
  useEffect(() => {
    if (mounted) {
      fetchBrands();
    }
  }, [mounted, searchTerm, showInactive]);

  // Handle create new brand
  const handleCreate = () => {
    setEditingBrand(null);
    setModalOpen(true);
  };

  // Handle edit brand
  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setModalOpen(true);
  };

  // Handle delete brand
  const handleDelete = async (brand: Brand) => {
    if (brand.product_count > 0) {
      toast.error(`Cannot delete ${brand.name} - it has ${brand.product_count} products assigned`);
      return;
    }

    if (!confirm(`Are you sure you want to delete "${brand.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/brands/${brand.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Brand deleted successfully');
        fetchBrands(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to delete brand');
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error('Error deleting brand');
    }
  };

  // Handle modal save
  const handleModalSave = () => {
    setModalOpen(false);
    setEditingBrand(null);
    fetchBrands(); // Refresh the list
  };

  // Filter brands based on search
  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) {
    return (
      <SimpleAdminLayout>
        <div className="admin-brands-page">
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
      <div className="admin-brands-page">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Brand Management</h1>
          <button
            className="tw-bg-black tw-text-white tw-px-4 tw-py-2 hover:tw-bg-gray-800 tw-transition-colors tw-border-0"
            onClick={handleCreate}
          >
            <i className="fas fa-plus me-2"></i>
            Add New Brand
          </button>
        </div>

        {/* Filters */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="showInactive"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="showInactive">
                Show inactive brands
              </label>
            </div>
          </div>
        </div>

        {/* Brands Table */}
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
                      <th>Logo</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Products</th>
                      <th>Status</th>
                      <th>Website</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBrands.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          No brands found
                        </td>
                      </tr>
                    ) : (
                      filteredBrands.map((brand) => (
                        <tr
                          key={brand.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleEdit(brand)}
                        >
                          <td>
                            {brand.logo_url ? (
                              <img
                                src={brand.logo_url}
                                alt={brand.name}
                                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  backgroundColor: '#f8f9fa',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid #dee2e6',
                                  borderRadius: '4px'
                                }}
                              >
                                <i className="fas fa-image text-muted"></i>
                              </div>
                            )}
                          </td>
                          <td>
                            <strong>{brand.name}</strong>
                            <br />
                            <small className="text-muted">{brand.slug}</small>
                          </td>
                          <td>
                            <div style={{ maxWidth: '200px' }}>
                              {brand.description ? (
                                <span>{brand.description.substring(0, 100)}{brand.description.length > 100 ? '...' : ''}</span>
                              ) : (
                                <span className="text-muted">No description</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-info">
                              {brand.product_count} products
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${brand.is_active ? 'bg-success' : 'bg-secondary'}`}>
                              {brand.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            {brand.website_url ? (
                              <a
                                href={brand.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="tw-bg-[#A6A182] tw-text-white tw-px-2 tw-py-1 tw-text-xs hover:tw-bg-[#8F8A6F] tw-transition-colors tw-border-0"
                              >
                                <i className="fas fa-external-link-alt"></i>
                              </a>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <div className="btn-group" onClick={(e) => e.stopPropagation()}>
                              <button
                                className="tw-bg-black tw-text-white tw-px-3 tw-py-1 tw-text-xs hover:tw-bg-gray-800 tw-transition-colors tw-border-0 tw-mr-1"
                                onClick={() => handleEdit(brand)}
                                title="Edit"
                              >
                                <i className="fas fa-edit tw-text-white"></i>
                              </button>
                              <button
                                className="tw-bg-red-600 tw-text-white tw-px-3 tw-py-1 tw-text-xs hover:tw-bg-red-700 tw-transition-colors tw-border-0 disabled:tw-bg-gray-400 disabled:tw-cursor-not-allowed"
                                onClick={() => handleDelete(brand)}
                                disabled={brand.product_count > 0}
                                title={brand.product_count > 0 ? 'Cannot delete - has products' : 'Delete'}
                              >
                                <i className="fas fa-trash tw-text-white"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Brand Modal */}
        <BrandModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          brand={editingBrand}
          onSave={handleModalSave}
        />
      </div>
    </SimpleAdminLayout>
  );
}
