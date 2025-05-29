# Headers Layout Components

## 📌 Purpose
This directory contains header/navbar components for the Mirror Exhibit e-commerce platform, providing navigation and user interface elements across different page layouts.

## 📂 Files Overview
- `HeaderFive.tsx` - Main navbar component used across most pages (except homepage and admin)
- `menu/NavMenu.tsx` - Navigation menu component with site links

## 🧩 Components and Functions

### HeaderFive.tsx
- **Purpose:** Primary navigation header with sticky behavior and responsive design
- **Features:**
  - Logo display with link to homepage
  - Desktop navigation menu (hidden on mobile)
  - Profile button with authentication dropdown
  - Shopping cart icon with item count (desktop only)
  - Mobile hamburger menu button
  - Sticky header behavior on scroll
- **Dependencies:** 
  - `ProfileButtonComponent` for user authentication
  - `NavMenu` for navigation links
  - `Offcanvus` for mobile menu
  - `ShoppingCart` for cart functionality
  - Redux for cart state management

### Key Features

1. **Responsive Design:**
   - Desktop: Full navigation menu, profile icon, cart icon
   - Mobile: Logo, profile icon, hamburger menu button
   - Profile icon now visible on both desktop and mobile

2. **Sticky Header:**
   - Automatically pins header when scrolling up
   - Unpins when scrolling down or at top of page
   - Smooth transition animations

3. **Authentication Integration:**
   - Profile button shows user status (authenticated/guest)
   - Dropdown menu with user actions
   - Admin access for authorized users

4. **Shopping Cart:**
   - Real-time item count display
   - Cart icon with badge showing quantity
   - Desktop only (hidden on mobile)

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2025-01-27 | Fixed mobile profile icon visibility by adding variant="mobile"   | User reported profile icon missing on mobile |
| 2025-01-27 | Updated both main and sticky headers to show profile on mobile    | Ensure consistent mobile experience |

## 🎯 Mobile Profile Icon Fix
**Issue:** Profile icon was hidden on mobile devices due to `d-none d-xl-block` CSS classes in ProfileButtonComponent.

**Solution:** Added `variant="mobile"` prop to ProfileButtonComponent calls in HeaderFive.tsx:
- Line 63: `<ProfileButtonComponent iconColor="#000" variant="mobile" />`
- Line 111: `<ProfileButtonComponent iconColor="#000" variant="mobile" />` (sticky header)

**Result:** Profile icon now visible and functional on mobile devices, allowing users to:
- Sign in/sign up when not authenticated
- Access dashboard, orders, and admin panel when authenticated
- Sign out from mobile devices

## 🔧 ProfileButtonComponent Integration
The ProfileButtonComponent supports two variants:
- `variant="navbar"` (default): Hidden on mobile (`d-none d-xl-block`)
- `variant="mobile"`: Visible on all screen sizes

By using `variant="mobile"`, the profile icon is now accessible on mobile devices while maintaining the same functionality as desktop.

## 🎨 Styling Notes
- Uses Bootstrap classes for responsive behavior
- Custom container class: `custom-container-4`
- Gold color theme for hamburger menu: `#B59410`
- Black color for icons and text: `#000`
- Sticky header class: `tp-header-pinned`

## 🚀 Future Improvements
- Consider adding cart icon to mobile view
- Implement mobile-specific navigation improvements
- Add touch gestures for mobile menu interactions
