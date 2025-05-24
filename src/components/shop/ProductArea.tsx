'use client'

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import shop_sm_img_1 from "@/assets/img/blog/details-sm-1-1.jpg";
import shop_sm_img_2 from "@/assets/img/blog/details-sm-1-2.jpg";
import shop_sm_img_3 from "@/assets/img/blog/details-sm-1-3.jpg";
import { useDispatch } from 'react-redux';
import { addToCartWithAuth } from '@/redux/features/cartSlice';
import ReactPaginate from 'react-paginate';
import InputRange from '@/ui/InputRange';
// Commented out RTK Query hook to use direct fetch instead
// import { useGetShowingProductsQuery } from '@/redux/features/productApi';
// Toast notifications are handled by Redux actions
import ProductOptionsModal from '../common/ProductOptionsModal';

interface DataType {
  product_title: string;
  categorys: string[];
  filter_title: string;
  latest_title: string;
  latest_products: {
    img: StaticImageData;
    price: number;
    title: string;
  }[];
}

interface ProductType {
  _id: number;
  name: string;
  title: string;
  price: number;
  category: string;
  image: string;
  // Add other properties as needed
}

const shop_content: DataType = {
  product_title: `Product Category`,
  categorys: [
    `Home Deco`,
    `Lighting`,
    `Furniture`,
    `Flooring`,
    `Wall Art`,
  ],
  filter_title: `Price Filter`,
  latest_title: `Our Latest Product`,
  latest_products: [
    {
      img: shop_sm_img_1,
      price: 19,
      title: `White Armchair`,
    },
    {
      img: shop_sm_img_2,
      price: 22,
      title: `Center Table`,
    },
    {
      img: shop_sm_img_3,
      price: 25,
      title: `Center Table`,
    },
  ]
}

const {
  product_title,
  categorys,
  filter_title,
  latest_title,
  latest_products
} = shop_content

const ProductArea = () => {
  const [products, setProducts] = useState<ProductType[]>([]); // Provide initial state
  const [allProducts, setAllProducts] = useState<ProductType[]>([]); // Provide initial state
  const [selected, setSelected] = useState('All Category');
  const [priceValue, setPriceValue] = useState([0, 0]);
  const [initialLoadEnded, setInitialLoadEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [defaultOptions, setDefaultOptions] = useState({
    sizes: [],
    frameTypes: []
  });

  // Fetch products directly from the API
  useEffect(() => {
    console.log('ProductArea component mounted');

    const fetchProducts = async () => {
      try {
        console.log('Fetching products directly...');
        const response = await fetch('/api/products/show');
        console.log('API response received:', response.status);
        const data = await response.json();
        console.log('Direct fetch result:', data);
        console.log('Data structure:', JSON.stringify(data, null, 2));

        if (data.success && data.products && data.products.length > 0) {
          console.log('Setting products with:', data.products.length, 'items');
          setProducts(data.products);
          setAllProducts(data.products);

          if (!initialLoadEnded) {
            const maxPrice = data.products.reduce((max, item) => {
              return item.price > max ? item.price : max;
            }, 0);
            setPriceValue([0, maxPrice]);
            setInitialLoadEnded(true);
          }
        } else {
          console.log('No products found in API response');
          console.log('Data success:', data.success);
          console.log('Products array:', data.products);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Call the fetch function immediately
    fetchProducts();

    // Log the current state
    console.log('Initial state - products:', products.length);
    console.log('Initial state - isLoading:', isLoading);
  }, []);

  // Log when products change
  useEffect(() => {
    console.log('Products updated, new count:', products.length);
  }, [products]);

  // Fetch product options (sizes and frame types)
  useEffect(() => {
    const fetchProductOptions = async () => {
      try {
        console.log('Fetching product options...');
        const response = await fetch('/api/product-options');
        const data = await response.json();

        if (data.success) {
          console.log('Product options loaded:', data);
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

  // Handle opening the product options modal
  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  // Handle closing the product options modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const itemsPerPage = 9;
  const [itemOffset, setItemOffset] = useState(0);
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = products.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(products.length / itemsPerPage);

  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * itemsPerPage) % products.length;
    setItemOffset(newOffset);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dispatch = useDispatch();
  const handleAddToCart = (item: any) => {
    // Use proper product data structure for Redux
    (dispatch as any)(addToCartWithAuth({
      id: item._id || item.id,
      product_id: item._id || item.id,
      title: item.title || item.name,
      price: item.base_price || item.price,
      image: item.image || item.image_url,
      quantity: 1,
    }));
    // Toast notification is handled by Redux action
  };

  const handleChanges = (val: number[]) => {
    setPriceValue(val);
    const filterPrice = allProducts.filter((j) => j.price >= val[0] && j.price <= val[1]);
    setProducts(filterPrice);
  };

  const handleCategory = (category: string) => {
    setSelected(category);
    if (category === 'All Category') {
      setProducts(allProducts);
      const maxPrice = allProducts.reduce((max, item) => {
        return item.price > max ? item.price : max;
      }, 0);
      setPriceValue([0, maxPrice]);
    } else {
      // Check if category is a string or an object with name property
      const filteredProducts = allProducts.filter(product => {
        if (typeof product.category === 'string') {
          return product.category === category;
        } else if (product.category && typeof product.category === 'object') {
          return product.category.name === category;
        }
        return false;
      });

      setProducts(filteredProducts);
      const maxPrice = filteredProducts.length > 0 ?
        filteredProducts.reduce((max, item) => {
          return item.price > max ? item.price : max;
        }, 0) : 1000;
      setPriceValue([0, maxPrice]);
    }
  };

  return (
    <>
      <div className="tp-product-2-area tp-product-2-style-3  tp-product-2-style-4 fix pt-150 pb-130">
        <div className="container">
          <div className="row">
            <div className="col-xl-9 col-lg-8">
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
                              alt={item?.title || item?.name}
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

                    {!isLoading && currentItems.length > 0 ?
                      <ReactPaginate
                        breakLabel="..."
                        nextLabel={<i className="fa-light fa-arrow-right-long"></i>}
                        onPageChange={handlePageClick}
                        pageRangeDisplayed={9}
                        pageCount={pageCount}
                        previousLabel={<i className="fa-light fa-arrow-left-long"></i>}
                        renderOnZeroPageCount={null}
                      />
                      :
                      null
                    }

                  </div>
                </div>

              </div>

            </div>
            <div className="col-xl-3 col-lg-4">
              <div className="tp-shop-sidebar-wrap">
                <div className="tp-shop-sidebar-widget">
                  <h4 className="tp-shop-sidebar-widget-title">{product_title}</h4>
                  <div className="tp-shop-sidebar-widget-content pb-65">

                    <ul>
                      {['All Category', ...categorys].map((item, i) => (
                        <li key={i} onClick={() => handleCategory(item)} className={`${item === selected ? 'active' : ''}`}>
                          <Link href="/shop"><i className="fa-solid fa-angle-right"></i>{item}</Link>
                        </li>
                      ))}
                    </ul>

                  </div>
                </div>
                <div className="tp-shop-sidebar-widget">
                  <h4 className="tp-shop-sidebar-widget-title title-border">{filter_title}</h4>
                  <div className="tp-shop-sidebar-widget-content">
                    <div className="tp-shop-widget-filter mb-50">
                      <div className="tp-shop-widget-filter-info">

                        <span className="input-range">
                          ${priceValue[0]} - ${priceValue[1]}
                        </span>

                      </div>
                      <div id="slider-range" className="mb-10 mt-20">
                        <InputRange
                          MAX={priceValue[1] ? priceValue[1] : 1}
                          MIN={0}
                          STEP={1}
                          values={priceValue}
                          handleChanges={handleChanges}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sidebar__widget">
                  <h3 className="tp-shop-sidebar-widget-title title-border">{latest_title}</h3>
                  <div className="sidebar__widget-content">
                    <div className="sidebar__post">
                      {latest_products.map((item, i) => (
                        <div key={i} className={`rc__post d-flex align-items-center ${i === 2 ? '' : 'mb-25'}`}>
                          <div className="rc__post-thumb mr-20">
                            <Link href="/shop-details">
                              <Image src={item.img} alt="image-here" />
                            </Link>
                          </div>
                          <div className="rc__post-content">
                            <div className="rc__meta">
                              <span>${item.price}</span>
                            </div>
                            <h3 className="rc__post-title">
                              <Link href="/shop-details">{item.title}</Link>
                            </h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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