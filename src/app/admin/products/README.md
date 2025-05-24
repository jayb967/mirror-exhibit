# Admin Products Module

## 📌 Purpose
This folder contains the admin interface for managing products in the Mirror Exhibit e-commerce application. It provides comprehensive product management functionality including listing, editing, importing, and bulk operations.

## 📂 Files Overview
- `page.tsx` - Main products listing page with search, sorting, pagination, and bulk actions
- `new/page.tsx` - Form for creating new products
- `edit/[id]/page.tsx` - Form for editing existing products
- `import/page.tsx` - CSV product import functionality
- `import-shopify/page.tsx` - Shopify-specific CSV import functionality
- `import/README.md` - Documentation for standard CSV import
- `import-shopify/README.md` - Documentation for Shopify CSV import

## 🧩 Components and Functions

### page.tsx (Main Products List)
- **Purpose:** Display paginated list of products with admin management features
- **Key Features:**
  - Search functionality by product name
  - Sortable columns (name, price, stock, status, created date)
  - Bulk actions (delete, feature/unfeature, set status)
  - Product selection with checkboxes
  - Pagination with configurable page size
  - Stock quantity display with variations count support
  - Modal-based product editing with URL routing
- **Dependencies:**
  - `SimpleAdminLayout` component
  - `ProductEditModal` component
  - Supabase client for database operations
  - React Toast for notifications
  - Next.js Image component for product thumbnails

### Key Data Structures
- **Product Interface:** Defines the structure for product data including variations_count aggregation
- **Pagination:** 10 products per page with navigation controls

### ProductEditModal Integration
- **Modal System:** URL-based routing for edit modal (desktop centered, mobile fullscreen)
- **Tabs:** General, Images, Product Options, SEO Settings
- **Save Functionality:** Complete product update with validation
- **Image Management:** Multi-image upload, primary image selection, reordering
- **Variations Management:** Size and frame type selection with existing variations display
- **SEO Management:** Meta title, description, keywords with live preview

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2025-01-27 | Fixed flickering issue by separating useEffect dependencies       | Prevent double API calls on mount |
| 2025-01-27 | Implemented complete save functionality in ProductEditModal       | Enable product editing capability |
| 2025-01-27 | Added missing Variations tab with size/frame type management      | Complete product options interface |
| 2025-01-27 | Added missing SEO tab with meta fields and live preview          | Enable SEO optimization for products |
| 2025-01-27 | Enhanced modal with proper form validation and error handling     | Improve user experience and data integrity |

### Additional Features
- **Sorting:** Multi-field sorting with null value handling for status field
- **Bulk Operations:** Support for multiple product selection and batch operations
- **Modal System:** URL-based routing for seamless product editing
- **Image Management:** Multi-image upload, primary selection, and reordering
- **Variation Management:** Automatic generation of size/frame combinations

## ✨ New Features

### Multi-Image Product Management
**Overview:** Complete image management system allowing multiple images per product with admin controls and frontend gallery display.

**Admin Features:**
- **Multiple Image Upload:** Drag-and-drop or click to upload multiple images at once
- **Primary Image Selection:** Set any image as the primary/main product image
- **Image Reordering:** Sort order management with visual indicators
- **Image Deletion:** Remove unwanted images with confirmation
- **Storage Integration:** Automatic upload to Supabase Storage with public URLs
- **Database Management:** Images stored in `product_images` table with metadata

**Frontend Features:**
- **Image Gallery:** Main image display with thumbnail navigation
- **Responsive Design:** Optimized for mobile and desktop viewing
- **Fallback Support:** Graceful fallback to main `image_url` if no gallery images
- **Primary Image Indicator:** Visual indication of the main product image
- **Smooth Navigation:** Click thumbnails to switch main image view

**Database Structure:**
```sql
product_images table:
- id: UUID primary key
- product_id: Foreign key to products table
- image_url: Public URL from Supabase Storage
- is_primary: Boolean flag for main image
- sort_order: Integer for display ordering
- alt_text: Optional alt text for accessibility
- created_at: Timestamp
```

### Modal-Based Product Editing
**Overview:** Product editing is now handled through a responsive modal that opens from the products list page.

**Key Features:**
- **URL-Based Routing:** Direct links to `/admin/products?edit=productId` open the modal automatically
- **Responsive Design:** Full-screen on mobile devices, centered modal on desktop
- **Fixed Exit Button:** Mobile-optimized close button that stays accessible
- **Seamless Navigation:** Edit button opens modal without page navigation
- **URL Synchronization:** Modal state is reflected in the URL for bookmarking and direct access

**User Experience:**
- Click "Edit" button on any product row to open the modal
- Modal opens with the product data pre-loaded
- URL updates to include the product ID for direct access
- Close modal via X button, Cancel button, or background click
- Modal automatically opens if URL contains edit parameter

### Enhanced Product Edit Page
**Overview:** The product edit page now includes comprehensive product option management with database integration.

**Key Features:**
- **Category Dropdown:** Categories are now fetched from the `product_categories` table and displayed as a dropdown instead of free text
- **Product Options Tab:** New dedicated tab for managing product sizes and frame types
- **Multi-select Options:** Checkbox-based selection for available sizes and frame types
- **Automatic Variation Generation:** Creates all combinations of selected sizes and frame types with calculated pricing
- **Real-time Variation Display:** Shows current product variations with pricing and stock information

**Database Integration:**
- Fetches categories from `product_categories` table
- Fetches sizes from `product_sizes` table with dimensions and price adjustments
- Fetches frame types from `frame_types` table with material, color, and price adjustments
- Automatically generates `product_variations` records for all size/frame combinations
- Calculates final prices including base price + size adjustment + frame adjustment

**User Experience:**
- Three-tab interface: General, Product Options, SEO Settings
- Visual feedback for price adjustments on each option
- Bulk variation generation with confirmation
- Real-time preview of generated variations

## 🐛 Bug Fixes

### Variations Count Rendering Issue
**Problem:** The variations_count field from Supabase aggregation was being rendered directly as a React child, causing the error "Objects are not valid as a React child (found: object with keys {count})".

**Solution:**
- Updated the rendering logic to properly access `variations_count[0].count`
- Added proper null checks and fallback to stock_quantity
- Updated TypeScript interface to reflect the actual data structure from Supabase

**Code Changes:**
```typescript
// Before (causing error)
{product.variations_count || product.stock_quantity || 0}

// After (fixed)
{product.variations_count && product.variations_count.length > 0
  ? product.variations_count[0].count
  : product.stock_quantity || 0}
```

## 🔍 Technical Notes

### Supabase Query Structure
The main products query includes a count aggregation for variations:
```sql
SELECT *, variations_count:product_variations(count)
```
This returns variations_count as an array of objects with count properties, not a simple number.

### Sorting Behavior
- Status field sorting handles null values by placing them last regardless of sort direction
- Other fields use standard ascending/descending sort
- Default sort is by created_at in descending order (newest first)

### Table Interactions
- **Clickable Rows**: Click anywhere on a product row to open the edit modal
- **Checkbox Selection**: Click checkbox to select/deselect products for bulk actions
- **Action Buttons**: Edit and View buttons in the Actions column
- **Smart Click Handling**: Checkbox and action buttons don't trigger row click

### Filtering and Pagination
- **Search**: Text search across product names
- **Category Filter**: Dropdown to filter by product category
- **Missing SEO Filter**: Checkbox to show only products without SEO data
- **Page Size**: Configurable results per page (5, 10, 25, 50, 100)
- **Auto-reset**: Page resets to 1 when filters change

### Stock Display Logic
- If product has variations, shows variations count
- If no variations, shows stock_quantity
- Color coding: red for low stock (< 5), gray for normal stock

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2025-01-27 | Made entire table rows clickable to open edit modal             | Improve UX by making the full row interactive instead of just Edit button |
| 2025-01-27 | **MAJOR:** Added advanced filtering and pagination controls      | Enable filtering by category, missing SEO, and configurable page sizes |
| 2025-01-27 | **MAJOR:** Updated product list table with enhanced status indicators | Remove unused stock tracking, add visual indicators for missing product data |
| 2025-01-27 | Fixed status badge colors using inline styles                    | Ensure red/green colors are visible by bypassing CSS conflicts |
| 2025-01-27 | Removed stock column from products table                         | Stock tracking not needed for made-to-order business model |
| 2025-01-27 | Added red status badges for missing product information           | Quickly identify products needing attention (No desc, No image, No options) |
| 2025-01-27 | Enhanced SEO column with red/green status badges                 | Visual feedback for SEO completion status |
| 2025-01-27 | Fixed infinite toast notifications and product save functionality | Resolve useEffect dependency issues and implement complete save logic |
| 2025-01-27 | Added modal-based product editing with URL routing               | Improve UX with persistent URLs and better navigation |
| 2025-01-27 | Enhanced product list with variations count and stock display    | Show accurate stock information from product variations |
| 2025-01-27 | Added bulk actions for products (delete, feature, status)        | Enable efficient management of multiple products |
| 2025-01-27 | Implemented search and sorting functionality                     | Improve product discovery and organization |
| 2025-01-27 | Added pagination with configurable page size                     | Handle large product catalogs efficiently |
