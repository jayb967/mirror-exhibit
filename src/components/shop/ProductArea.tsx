'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import ReactPaginate from 'react-paginate';
// Define constants locally instead of importing from non-existent file
const product_title = "Product Categories";
const latest_title = "Latest Products";
import ProductOptionsModal from '../common/ProductOptionsModal';
import MobileFilterModal from './MobileFilterModal';
import FloatingFilterButton from './FloatingFilterButton';

// Helper function to get contrasting text color
function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

interface ProductType {
  _id?: number;
  id?: string;
  name?: string;
  title?: string;
  price: number;
  category: string | { name: string };
  image?: string;
  image_url?: string;
  brand?: string;
  brandData?: any;
  tags?: any[];
  variations?: any[];
  is_featured?: boolean;
  handle?: string;
  created_at?: string;
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

const ProductArea = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState('All Category');
  const [selectedSize, setSelectedSize] = useState('All Sizes');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [defaultOptions, setDefaultOptions] = useState({
    sizes: [],
    frameTypes: []
  });

  // Pagination
  const itemsPerPage = 9;
  const [itemOffset, setItemOffset] = useState(0);
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = products.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(products.length / itemsPerPage);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?include_count=true');
        const data = await response.json();
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch sizes
  useEffect(() => {
    const fetchSizes = async () => {
      try {
        const response = await fetch('/api/sizes');
        const data = await response.json();
        if (data.success && data.sizes) {
          setSizes(data.sizes);
        }
      } catch (err) {
        console.error('Error fetching sizes:', err);
      }
    };
    fetchSizes();
  }, []);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands');
        const data = await response.json();
        if (data.success && data.brands) {
          setBrands(data.brands);
        }
      } catch (err) {
        console.error('Error fetching brands:', err);
      }
    };
    fetchBrands();
  }, []);

  // Fetch tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        const data = await response.json();
        if (data.success && data.tags) {
          setTags(data.tags);
        }
      } catch (err) {
        console.error('Error fetching tags:', err);
      }
    };
    fetchTags();
  }, []);

  // Fetch latest products
  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await fetch('/api/products/latest?limit=3');
        const data = await response.json();
        if (data.success && data.products) {
          setLatestProducts(data.products);
        }
      } catch (err) {
        console.error('Error fetching latest products:', err);
      }
    };
    fetchLatestProducts();
  }, []);

  // Fetch products with filters
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (sortBy) params.append('sortBy', sortBy);
      if (searchQuery) params.append('search', searchQuery);
      if (selectedSize && selectedSize !== 'All Sizes') params.append('size', selectedSize);
      if (selected && selected !== 'All Category') params.append('category', selected);
      if (selectedBrand && selectedBrand !== 'All Brands') params.append('brand', selectedBrand);
      if (selectedTags && selectedTags.length > 0) params.append('tags', selectedTags.join(','));

      const response = await fetch(`/api/products/show?${params.toString()}`);
      const data = await response.json();

      if (data.success && data.products) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [sortBy, searchQuery, selectedSize, selected, selectedBrand, selectedTags]);

  // Fetch product options
  useEffect(() => {
    const fetchProductOptions = async () => {
      try {
        const response = await fetch('/api/product-options');
        const data = await response.json();
        if (data.success) {
          setDefaultOptions({
            sizes: data.sizes || [],
            frameTypes: data.frameTypes || []
          });
        }
      } catch (err) {
        console.error('Error fetching product options:', err);
      }
    };
    fetchProductOptions();
  }, []);

  // Event handlers
  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * itemsPerPage) % products.length;
    setItemOffset(newOffset);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategory = (category: string) => {
    setSelected(category);
    setItemOffset(0);
  };

  const handleSizeFilter = (size: string) => {
    setSelectedSize(size);
    setItemOffset(0);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setItemOffset(0);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setItemOffset(0);
  };

  const handleBrandFilter = (brand: string) => {
    setSelectedBrand(brand);
    setItemOffset(0);
  };

  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(tag => tag !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
    setItemOffset(0);
  };

  const clearAllTags = () => {
    setSelectedTags([]);
    setItemOffset(0);
  };

  const handleOpenModal = (product: any) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleMobileFilterOpen = () => {
    setMobileFilterOpen(true);
  };

  const handleMobileFilterClose = () => {
    setMobileFilterOpen(false);
  };

  const handleMobileFilterApply = () => {
    console.log('Filters applied');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selected !== 'All Category') count++;
    if (selectedSize !== 'All Sizes') count++;
    if (selectedBrand !== 'All Brands') count++;
    if (selectedTags.length > 0) count++;
    if (searchQuery.trim() !== '') count++;
    if (sortBy !== 'newest') count++;
    return count;
  };

  return (
    <>
      <div className="tp-product-2-area tp-product-2-style-3 tp-product-2-style-4 fix pt-150 pb-130">
        <div className="container">
          <div className="row">
            <div className="col-xl-9 col-lg-8">
              {/* Search and Sort Controls */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="search-bar">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="form-control"
                      style={{
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="sort-dropdown">
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="form-select"
                      style={{
                        padding: '12px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: 'white'
                      }}
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
              </div>

              <div className="row">
                {isLoading ? (
                  <div className="col-12 text-center py-5">
                    <h3>Loading products...</h3>
                    <div className="spinner-border text-primary mt-3" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : products.length === 0 ? (
                  <div className="col-12 text-center py-5">
                    <h3>No Products Found</h3>
                    <p>We couldn't find any products matching your criteria.</p>
                  </div>
                ) : (
                  currentItems.map((item, i) => (
                    <div key={i} className="col-xl-4 col-lg-6 col-md-6 mb-30">
                      <div className="tp-product-2-item">
                        <div className="tp-product-2-thumb-box fix p-relative">
                          <div className="tp-product-2-thumb" style={{ height: '300px' }}>
                            <Image
                              fill
                              style={{ objectFit: "cover" }}
                              src={item?.image || item?.image_url || '/assets/img/logo/ME_Logo.png'}
                              alt={item?.title || item?.name || 'Product image'}
                            />
                          </div>
                          <div className="tp-product-2-button-box">
                            <Link href={`/product/${item._id || item.id}`} className="tp-btn-black-lg">
                              <span>VIEW DETAILS</span>
                            </Link>
                          </div>
                        </div>
                        <div className="tp-product-2-content d-flex flex-column">
                          <h4 className="tp-product-2-title mb-2">
                            <Link href={`/product/${item._id || item.id}`}>
                              <span>{item?.title || item?.name}</span>
                            </Link>
                          </h4>
                          <div className="tp-product-2-rate-2">
                            <span>${item?.price}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOpenModal(item);
                          }}
                          className="product-add-to-cart-btn"
                        >
                          ADD TO CART
                        </button>
                      </div>
                    </div>
                  ))
                )}

                <div className="col-xl-12">
                  <div className="basic-pagination mt-30">
                    {!isLoading && currentItems.length > 0 ? (
                      <ReactPaginate
                        breakLabel="..."
                        nextLabel={<i className="fa-light fa-arrow-right-long"></i>}
                        onPageChange={handlePageClick}
                        pageRangeDisplayed={9}
                        pageCount={pageCount}
                        previousLabel={<i className="fa-light fa-arrow-left-long"></i>}
                        renderOnZeroPageCount={null}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-lg-4 d-none d-lg-block">
              <div className="tp-shop-sidebar-wrap">
                <div className="tp-shop-sidebar-widget">
                  <h4 className="tp-shop-sidebar-widget-title">{product_title}</h4>
                  <div className="tp-shop-sidebar-widget-content pb-65">
                    <ul>
                      <li onClick={() => handleCategory('All Category')} className={`${'All Category' === selected ? 'active' : ''}`}>
                        <Link href="/shop"><i className="fa-solid fa-angle-right"></i>All Categories</Link>
                      </li>
                      {categories.map((category) => (
                        <li key={category.id} onClick={() => handleCategory(category.name)} className={`${category.name === selected ? 'active' : ''}`}>
                          <Link href="/shop">
                            <i className="fa-solid fa-angle-right"></i>
                            {category.name}
                            {category.product_count !== undefined && (
                              <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.7 }}>
                                ({category.product_count})
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="tp-shop-sidebar-widget">
                  <h4 className="tp-shop-sidebar-widget-title">Filter by Size</h4>
                  <div className="tp-shop-sidebar-widget-content pb-65">
                    <ul>
                      <li onClick={() => handleSizeFilter('All Sizes')} className={`${'All Sizes' === selectedSize ? 'active' : ''}`}>
                        <Link href="/shop"><i className="fa-solid fa-angle-right"></i>All Sizes</Link>
                      </li>
                      {sizes.map((size) => (
                        <li key={size.id} onClick={() => handleSizeFilter(size.name)} className={`${size.name === selectedSize ? 'active' : ''}`}>
                          <Link href="/shop">
                            <i className="fa-solid fa-angle-right"></i>
                            {size.name}
                            <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.7 }}>
                              ({size.dimensions})
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="tp-shop-sidebar-widget">
                  <h4 className="tp-shop-sidebar-widget-title">Filter by Brand</h4>
                  <div className="tp-shop-sidebar-widget-content pb-65">
                    <ul>
                      <li onClick={() => handleBrandFilter('All Brands')} className={`${'All Brands' === selectedBrand ? 'active' : ''}`}>
                        <Link href="/shop"><i className="fa-solid fa-angle-right"></i>All Brands</Link>
                      </li>
                      {brands.map((brand) => (
                        <li key={brand.id} onClick={() => handleBrandFilter(brand.name)} className={`${brand.name === selectedBrand ? 'active' : ''}`}>
                          <Link href="/shop">
                            <i className="fa-solid fa-angle-right"></i>
                            {brand.name}
                            {brand.product_count !== undefined && (
                              <span style={{ marginLeft: '8px', fontSize: '12px', opacity: 0.7 }}>
                                ({brand.product_count})
                              </span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="tp-shop-sidebar-widget">
                  <h4 className="tp-shop-sidebar-widget-title">Filter by Tags</h4>
                  <div className="tp-shop-sidebar-widget-content pb-65">
                    {selectedTags.length > 0 && (
                      <div className="mb-3">
                        <button
                          onClick={clearAllTags}
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
                          Clear All ({selectedTags.length})
                        </button>
                      </div>
                    )}
                    <div className="tag-filter-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {tags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => handleTagToggle(tag.name)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '6px 12px',
                            backgroundColor: selectedTags.includes(tag.name) ? tag.color : 'transparent',
                            color: selectedTags.includes(tag.name)
                              ? (tag.color && getContrastColor(tag.color)) || '#fff'
                              : '#666',
                            border: `1px solid ${tag.color || '#ddd'}`,
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textDecoration: 'none'
                          }}
                          onMouseEnter={(e) => {
                            if (!selectedTags.includes(tag.name)) {
                              e.currentTarget.style.backgroundColor = tag.color || '#f0f0f0';
                              e.currentTarget.style.color = (tag.color && getContrastColor(tag.color)) || '#000';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!selectedTags.includes(tag.name)) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#666';
                            }
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
                </div>

                <div className="sidebar__widget">
                  <h3 className="tp-shop-sidebar-widget-title title-border">{latest_title}</h3>
                  <div className="sidebar__widget-content">
                    <div className="sidebar__post">
                      {latestProducts.length > 0 ? (
                        latestProducts.map((item, i) => (
                          <div key={item.id || i} className={`rc__post d-flex align-items-center ${i === latestProducts.length - 1 ? '' : 'mb-25'}`}>
                            <div className="rc__post-thumb mr-20" style={{ width: '80px', height: '80px', position: 'relative' }}>
                              <Link href={`/product/${item.id}`}>
                                <Image
                                  fill
                                  style={{ objectFit: "cover" }}
                                  src={item.image || '/assets/img/logo/ME_Logo.png'}
                                  alt={item.title || 'Latest product'}
                                />
                              </Link>
                            </div>
                            <div className="rc__post-content">
                              <div className="rc__meta">
                                <span>${item.price}</span>
                              </div>
                              <h3 className="rc__post-title">
                                <Link href={`/product/${item.id}`}>{item.title}</Link>
                              </h3>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-3">
                          <p>Loading latest products...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <FloatingFilterButton
        onClick={handleMobileFilterOpen}
        activeFiltersCount={getActiveFiltersCount()}
      />

      {/* Mobile Filter Modal */}
      <MobileFilterModal
        isOpen={mobileFilterOpen}
        onClose={handleMobileFilterClose}
        categories={categories}
        sizes={sizes}
        brands={brands}
        tags={tags}
        selectedCategory={selected}
        selectedSize={selectedSize}
        selectedBrand={selectedBrand}
        selectedTags={selectedTags}
        sortBy={sortBy}
        searchQuery={searchQuery}
        onCategoryChange={handleCategory}
        onSizeChange={handleSizeFilter}
        onBrandChange={handleBrandFilter}
        onTagToggle={handleTagToggle}
        onClearTags={clearAllTags}
        onSortChange={handleSortChange}
        onSearchChange={handleSearchChange}
        onApplyFilters={handleMobileFilterApply}
      />

      {/* Product Options Modal */}
      {selectedProduct && (
        <ProductOptionsModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          product={selectedProduct}
          frameTypes={defaultOptions.frameTypes}
          sizes={defaultOptions.sizes}
        />
      )}
    </>
  );
};

export default ProductArea;
