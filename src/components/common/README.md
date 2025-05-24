# Common Components

## 📌 Purpose
This folder contains reusable UI components that are used across multiple pages and sections of the Mirror Exhibit application.

## 📂 Files Overview
- `ProductCard.tsx` - Reusable product card component with add-to-cart functionality and modal integration
- `ProductOptionsModal.tsx` - **DEPRECATED** - Legacy modal component (replaced by GlobalProductModal)
- `GlobalProductModal.tsx` - **NEW** - Global modal component for selecting product options, rendered at app level
- `AddToCartButton.tsx` - Standalone add-to-cart button component with loading states
- `ProductSkeleton.tsx` - Loading skeleton component for product cards

## 🧩 Components and Functions

### ProductCard.tsx
- **Purpose:** Display product information in a card format with hover effects and add-to-cart functionality
- **Usage:** `<ProductCard product={productData} pauseCarousel={pauseFn} resumeCarousel={resumeFn} />`
- **Dependencies:** `ProductOptionsModal.tsx`, Redux cart state
- **Features:**
  - Responsive design with hover effects
  - Integrated add-to-cart button that opens options modal
  - Carousel pause/resume functionality when modal opens/closes
  - Click-to-navigate to product details page
  - Image optimization with lazy loading

### GlobalProductModal.tsx ⭐ **NEW**
- **Purpose:** App-level modal for selecting product customization options before adding to cart
- **Usage:** Automatically managed by GlobalModalContext when ProductCard triggers openModal
- **Dependencies:** GlobalModalContext, Redux cart slice, React Portal
- **Features:**
  - Portal-based rendering at document.body level for perfect centering
  - Frame type and size selection with default preferences
  - Quantity adjustment with increment/decrement controls
  - Dynamic price calculation based on selected options
  - Body scroll prevention when open
  - Carousel pause/resume integration
  - Click-outside-to-close functionality
  - Proper state reset between different products
  - SSR-safe mounting with useEffect
  - Higher z-index (99999) to ensure it appears above all other elements

### ProductOptionsModal.tsx 🚫 **DEPRECATED**
- **Status:** Legacy component replaced by GlobalProductModal
- **Reason:** Had positioning issues when used within carousel components
- **Migration:** Use GlobalModalContext and GlobalProductModal instead

### AddToCartButton.tsx
- **Purpose:** Standalone button for adding products to cart with authentication handling
- **Usage:** `<AddToCartButton productId={id} buttonText="Add to Cart" />`
- **Dependencies:** Redux cart slice, Supabase client
- **Features:**
  - Loading states and error handling
  - Authentication integration
  - Customizable button text and styling

### ProductSkeleton.tsx
- **Purpose:** Loading placeholder component that matches ProductCard dimensions
- **Usage:** `<ProductSkeleton />` - typically used in arrays during data loading
- **Features:**
  - Matches ProductCard layout and dimensions
  - Smooth loading animation
  - Responsive design

## 🔄 Recent Changes

| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2025-01-27 | **MAJOR:** Implemented global modal system with GlobalProductModal | Fix modal positioning issues and carousel interference |
| 2025-01-27 | Created GlobalModalContext for app-level modal state management | Ensure modal renders outside carousel hierarchy |
| 2025-01-27 | Updated ProductCard to use global modal instead of local modal | Prevent modal positioning conflicts with carousel |
| 2025-01-27 | Added portal-based rendering for modal at document.body level | Guarantee proper centering regardless of page scroll |
| 2025-01-27 | Enhanced carousel pause/resume with debugging logs | Ensure auto-scroll stops when modal is open |

## 🎨 Styling
- Components use CSS modules and global styles from `/src/styles/`
- ProductCard and ProductOptionsModal styles are in `/src/styles/product-modal.css`
- Responsive design with mobile-first approach
- Consistent with site theme (black, white, gold colors, sharp corners)

## 🔧 Integration Notes
- All components are designed to work with Redux state management
- ProductCard requires carousel pause/resume functions when used in carousels
- Modal components prevent body scrolling when open
- Components handle both authenticated and guest users
- Error boundaries and loading states are implemented throughout
