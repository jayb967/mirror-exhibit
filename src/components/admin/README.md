# Admin Components

## 📌 Purpose
This folder contains the components used in the admin dashboard of the Mirror Exhibit e-commerce platform.

## 📂 Files Overview
- `SimpleAdminLayout.tsx` - Simplified layout component for admin pages
- `layout/` - Original layout components (deprecated)
- `svg/` - SVG icons used in the admin dashboard

## 🧩 Components and Functions

### SimpleAdminLayout Component
- **Purpose:** Provides a consistent layout structure for all admin pages
- **Features:**
  - Responsive sidebar that collapses on mobile
  - Fixed header with mobile menu toggle
  - Consistent styling across all admin pages
  - Simplified structure to avoid hydration errors

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
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
