
'use client'

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useGetShowingProductsQuery, useGetRandomProductsQuery } from '@/redux/features/productApi';
import { useGlobalModal } from '@/contexts/GlobalModalContext';

const OurProductArea = ({ currentProductId }: { currentProductId?: string }) => {
  // Try to get random products first, fall back to filtered showing products
  const { data: randomData, isLoading: randomLoading, isError: randomError } = useGetRandomProductsQuery(currentProductId);
  const { data: allData, isLoading: allLoading, isError: allError } = useGetShowingProductsQuery(undefined);

  // Use global modal instead of local state
  const { openModal } = useGlobalModal();

  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [defaultOptions, setDefaultOptions] = useState({
    sizes: [],
    frameTypes: []
  });

  // Use random products if available, otherwise filter all products
  const isLoading = randomLoading || allLoading;
  const isError = randomError && allError;

  // Get products from random API or filter from all products
  const relatedProducts = randomData?.products ||
    (allData?.products?.filter(product => product.id !== currentProductId) || []);

  // Fetch product options (sizes and frame types) with caching
  useEffect(() => {
    const fetchProductOptions = async () => {
      try {
        // Check if options are already cached in sessionStorage
        const cachedOptions = sessionStorage.getItem('productOptions');
        if (cachedOptions) {
          const parsed = JSON.parse(cachedOptions);
          setDefaultOptions({
            sizes: parsed.sizes || [],
            frameTypes: parsed.frameTypes || []
          });
          return;
        }

        console.log('Fetching product options for OurProductArea...');
        const response = await fetch('/api/product-options');
        const data = await response.json();

        if (data.success) {
          console.log('Product options loaded for OurProductArea:', data);
          const options = {
            sizes: data.sizes || [],
            frameTypes: data.frameTypes || []
          };
          setDefaultOptions(options);
          // Cache the options for other components
          sessionStorage.setItem('productOptions', JSON.stringify(options));
        }
      } catch (err) {
        console.error('Error fetching product options:', err);
      }
    };

    fetchProductOptions();
  }, []);

  // Pause the carousel when modal is open
  const pauseCarousel = () => {
    if (swiperInstance && !autoplayPaused) {
      swiperInstance.autoplay.stop();
      setAutoplayPaused(true);
    }
  };

  // Resume the carousel when modal is closed
  const resumeCarousel = () => {
    if (swiperInstance && autoplayPaused) {
      swiperInstance.autoplay.start();
      setAutoplayPaused(false);
    }
  };

  // Handle opening the product options modal using global modal
  const handleOpenModal = (product) => {
    console.log('OurProductArea: Opening global modal for product:', product?.title || product?.name);
    console.log('OurProductArea: Default options:', defaultOptions);

    // Get product-specific options or use defaults
    const productSizes = product?.variations && product.variations.length > 0
      ? [...new Set(product.variations.map(v => v.size?.name))]
          .filter(Boolean)
          .map(name => {
            const variation = product.variations.find(v => v.size?.name === name);
            return {
              id: variation?.size?.id,
              name: variation?.size?.name,
              price_adjustment: variation?.size?.price_adjustment
            };
          })
          .filter(size => size.id && size.name) // Filter out incomplete entries
      : defaultOptions.sizes;

    const productFrameTypes = product?.variations && product.variations.length > 0
      ? [...new Set(product.variations.map(v => v.frame_type?.name))]
          .filter(Boolean)
          .map(name => {
            const variation = product.variations.find(v => v.frame_type?.name === name);
            return {
              id: variation?.frame_type?.id,
              name: variation?.frame_type?.name,
              price_adjustment: variation?.frame_type?.price_adjustment
            };
          })
          .filter(frameType => frameType.id && frameType.name) // Filter out incomplete entries
      : defaultOptions.frameTypes;

    // Open global modal with product data
    openModal({
      product,
      frameTypes: productFrameTypes,
      sizes: productSizes,
      pauseCarousel,
      resumeCarousel
    });
  };



  return (
    <>
      <div className="tp-product-2-area tp-product-2-style-3 fix pt-20 pb-150">
        <div className="container">
          <div className="tp-product-2-wrap mb-60">
            <div className="row align-items-end">
              <div className="col-xl-8 col-lg-8 col-md-7">
                <div className="tp-product-2-title-box">
                  <span className="tp-section-subtitle">Related Products</span>
                  <h3 className="tp-section-title">You May Also Like</h3>
                </div>
              </div>
              <div className="col-xl-4 col-lg-4 col-md-5">
                <div className="tp-product-2-top-text">
                  <p>Discover more beautiful mirrors that complement your style and space.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-product-2-wrapper">
                {isLoading ? (
                  <div className="text-center py-5">Loading related products...</div>
                ) : isError ? (
                  <div className="text-center py-5">Error loading related products</div>
                ) : relatedProducts.length === 0 ? (
                  <div className="text-center py-5">No related products found</div>
                ) : (
                  <Swiper
                    speed={1000}
                    loop={true}
                    slidesPerView={4}
                    autoplay={true}
                    spaceBetween={30}
                    modules={[Autoplay]}
                    onSwiper={(swiper) => setSwiperInstance(swiper)}
                    breakpoints={{
                      '1600': {
                        slidesPerView: 4,
                      },
                      '1400': {
                        slidesPerView: 4,
                      },
                      '1200': {
                        slidesPerView: 3,
                      },
                      '992': {
                        slidesPerView: 3,
                      },
                      '768': {
                        slidesPerView: 2,
                      },
                      '576': {
                        slidesPerView: 2,
                      },
                      '0': {
                        slidesPerView: 1,
                      },
                    }}
                    className="swiper-container tp-product-2-active">
                    {relatedProducts.slice(0, 8).map((product, i) => (
                      <SwiperSlide key={i} className="swiper-slide">
                        <div
                          className="tp-product-2-item"
                          style={{
                            cursor: 'pointer',
                            height: '400px',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                          onClick={(e) => {
                            // Only navigate if the click wasn't on the Add To Cart button
                            if (!(e.target as HTMLElement).closest('.tp-product-2-button-box')) {
                              window.location.href = `/product/${product.id}?id=${product.id}`;
                            }
                          }}
                        >
                          <div className="tp-product-2-thumb-box p-relative" style={{ flex: '1', minHeight: '300px' }}>
                            <div className="tp-product-2-thumb fix p-relative" style={{ height: '100%' }}>
                              <Image
                                src={product.image || '/assets/img/logo/ME_Logo.png'}
                                alt={product.title}
                                width={400}
                                height={400}
                                style={{
                                  objectFit: 'cover',
                                  objectPosition: 'center',
                                  width: '100%',
                                  height: '100%'
                                }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/assets/img/logo/ME_Logo.png';
                                }}
                              />
                              <div className="tp-product-2-button-box">
                                <button
                                  className="tp-btn-black-lg"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleOpenModal(product);
                                  }}
                                >
                                  <span>Add To Cart</span>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div
                            className="tp-product-2-content d-flex justify-content-between align-items-center"
                            style={{
                              height: '80px',
                              padding: '15px 0',
                              flexShrink: 0
                            }}
                          >
                            {/* <h4
                              className="tp-product-2-title mb-0"
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: '1.2',
                                maxHeight: '2.4em',
                                flex: '1',
                                marginRight: '10px'
                              }}
                            >
                              <Link href={`/product/${product.id}?id=${product.id}`}>
                                <span>{product.title}</span>
                              </Link>
                            </h4> */}
                            {/* <div className="tp-product-2-rate-2" style={{ flexShrink: 0 }}>
                              <span>${product.price}</span>
                            </div> */}
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


    </>
  );
};

export default OurProductArea;