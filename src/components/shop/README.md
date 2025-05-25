# Shop Components

## 📌 Purpose
This folder contains components for the shop/product listing functionality of the Mirror Exhibit e-commerce platform.

## 📂 Files Overview
- `index.tsx` - Main shop page component that displays the product listing
- `ProductArea.tsx` - Product grid component with filtering, pagination, and product options modal integration
- `MobileFilterModal.tsx` - Mobile-optimized filter modal for categories and price filtering
- `FloatingFilterButton.tsx` - Floating filter button that appears on mobile devices

## 🧩 Components and Functions

### Shop Component (index.tsx)
- **Purpose:** Main shop page wrapper that uses DefaultLayout and displays products
- **Features:**
  - Uses DefaultLayout for consistent page structure
  - Integrates ProductArea component for product display
  - Includes breadcrumb navigation and contact section

### ProductArea Component (ProductArea.tsx)
- **Purpose:** Displays products in a grid layout with comprehensive filtering and modal integration
- **Features:**
  - **Advanced Filtering System:**
    - Search bar with multi-field search (name, description, keywords)
    - Sort/Order By dropdown with 7 sorting options
    - Category filtering from real database data with product counts
    - Size filtering using actual product size data
  - Product fetching from enhanced `/api/products/show` endpoint with filter support
  - Latest products display from `/api/products/latest` endpoint
  - Pagination with ReactPaginate
  - Product options modal integration for add-to-cart functionality
  - Real-time filtering without page reload
  - Loading states and error handling
  - Responsive grid layout optimized for desktop and mobile

#### Key Functions:
- `fetchProducts()` - Fetches products from the API with filter parameters
- `fetchCategories()` - Fetches real categories from the database with product counts
- `fetchSizes()` - Fetches available product sizes from the database
- `fetchLatestProducts()` - Fetches latest products ordered by creation date
- `fetchProductOptions()` - Fetches available sizes and frame types for the modal
- `handleOpenModal(product)` - Opens the product options modal for a specific product
- `handleCloseModal()` - Closes the product options modal
- `handleCategory(category)` - Filters products by category
- `handleSizeFilter(size)` - Filters products by size
- `handleSortChange(sort)` - Changes product sorting order
- `handleSearchChange(query)` - Handles search input changes

### MobileFilterModal Component (MobileFilterModal.tsx)
- **Purpose:** Mobile-optimized modal for filtering products by category
- **Features:**
  - Slide-up animation from bottom of screen
  - Category selection with product counts
  - Apply and clear filter actions
  - Prevents body scroll when open
  - Responsive design optimized for mobile devices

#### Props:
- `isOpen` - Controls modal visibility
- `onClose` - Callback for closing modal
- `categories` - Array of available categories
- `selectedCategory` - Currently selected category
- `onCategoryChange` - Callback for category selection
- `onApplyFilters` - Callback for applying filters

### FloatingFilterButton Component (FloatingFilterButton.tsx)
- **Purpose:** Floating action button for opening mobile filter modal
- **Features:**
  - Only visible on mobile devices and shop page
  - Positioned above the floating cart button
  - Shows badge with active filter count
  - Smooth hover animations
  - Auto-hides on desktop and non-shop pages

#### Props:
- `onClick` - Callback for button click
- `activeFiltersCount` - Number of active filters for badge display

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2025-01-20 | **MAJOR UPDATE**: Added comprehensive filtering system            | Enhance user search experience |
| 2025-01-20 | Added Sort/Order By filter with 7 sorting options                 | Allow users to sort products   |
| 2025-01-20 | Added Search Bar with multi-field search capability               | Enable product text search     |
| 2025-01-20 | Added Size Filter using real database size data                   | Filter by product dimensions   |
| 2025-01-20 | Hidden sidebar filters on mobile, kept floating filter button     | Clean mobile interface         |
| 2025-01-20 | Mobile users access all filters through floating button modal     | Consolidated mobile filtering  |
| 2025-01-20 | Enhanced Products API with filtering and sorting support          | Backend support for filters    |
| 2025-01-20 | Added new /api/sizes endpoint for size filter data                | Dynamic size filtering         |
| 2025-01-27 | Fixed stacked navbar issue by removing duplicate HeaderFive       | Prevent duplicate navigation   |
| 2025-01-27 | Added ProductOptionsModal integration to ProductArea component    | Enable product customization   |
| 2025-01-27 | Added product options fetching from API for modal functionality   | Pre-load size and frame options|
| 2025-01-27 | Updated add-to-cart buttons to open modal instead of direct add   | Consistent user experience     |
| 2025-01-27 | Implemented default selections: "Classic Wood" frame and "Small" size | User requirement for defaults |
| 2025-01-27 | Added dynamic price calculations with size and frame adjustments  | Show accurate pricing          |

## 🎯 Integration Points
- **ProductOptionsModal:** Used for product customization before adding to cart
- **Redux:** Uses cart slice for state management
- **API Endpoints:**
  - `/api/products/show` for product listing
  - `/api/product-options` for sizes and frame types
- **Styling:** Uses product-modal.css and modal-overrides.css for modal styling

## 🔧 Dependencies
- React hooks (useState, useEffect)
- Redux for state management
- React Paginate for pagination
- Next.js Image component for optimized images
- React Toastify for notifications
