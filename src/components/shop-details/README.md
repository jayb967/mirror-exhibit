# Shop Details Components

## 📌 Purpose
This folder contains components for individual product detail pages and related product displays in the Mirror Exhibit e-commerce platform.

## 📂 Files Overview
- `ShopDetailsArea.tsx` - Main product details component with options selection and pricing
- `OurProductArea.tsx` - Related products carousel with modal integration

## 🧩 Components and Functions

### ShopDetailsArea Component
- **Purpose:** Displays detailed product information with customization options and multi-image gallery
- **Features:**
  - Multi-image gallery with thumbnail navigation
  - Product information display with image switching
  - Size and frame type selection with default preferences
  - Dynamic price calculation based on selected options
  - Product details tabs (Details, Additional Info, Reviews, FAQ)
  - Add to cart functionality with variation support
  - Fallback product data when API is unavailable
  - Default selections: "Classic Wood" frame and "Small" size

#### Key Functions:
- `handleAddToCart()` - Adds selected product variation to cart
- `increaseQuantity()` / `decreaseQuantity()` - Manages quantity selection
- `calculatedPrice` - Computes price with size and frame adjustments

#### Price Calculation Logic:
```javascript
basePrice + sizeAdjustment + frameAdjustment = finalPrice
```

### OurProductArea Component
- **Purpose:** Shows related products in a carousel format
- **Features:**
  - Swiper carousel with autoplay functionality
  - Product options modal integration
  - Carousel pause/resume when modal opens/closes
  - Default options fetching for products without variations
  - Responsive breakpoints for different screen sizes

#### Key Functions:
- `handleOpenModal(product)` - Opens product options modal
- `pauseCarousel()` / `resumeCarousel()` - Controls carousel autoplay
- `fetchProductOptions()` - Loads default size and frame options

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2025-01-27 | Implemented default selections: "Classic Wood" frame and "Small" size | User requirement for defaults |
| 2025-01-27 | Added dynamic price calculations with adjustments                  | Show accurate pricing          |
| 2025-01-27 | Enhanced product options modal integration                         | Consistent user experience     |
| 2025-01-27 | Added fallback options loading for products without variations    | Ensure modal always works      |
| 2025-01-27 | Updated cart item creation to include calculated prices           | Accurate cart pricing          |

## 🎯 Integration Points
- **ProductOptionsModal:** Used for product customization in carousel
- **Redux:** Uses product API queries and cart slice
- **API Endpoints:**
  - `/api/products/[id]` for individual product details
  - `/api/product-options` for default size and frame options
  - Random products API for related products

## 💰 Pricing Structure
- **Base Price:** Product's base_price from database
- **Size Adjustments:** Added from product_sizes.price_adjustment
- **Frame Adjustments:** Added from frame_types.price_adjustment
- **Final Price:** Base + Size Adjustment + Frame Adjustment

### Default Price Adjustments (from database):
- **Sizes:**
  - Small: +$0
  - Medium: +$30
  - Large: +$60
- **Frame Types:**
  - Classic Wood: +$0
  - Rustic Wood: +$15
  - Modern Steel: +$25
  - Matte Black Steel: +$30
  - Brushed Gold Steel: +$45

## 🔧 Dependencies
- React hooks (useState, useEffect, useMemo)
- Redux for state management
- Swiper for carousel functionality
- Next.js Image component
- React Toastify for notifications

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2025-01-23 | Implemented multi-image functionality with thumbnail gallery       | Enable multiple product images |
| 2025-01-23 | Added complete product details tabs (Details, Additional Info, Reviews, FAQ) | Improve product information display |
| 2025-01-23 | Updated API integration to include product_images in response      | Support multi-image functionality |
| 2025-01-23 | Added fallback product data and error handling                     | Improve user experience during API issues |
| 2025-01-23 | Implemented dynamic tab switching with state management            | Better user interaction |
| 2025-01-23 | Fixed carousel modal loop by migrating to global modal system     | Prevent infinite loops and ensure consistent modal behavior |
| 2025-01-23 | Implemented proper image error handling with logo fallback        | Handle broken/missing images with onError event and state management |
| 2025-01-23 | Fixed stretched product card images across all components         | Added objectFit: 'cover' styling to maintain proper aspect ratios in OurProductArea and home page carousels |
| 2025-01-23 | Implemented consistent card heights in product carousel          | Fixed variable heights by adding 400px fixed height, flexbox layout, and text truncation for long titles |
| 2025-01-23 | Fixed global modal not displaying by importing CSS              | Added product-modal.css import to AppWrapper to enable modal styling and visibility |
