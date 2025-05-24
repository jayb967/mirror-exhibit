"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import AddToCartButton from '@/components/common/AddToCartButton';

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  category: string | null;
  image_url: string | null;
  dimensions: string | null;
  material: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  product_images?: ProductImage[];
}

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Get all available images (product_images + fallback to main image_url)
  const allImages = React.useMemo(() => {
    const images: ProductImage[] = [];

    // Add images from product_images table
    if (product.product_images && product.product_images.length > 0) {
      images.push(...product.product_images.sort((a, b) => a.sort_order - b.sort_order));
    }

    // If no product_images but has main image_url, add it as fallback
    if (images.length === 0 && product.image_url) {
      images.push({
        id: 'main',
        product_id: product.id,
        image_url: product.image_url,
        alt_text: product.name,
        sort_order: 1,
        is_primary: true,
        created_at: product.created_at
      });
    }

    return images;
  }, [product]);

  const currentImage = allImages[selectedImageIndex] || null;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0 && value <= product.stock_quantity) {
      setQuantity(value);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock_quantity) {
      setQuantity(quantity + 1);
    }
  };

  // We'll use the AddToCartButton component instead of this function
  const addToCart = async () => {
    // This function is kept for compatibility but will be replaced
    setIsAddingToCart(true);
    try {
      // Implementation moved to AddToCartButton component
      toast.success(`${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const proceedToCheckout = async () => {
    try {
      setIsAddingToCart(true);

      // First add to cart
      await addToCart();

      // Then redirect to cart page
      router.push('/cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Format price
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(product.price);

  return (
    <>
      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-8 tw-mb-12">
        {/* Product Images */}
        <div className="tw-space-y-4">
          {/* Main Image */}
          <div className="tw-relative tw-h-96 md:tw-h-[500px] tw-rounded-lg tw-overflow-hidden tw-bg-gray-100">
            {currentImage ? (
              <Image
                src={currentImage.image_url}
                alt={currentImage.alt_text || product.name}
                className="tw-object-contain tw-object-center"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="tw-flex tw-items-center tw-justify-center tw-h-full tw-bg-gray-200">
                <span className="tw-text-gray-400 tw-text-lg">No image available</span>
              </div>
            )}
          </div>

          {/* Image Thumbnails */}
          {allImages.length > 1 && (
            <div className="tw-flex tw-space-x-2 tw-overflow-x-auto tw-pb-2">
              {allImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`tw-relative tw-flex-shrink-0 tw-w-20 tw-h-20 tw-rounded-md tw-overflow-hidden tw-border-2 tw-transition-colors ${
                    index === selectedImageIndex
                      ? 'tw-border-blue-500'
                      : 'tw-border-gray-200 hover:tw-border-gray-300'
                  }`}
                >
                  <Image
                    src={image.image_url}
                    alt={image.alt_text || `${product.name} ${index + 1}`}
                    className="tw-object-cover tw-object-center"
                    fill
                    sizes="80px"
                  />
                  {image.is_primary && (
                    <div className="tw-absolute tw-top-1 tw-left-1 tw-bg-green-500 tw-text-white tw-text-xs tw-px-1 tw-rounded">
                      Main
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <h1 className="tw-text-3xl tw-font-bold tw-text-gray-900 tw-mb-2">{product.name}</h1>

          {product.category && (
            <div className="tw-mb-4">
              <span className="tw-inline-block tw-bg-blue-100 tw-text-blue-800 tw-px-3 tw-py-1 tw-rounded-full tw-text-sm">
                {product.category}
              </span>
            </div>
          )}

          <div className="tw-text-2xl tw-font-bold tw-text-gray-900 tw-mb-4">{formattedPrice}</div>

          <div className="tw-mb-6">
            <p className="tw-text-gray-700 tw-mb-4">{product.description}</p>

            {product.dimensions && (
              <div className="tw-flex tw-mb-2">
                <span className="tw-w-24 tw-text-gray-500">Dimensions:</span>
                <span className="tw-text-gray-900">{product.dimensions}</span>
              </div>
            )}

            {product.material && (
              <div className="tw-flex tw-mb-2">
                <span className="tw-w-24 tw-text-gray-500">Material:</span>
                <span className="tw-text-gray-900">{product.material}</span>
              </div>
            )}

            <div className="tw-flex tw-mb-2">
              <span className="tw-w-24 tw-text-gray-500">Availability:</span>
              <span
                className={`tw-font-medium ${
                  product.stock_quantity > 10
                    ? 'tw-text-green-600'
                    : product.stock_quantity > 0
                    ? 'tw-text-yellow-600'
                    : 'tw-text-red-600'
                }`}
              >
                {product.stock_quantity > 10
                  ? 'In Stock'
                  : product.stock_quantity > 0
                  ? `Only ${product.stock_quantity} left`
                  : 'Out of Stock'}
              </span>
            </div>
          </div>

          {product.stock_quantity > 0 && (
            <>
              <div className="tw-mb-6">
                <label htmlFor="quantity" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                  Quantity
                </label>
                <div className="tw-flex tw-w-32">
                  <button
                    type="button"
                    onClick={decrementQuantity}
                    className="tw-bg-gray-200 tw-text-gray-700 hover:tw-bg-gray-300 tw-p-2 tw-rounded-l"
                    disabled={quantity <= 1}
                  >
                    <svg className="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max={product.stock_quantity}
                    className="tw-w-full tw-text-center tw-border-t tw-border-b tw-border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={incrementQuantity}
                    className="tw-bg-gray-200 tw-text-gray-700 hover:tw-bg-gray-300 tw-p-2 tw-rounded-r"
                    disabled={quantity >= product.stock_quantity}
                  >
                    <svg className="tw-w-4 tw-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="tw-flex tw-space-x-4">
                <AddToCartButton
                  productId={product.id}
                  className="tw-flex-1"
                  showQuantity={false}
                  buttonText="Add to Cart"
                />
                <button
                  onClick={proceedToCheckout}
                  disabled={isAddingToCart}
                  className="tw-flex-1 tw-bg-green-600 hover:tw-bg-green-700 tw-text-white tw-py-3 tw-px-6 tw-rounded-md tw-font-medium tw-transition-colors disabled:tw-bg-green-400"
                >
                  Buy Now
                </button>
              </div>
            </>
          )}

          {product.stock_quantity <= 0 && (
            <div className="tw-p-4 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-md tw-mb-6">
              <p className="tw-text-red-700">
                This product is currently out of stock. Please check back later or browse similar products below.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="tw-mt-16">
          <h2 className="tw-text-2xl tw-font-bold tw-mb-6">Related Products</h2>
          <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="tw-group tw-border tw-border-gray-200 tw-rounded-lg tw-overflow-hidden tw-shadow-sm hover:tw-shadow-lg tw-transition-shadow">
                <Link href={`/product/${relatedProduct.id}`} className="tw-block tw-relative tw-h-48 tw-overflow-hidden">
                  {relatedProduct.image_url ? (
                    <Image
                      src={relatedProduct.image_url}
                      alt={relatedProduct.name}
                      className="tw-object-cover tw-object-center tw-w-full tw-h-full tw-transition-transform tw-duration-300 tw-group-hover:tw-scale-105"
                      width={300}
                      height={200}
                    />
                  ) : (
                    <div className="tw-flex tw-items-center tw-justify-center tw-h-full tw-bg-gray-200">
                      <span className="tw-text-gray-400 tw-text-sm">No image</span>
                    </div>
                  )}
                </Link>
                <div className="tw-p-4">
                  <h3 className="tw-text-lg tw-font-medium tw-mb-1">
                    <Link href={`/product/${relatedProduct.id}`} className="tw-text-gray-900 hover:tw-text-blue-600">
                      {relatedProduct.name}
                    </Link>
                  </h3>
                  {relatedProduct.category && (
                    <p className="tw-text-sm tw-text-gray-600 tw-mb-2">{relatedProduct.category}</p>
                  )}
                  <p className="tw-text-lg tw-font-bold tw-text-gray-900">
                    ${relatedProduct.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}