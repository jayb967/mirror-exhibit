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
- **Dependencies:**
  - `SimpleAdminLayout` component
  - Supabase client for database operations
  - React Toast for notifications
  - Next.js Image component for product thumbnails

### Key Data Structures
- **Product Interface:** Defines the structure for product data including variations_count aggregation
- **Pagination:** 10 products per page with navigation controls
- **Sorting:** Multi-field sorting with null value handling for status field
- **Bulk Operations:** Support for multiple product selection and batch operations

## 🔄 Recent Changes

| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2025-01-27 | Updated product view links from /shop/id to /product/id          | Correct routing to product detail pages |
| 2025-01-27 | Fixed React rendering error for variations_count object          | Resolved "Objects are not valid as a React child" error |
| 2025-01-27 | Updated Product interface to include variations_count structure  | Proper TypeScript typing for Supabase aggregation |
| 2025-01-27 | Added base_price field to Product interface                      | Support for both price and base_price columns |

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

### Stock Display Logic
- If product has variations, shows variations count
- If no variations, shows stock_quantity
- Color coding: red for low stock (< 5), gray for normal stock
