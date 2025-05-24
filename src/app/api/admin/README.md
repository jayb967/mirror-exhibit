# Admin API Endpoints

## 📌 Purpose
This directory contains API endpoints for admin-only operations in the Mirror Exhibit e-commerce platform.

## 📂 Files Overview
- `setup-default-options/route.ts` - API endpoint to create default product sizes and frame types
- `create-product-variations/route.ts` - API endpoint to create product variations for all products
- `product-sizes/route.ts` - API endpoint to manage product sizes
- `frame-types/route.ts` - API endpoint to manage frame types
- `product-variations/route.ts` - API endpoint to manage product variations
- `products/route.ts` - API endpoint to manage products
- `orders/route.ts` - API endpoint to manage orders (view and update status)
- `csv-import/route.ts` - API endpoint for CSV import functionality
- `faqs/route.ts` - API endpoint for FAQ management (admin only)

## 🧩 Endpoints and Functions

### Setup Default Options
- **Purpose:** Creates default product sizes and frame types
- **Method:** POST
- **Authentication:** Admin only
- **Response:** Success message with count of created items

### Create Product Variations
- **Purpose:** Creates product variations for all products using all available sizes and frame types
- **Method:** POST
- **Authentication:** Admin only
- **Response:** Success message with count of created variations

### Product Sizes
- **Purpose:** Manages product sizes (create, update, delete)
- **Method:** POST, PUT, DELETE
- **Authentication:** Admin only
- **Response:** Success message or error

### Frame Types
- **Purpose:** Manages frame types (create, update, delete)
- **Method:** POST, PUT, DELETE
- **Authentication:** Admin only
- **Response:** Success message or error

### Product Variations
- **Purpose:** Manages product variations (create, update, delete)
- **Method:** POST, PUT, DELETE
- **Authentication:** Admin only
- **Response:** Success message or error

### Orders
- **Purpose:** Manages orders (view all orders, update order status)
- **Method:** GET, PATCH
- **Authentication:** Admin only
- **GET Parameters:** page, limit, status (optional filter)
- **PATCH Body:** orderId, status
- **Response:** Orders list with pagination info or success message

### FAQ Management
- **Purpose:** Manages FAQs for product and general pages
- **Methods:** GET, POST, PUT, DELETE
- **Authentication:** Admin only
- **Features:**
  - Add new FAQs (POST)
  - Update existing FAQs (PUT)
  - Delete FAQs (DELETE)
  - Fetch FAQs by type (GET)
- **Types:** 'product' (for product detail pages) or 'general' (for FAQ page)
- **Response:** Success/error messages with FAQ data

## 🔄 Recent Changes
| Date       | Change Description                                      | Reason                                                |
|------------|--------------------------------------------------------|-------------------------------------------------------|
| 2025-01-27 | **🛡️ MAJOR:** Implemented centralized admin authentication across all API routes | Use verifyAdminAccess() utility for consistent JWT + Clerk API fallback |
| 2025-01-27 | Fixed authentication in product-variations, frame-types, and product-sizes APIs | Convert from Supabase auth to Clerk auth for consistency |
| 2025-01-27 | Created orders endpoint for admin order management     | Fix RLS policy issues and duplicate toast notifications |
| 2024-06-15 | Created setup-default-options endpoint                 | Fix missing product variations in add-to-cart modal   |
| 2024-06-15 | Created create-product-variations endpoint             | Generate variations for all products                  |
| 2025-01-27 | Added FAQ management endpoint                          | Enable dynamic FAQ management for admin interface    |
