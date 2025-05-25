'use client';

import React, { useEffect, useState } from 'react';

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

interface Category {
  id: string;
  name: string;
  product_count?: number;
}

interface Size {
  id: string;
  name: string;
  code: string;
  dimensions: string;
  price_adjustment: number;
}

interface Brand {
  id: string;
  name: string;
  product_count?: number;
}

interface Tag {
  id: string;
  name: string;
  color: string;
  category: string;
}

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  sizes: Size[];
  brands?: Brand[];
  tags?: Tag[];
  selectedCategory: string;
  selectedSize: string;
  selectedBrand?: string;
  selectedTags?: string[];
  sortBy: string;
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  onSizeChange: (size: string) => void;
  onBrandChange?: (brand: string) => void;
  onTagToggle?: (tag: string) => void;
  onClearTags?: () => void;
  onSortChange: (sort: string) => void;
  onSearchChange: (query: string) => void;
  onApplyFilters: () => void;
}

const MobileFilterModal: React.FC<MobileFilterModalProps> = ({
  isOpen,
  onClose,
  categories,
  sizes,
  brands = [],
  tags = [],
  selectedCategory,
  selectedSize,
  selectedBrand = 'All Brands',
  selectedTags = [],
  sortBy,
  searchQuery,
  onCategoryChange,
  onSizeChange,
  onBrandChange,
  onTagToggle,
  onClearTags,
  onSortChange,
  onSearchChange,
  onApplyFilters
}) => {
  const [localSelectedCategory, setLocalSelectedCategory] = useState(selectedCategory);
  const [localSelectedSize, setLocalSelectedSize] = useState(selectedSize);
  const [localSelectedBrand, setLocalSelectedBrand] = useState(selectedBrand);
  const [localSelectedTags, setLocalSelectedTags] = useState<string[]>(selectedTags);
  const [localSortBy, setLocalSortBy] = useState(sortBy);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Update local state when props change
  useEffect(() => {
    setLocalSelectedCategory(selectedCategory);
    setLocalSelectedSize(selectedSize);
    setLocalSelectedBrand(selectedBrand);
    setLocalSelectedTags(selectedTags);
    setLocalSortBy(sortBy);
    setLocalSearchQuery(searchQuery);
  }, [selectedCategory, selectedSize, selectedBrand, selectedTags, sortBy, searchQuery]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleApplyFilters = () => {
    onCategoryChange(localSelectedCategory);
    onSizeChange(localSelectedSize);
    if (onBrandChange) onBrandChange(localSelectedBrand);
    // Apply tag changes
    if (onTagToggle && onClearTags) {
      onClearTags(); // Clear existing tags first
      localSelectedTags.forEach(tag => onTagToggle(tag)); // Apply selected tags
    }
    onSortChange(localSortBy);
    onSearchChange(localSearchQuery);
    onApplyFilters();
    onClose();
  };

  const handleClearFilters = () => {
    setLocalSelectedCategory('All Category');
    setLocalSelectedSize('All Sizes');
    setLocalSelectedBrand('All Brands');
    setLocalSelectedTags([]);
    setLocalSortBy('newest');
    setLocalSearchQuery('');
  };

  const handleLocalTagToggle = (tagName: string) => {
    setLocalSelectedTags(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(tag => tag !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="mobile-filter-backdrop"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="mobile-filter-modal">
        {/* Header */}
        <div className="mobile-filter-header">
          <h3>Filter Products</h3>
          <button
            className="mobile-filter-close"
            onClick={onClose}
            aria-label="Close filter"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="mobile-filter-content">
          {/* Search Section */}
          <div className="mobile-filter-section">
            <h4 className="mobile-filter-section-title">Search</h4>
            <div className="mobile-filter-search">
              <input
                type="text"
                placeholder="Search products..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="mobile-filter-search-input"
              />
            </div>
          </div>

          {/* Sort Section */}
          <div className="mobile-filter-section">
            <h4 className="mobile-filter-section-title">Sort By</h4>
            <div className="mobile-filter-sort">
              <select
                value={localSortBy}
                onChange={(e) => setLocalSortBy(e.target.value)}
                className="mobile-filter-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="featured">Featured Products</option>
              </select>
            </div>
          </div>

          {/* Categories Section */}
          <div className="mobile-filter-section">
            <h4 className="mobile-filter-section-title">Categories</h4>
            <div className="mobile-filter-categories">
              <button
                className={`mobile-filter-category-btn ${localSelectedCategory === 'All Category' ? 'active' : ''}`}
                onClick={() => setLocalSelectedCategory('All Category')}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`mobile-filter-category-btn ${localSelectedCategory === category.name ? 'active' : ''}`}
                  onClick={() => setLocalSelectedCategory(category.name)}
                >
                  {category.name}
                  {category.product_count !== undefined && (
                    <span className="category-count">({category.product_count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes Section */}
          <div className="mobile-filter-section">
            <h4 className="mobile-filter-section-title">Sizes</h4>
            <div className="mobile-filter-categories">
              <button
                className={`mobile-filter-category-btn ${localSelectedSize === 'All Sizes' ? 'active' : ''}`}
                onClick={() => setLocalSelectedSize('All Sizes')}
              >
                All Sizes
              </button>
              {sizes.map((size) => (
                <button
                  key={size.id}
                  className={`mobile-filter-category-btn ${localSelectedSize === size.name ? 'active' : ''}`}
                  onClick={() => setLocalSelectedSize(size.name)}
                >
                  {size.name}
                  <span className="category-count">({size.dimensions})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brands Section */}
          {brands.length > 0 && (
            <div className="mobile-filter-section">
              <h4 className="mobile-filter-section-title">Brands</h4>
              <div className="mobile-filter-categories">
                <button
                  className={`mobile-filter-category-btn ${localSelectedBrand === 'All Brands' ? 'active' : ''}`}
                  onClick={() => setLocalSelectedBrand('All Brands')}
                >
                  All Brands
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    className={`mobile-filter-category-btn ${localSelectedBrand === brand.name ? 'active' : ''}`}
                    onClick={() => setLocalSelectedBrand(brand.name)}
                  >
                    {brand.name}
                    {brand.product_count !== undefined && (
                      <span className="category-count">({brand.product_count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags Section */}
          {tags.length > 0 && (
            <div className="mobile-filter-section">
              <h4 className="mobile-filter-section-title">Tags</h4>
              {localSelectedTags.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <button
                    onClick={() => setLocalSelectedTags([])}
                    style={{
                      background: 'none',
                      border: '1px solid #ddd',
                      padding: '4px 8px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: '#666'
                    }}
                  >
                    Clear All Tags ({localSelectedTags.length})
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleLocalTagToggle(tag.name)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: localSelectedTags.includes(tag.name) ? tag.color : 'transparent',
                      color: localSelectedTags.includes(tag.name)
                        ? getContrastColor(tag.color)
                        : '#666',
                      border: `1px solid ${tag.color || '#ddd'}`,
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textDecoration: 'none'
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: tag.color || '#ddd',
                        marginRight: '6px',
                        border: '1px solid rgba(255,255,255,0.3)'
                      }}
                    ></span>
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mobile-filter-footer">
          <button
            className="mobile-filter-clear-btn"
            onClick={handleClearFilters}
          >
            Clear All
          </button>
          <button
            className="mobile-filter-apply-btn"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileFilterModal;
