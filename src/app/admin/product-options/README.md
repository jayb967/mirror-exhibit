# Product Options Management

## 📌 Purpose
This module provides an interface for managing product options including sizes and frame types for the Mirror Exhibit e-commerce platform.

## 📂 Files Overview
- `page.tsx` - Main component for managing product sizes and frame types

## 🧩 Components and Functions

### ProductOptionsPage Component
- **Purpose:** Allows administrators to view, add, and manage product sizes and frame types
- **Features:**
  - Tab-based interface to switch between sizes and frame types
  - Table display of existing sizes and frame types
  - "Set Up Default Options" button to create default sizes and frame types
  - "Create Product Variations" button to generate variations for all products
  - Integration with Supabase database

## 🔄 Recent Changes
| Date       | Change Description                                      | Reason                                                |
|------------|--------------------------------------------------------|-------------------------------------------------------|
| 2024-06-15 | Created product options management page                | Fix missing product variations in add-to-cart modal   |
| 2024-06-15 | Added product variations creation functionality        | Generate variations for all products                  |

## Database Schema
The module interacts with the following database tables:

### product_sizes
- `id` - UUID primary key
- `name` - Size name (e.g., Small, Medium, Large)
- `code` - Short code for the size (e.g., sm, md, lg)
- `dimensions` - Physical dimensions of the size
- `price_adjustment` - Price adjustment for this size
- `is_active` - Whether the size is active

### frame_types
- `id` - UUID primary key
- `name` - Frame type name (e.g., Wood, Metal)
- `material` - Material of the frame
- `color` - Color of the frame
- `description` - Description of the frame type
- `price_adjustment` - Price adjustment for this frame type
- `is_active` - Whether the frame type is active

## Usage
1. Navigate to Admin > Product Options
2. Use the tabs to switch between managing sizes and frame types
3. Fill out the form to add new sizes or frame types
4. View existing options in the table below

## API Endpoints
This module uses the following API endpoints:
- `POST /api/admin/product-sizes` - Create a new product size
- `POST /api/admin/frame-types` - Create a new frame type
