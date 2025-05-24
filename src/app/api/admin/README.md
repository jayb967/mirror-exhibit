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
- `csv-import/route.ts` - API endpoint for CSV import functionality

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

## 🔄 Recent Changes
| Date       | Change Description                                      | Reason                                                |
|------------|--------------------------------------------------------|-------------------------------------------------------|
| 2024-06-15 | Created setup-default-options endpoint                 | Fix missing product variations in add-to-cart modal   |
| 2024-06-15 | Created create-product-variations endpoint             | Generate variations for all products                  |
