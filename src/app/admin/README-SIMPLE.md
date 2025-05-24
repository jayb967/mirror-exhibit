# Simple Admin Dashboard

## 📌 Purpose
This folder contains a simplified version of the admin dashboard that avoids hydration errors by using only inline styles and minimal dependencies.

## 📂 Files Overview
- `page.js` - The main admin dashboard page
- `layout.js` - A simple layout for the admin dashboard
- `products/page.js` - Products management page
- `users/page.js` - Users management page
- `orders/page.js` - Orders management page
- `settings/page.js` - Settings page

## 🧩 Components and Functions
All pages are simple React components with inline styles and no external dependencies.

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2024-06-01 | Created simplified admin dashboard                                 | Fix hydration errors           |
| 2024-06-01 | Used inline styles instead of Tailwind CSS                         | Avoid CSS conflicts            |
| 2024-06-01 | Removed all external component dependencies                        | Avoid circular dependencies    |

## 🎨 Design Notes
- The simplified admin dashboard follows the same design as the original admin dashboard
- Uses the same color scheme (black, white, gold #A6A182)
- No rounded corners to maintain the modern contemporary style

## 🔧 Technical Notes
- Uses JS instead of TSX to avoid potential type-related issues
- All components use inline styles to avoid CSS conflicts
- No external component dependencies to avoid circular dependencies
- Uses the `suppressHydrationWarning` prop to prevent React from showing hydration mismatch errors
