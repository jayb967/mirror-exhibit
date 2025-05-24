# Shop Components

## 📌 Purpose
This folder contains components for the shop/product listing functionality of the Mirror Exhibit e-commerce platform.

## 📂 Files Overview
- `index.tsx` - Main shop page component that displays the product listing
- `ProductArea.tsx` - Product grid component with filtering, pagination, and product options modal integration

## 🧩 Components and Functions

### Shop Component (index.tsx)
- **Purpose:** Main shop page wrapper that uses DefaultLayout and displays products
- **Features:**
  - Uses DefaultLayout for consistent page structure
  - Integrates ProductArea component for product display
  - Includes breadcrumb navigation and contact section

### ProductArea Component (ProductArea.tsx)
- **Purpose:** Displays products in a grid layout with filtering and modal integration
- **Features:**
  - Product fetching from `/api/products/show` endpoint
  - Category filtering and price range filtering
  - Pagination with ReactPaginate
  - Product options modal integration for add-to-cart functionality
  - Loading states and error handling
  - Responsive grid layout

#### Key Functions:
- `fetchProducts()` - Fetches products from the API
- `fetchProductOptions()` - Fetches available sizes and frame types for the modal
- `handleOpenModal(product)` - Opens the product options modal for a specific product
- `handleCloseModal()` - Closes the product options modal
- `handleCategory(category)` - Filters products by category
- `handleChanges(priceRange)` - Filters products by price range

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
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
