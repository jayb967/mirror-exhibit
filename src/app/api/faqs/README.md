# Public FAQ API Endpoint

## 📌 Purpose
This directory contains the public API endpoint for fetching FAQ data for frontend display. No authentication is required for these endpoints.

## 📂 Files Overview
- `route.ts` - Public API endpoint to fetch FAQs for frontend components

## 🧩 Endpoint Details

### GET /api/faqs
- **Purpose:** Fetch FAQs for public display on frontend
- **Method:** GET
- **Authentication:** None required (public endpoint)
- **Parameters:**
  - `type` (optional): 'product' or 'general'
    - If 'product': Returns only product page FAQs
    - If 'general': Returns only general FAQ page FAQs
    - If omitted: Returns both types
- **Response:** JSON object with FAQ data
- **Features:**
  - Automatic sorting by sort_order
  - No authentication required
  - Optimized for frontend consumption

## 📋 Response Format

### Single Type Request
```json
{
  "faqs": [
    {
      "id": "1",
      "question": "How do I install this mirror?",
      "answer": "Installation is simple and straightforward...",
      "sort_order": 1
    }
  ]
}
```

### Both Types Request
```json
{
  "product_faqs": [
    {
      "id": "1",
      "question": "How do I install this mirror?",
      "answer": "Installation is simple and straightforward...",
      "sort_order": 1
    }
  ],
  "general_faqs": [
    {
      "id": "1",
      "question": "How effectively small spaces in interior design?",
      "answer": "Aliquam eros justo, posuere loborti viverra...",
      "sort_order": 1
    }
  ]
}
```

## 🎯 Usage Examples

### Frontend Components
- **Product Detail Pages:** `fetch('/api/faqs?type=product')`
- **General FAQ Page:** `fetch('/api/faqs?type=general')`
- **Both Types:** `fetch('/api/faqs')`

### Integration Points
- `src/components/shop-details/ShopDetailsArea.tsx` - Product page FAQs
- `src/components/faq/FaqArea.tsx` - General FAQ page

## 🔄 Recent Changes
| Date       | Change Description                                      | Reason                                                |
|------------|--------------------------------------------------------|-------------------------------------------------------|
| 2025-01-27 | Created public FAQ endpoint                           | Enable frontend components to fetch dynamic FAQ data |

## 🎯 Data Source
FAQs are stored in the `site_settings` table:
- `product_faqs` - JSONB array for product page FAQs
- `general_faqs` - JSONB array for general FAQ page FAQs

## 🔧 Error Handling
- Returns empty arrays if no FAQs found
- Handles database connection errors gracefully
- Provides meaningful error messages for debugging
