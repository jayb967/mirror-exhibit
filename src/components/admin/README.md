# Admin Components

## 📌 Purpose
This folder contains the components used in the admin dashboard of the Mirror Exhibit e-commerce platform.

## 📂 Files Overview
- `ProductEditModal.tsx` - Modal component for editing product details with multi-image management
- `SimpleAdminLayout.tsx` - Simplified layout component for admin pages
- `layout/` - Original layout components (deprecated)
- `svg/` - SVG icons used in the admin dashboard

## 🧩 Components and Functions

### ProductModal Component (Unified Create/Edit)
- **Purpose:** Unified modal for both creating new products and editing existing products
- **Features:**
  - **Dual Mode:** Create mode (product=null) and Edit mode (product=object)
  - **Enhanced Fields:** Includes cost, discount_price, and is_active fields
  - **Responsive Design:** Full-screen mobile, centered desktop
  - **Tabbed Interface:** General, Images (edit only), Product Options (edit only), SEO Settings
  - **Complete Validation:** Form validation with required field checking
  - **Database Integration:** Direct Supabase integration with proper error handling
  - **Default Values:** is_active defaults to true for new products
- **Usage:** Replaces both ProductEditModal and /admin/products/new page
- **Props:** isOpen, product (null for create), categories, sizes, frameTypes, onClose, onSave

### ProductEditModal Component (DEPRECATED)
- **Status:** Replaced by unified ProductModal component
- **Migration:** Use ProductModal instead for both create and edit functionality

### SimpleAdminLayout Component
- **Purpose:** Provides a consistent layout structure for all admin pages
- **Features:**
  - Responsive sidebar that collapses on mobile
  - Fixed header with mobile menu toggle
  - Consistent styling across all admin pages
  - Simplified structure to avoid hydration errors

### AdminSettingsPage Component
- **Purpose:** Comprehensive settings management for store configuration
- **Features:**
  - **Shipping & Origin Tab:** Configure free shipping threshold, Easyship integration, and origin address
  - **Payments & Tax Tab:** Configure tax rates, enable/disable tax calculation, and payment method settings
  - **Store Info Tab:** Configure store information, notification emails, and inventory settings
  - Real-time form validation and database integration
  - Responsive design with tabbed interface
- **Integration:** Used by checkout for tax calculation and shipping service for origin address

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2025-01-27 | **PERFORMANCE:** Optimized modal rendering to eliminate hesitation/lag | Deferred data fetching, optimized useEffect dependencies, added loading states |
| 2025-01-27 | **CRITICAL:** Fixed duplicate SKU generation with unique checking system | Prevent inventory confusion and ensure each variation has unique identifier |
| 2025-01-27 | Removed stock column from product variations table | Made-to-order business model doesn't require inventory tracking |
| 2025-01-27 | Enhanced image upload progress indicator with animations and status text | Replace basic progress bar with professional animated loading experience |
| 2025-01-27 | **MAJOR:** Migrated image storage from Supabase to Cloudinary exclusively | Unified image storage with automatic Cloudinary deletion to prevent orphaned files |
| 2025-01-27 | **MAJOR:** Created unified ProductModal for create/edit functionality | Replace separate create page and edit modal with single component |
| 2025-01-27 | Added cost, discount_price, and is_active fields to product management | Enable admin to manage product costs, sale prices, and active status |
| 2025-01-27 | Converted "Add Product" from page to modal-based workflow | Improve UX consistency and reduce navigation complexity |
| 2025-01-27 | Added "Select All" functionality for product options in edit modal | Enable bulk selection of sizes and frame types for better UX |
| 2025-01-27 | Fixed authentication mismatch in admin API routes               | Convert product-variations API from Supabase to Clerk auth |
| 2025-01-27 | Fixed database schema mismatch for category field                | Remove non-existent 'category' column from update query |
| 2025-01-27 | Added confirmation dialogs for variation deletion                | Prevent accidental deletion of product variations |
| 2025-01-27 | Cleaned up unused state variables in ProductEditModal            | Improve code quality and remove IDE warnings |
| 2025-01-27 | Fixed save functionality to use admin API for variations          | Resolve RLS permission issues with product_variations table |
| 2025-01-27 | Added DELETE method to admin product-variations API route        | Enable proper variation deletion through admin API |
| 2025-01-27 | Enhanced error handling with separate product/variation saves     | Better user feedback and graceful error recovery |
| 2025-01-27 | Implemented complete save functionality in ProductEditModal       | Enable actual product updates with validation |
| 2025-01-27 | Added missing Variations tab with size/frame type management      | Complete product options interface |
| 2025-01-27 | Added missing SEO tab with meta fields and live preview          | Enable SEO optimization for products |
| 2025-01-27 | Enhanced modal with proper form validation and error handling     | Improve user experience and data integrity |
| 2025-01-27 | Fixed coupon error in checkout for invalid codes                  | Prevent undefined property access |
| 2025-01-27 | Added origin address configuration in admin settings              | Allow admin to configure Easyship origin address |
| 2025-01-27 | Updated tax calculation to use admin settings                     | Make tax rates configurable instead of hardcoded |
| 2025-01-27 | Added payment method configuration options                        | Allow admin to enable/disable payment methods |
| 2025-01-27 | Enhanced admin settings with store information management         | Centralize store configuration |
| 2025-01-27 | Created ProductEditModal with multi-image functionality           | Extracted from products page for better organization |
| 2025-01-27 | Implemented comprehensive image management system                 | Enhanced admin workflow for product images |
| 2025-01-27 | Added tabbed interface for better organization                    | Improved UX with logical grouping of features |
| 2024-06-01 | Created SimpleAdminLayout to replace AdminLayout                   | Fix hydration errors           |
| 2024-06-01 | Updated all admin pages to use SimpleAdminLayout                   | Fix content disappearing issue |
| 2024-06-01 | Removed rounded corners and updated theme colors                   | Match design requirements      |
| 2024-06-01 | Reduced icon sizes for better proportions                          | Fix oversized icons            |

## 🎨 Design Notes
- The admin layout follows the main site's theme with black, white, and gold (#A6A182) color scheme
- No rounded corners are used to maintain the modern contemporary style
- Icons are sized appropriately (5x5 instead of 6x6) to avoid appearing oversized
- Consistent spacing and padding throughout the layout

## 🔧 Technical Notes
- Uses Tailwind CSS with the `tw-` prefix to avoid conflicts
- Implements proper mobile responsiveness with different layouts for mobile and desktop
- Uses React hooks for state management
- Simplified component structure to avoid hydration errors
