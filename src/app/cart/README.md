# Cart Page

## 📌 Purpose
This folder contains the implementation of the cart page for the Mirror Exhibit e-commerce website.

## 📂 Files Overview
- `page.tsx` - The main page component that renders the CartPage component
- `CartPage.tsx` - The client-side component that implements the cart functionality
- `README.md` - This documentation file

## 🧩 Components and Functions

### CartPage.tsx
- **Purpose:** Display cart items in a mobile-first card layout similar to Amazon's mobile cart
- **Features:**
  - Mobile-responsive card layout with large product images
  - Product variation support (size, frame type) displayed as separate items
  - Touch-friendly quantity controls with +/- buttons
  - Apply coupon codes for discounts with loading indicators
  - Select shipping methods (flat rate, local pickup, free shipping)
  - Show free shipping progress bar
  - Calculate subtotal, shipping, and total
  - Proceed to checkout
  - Sharp corners design matching site theme (black, white, gold)

### page.tsx
- **Purpose:** Server component that renders the CartPage client component
- **Usage:** `<CartPage />`

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2023-11-15 | Restored previous cart page design with table layout               | Match design in screenshots    |
| 2023-11-15 | Added shipping options (flat rate, local pickup, free shipping)    | Restore previous functionality |
| 2023-11-15 | Implemented coupon code functionality                              | Restore previous functionality |
| 2023-11-15 | Updated styling to match theme (black, white, gold)                | Maintain consistent design     |
| 2023-11-15 | Added FreeShippingProgress component                               | Show progress toward free shipping |
| 2025-01-27 | Fixed unwanted toast notifications on cart page load              | Improve user experience        |
| 2025-01-27 | Fixed duplicate toast notifications when decreasing quantity      | Prevent notification spam      |
| 2025-01-27 | Added silent mode to Redux cart actions for internal operations   | Control when toasts appear     |
| 2025-01-27 | Replaced table layout with mobile-friendly card layout            | Improve mobile user experience |
| 2025-01-27 | Added product variation support with unique identifiers           | Handle different product options separately |
| 2025-01-27 | Fixed quantity update issues preserving product data              | Prevent data loss during updates |
| 2025-01-27 | Added floating cart button hiding on cart/checkout pages          | Improve UX by removing redundant elements |
| 2025-01-27 | Enhanced product options display with styled badges               | Better visual hierarchy for variations |
| 2025-01-27 | Removed CartContext and converted all components to Redux         | Eliminate redundancy and improve reactivity |
| 2025-01-27 | Added "Continue Shopping" button above cart items                 | Improve user navigation experience |

## 🔗 Related Components
- `FreeShippingProgress` - Shows progress toward free shipping threshold
- `Redux Store` - Centralized cart state management
- `CartButtonComponent` - Navbar and floating cart buttons
- `ShoppingCart` - Cart dropdown component
- `HeaderFive` - Main header with cart functionality
- `FloatingCartButton` - Floating cart button component
- `shippingService` - Handles shipping calculations and options
- `couponService` - Validates and applies coupon codes

## 🔄 Redux Integration
All cart functionality now uses Redux for state management:
- **Cart Items:** Stored in `state.cart.cart`
- **Item Count:** Calculated from cart items with quantities
- **Product Variations:** Properly preserved with `size_name`, `frame_name`, `variation_id`
- **Reactive Updates:** All components automatically update when cart changes
- **Consistent Data:** Single source of truth eliminates sync issues
