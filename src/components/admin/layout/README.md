# Admin Layout Components

## 📌 Purpose
This folder contains the layout components for the admin dashboard of the Mirror Exhibit e-commerce platform. These components provide a consistent structure and navigation for all admin pages.

## 📂 Files Overview
- `AdminLayout.tsx` - Main layout component that wraps all admin pages
- `Header.tsx` - Header component with search, notifications, and user profile
- `Sidebar.tsx` - Sidebar navigation component
- `component/` - Folder containing smaller components used in the layout

## 🧩 Components and Functions

### AdminLayout Component
- **Purpose:** Provides a consistent layout structure for all admin pages
- **Features:**
  - Responsive sidebar that collapses on mobile
  - Fixed header with user profile and notifications
  - Consistent styling across all admin pages
  - Sign out functionality

### Header Component
- **Purpose:** Displays the top navigation bar with user controls
- **Features:**
  - Mobile menu toggle
  - Search functionality
  - User profile dropdown
  - Notifications area

### Sidebar Component
- **Purpose:** Provides navigation between different admin sections
- **Features:**
  - Collapsible on mobile devices
  - Highlights active section
  - Organized navigation links with icons

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2024-06-01 | Updated theme to match main site (black, white, gold)              | Consistency with frontend      |
| 2024-06-01 | Removed rounded corners from all UI elements                       | Match design requirements      |
| 2024-06-01 | Fixed sidebar visibility and mobile responsiveness                 | Improve usability              |
| 2024-06-01 | Reduced icon sizes for better proportions                          | Fix oversized icons            |
| 2024-06-01 | Fixed template string syntax in AdminLayout                        | Fix hydration errors           |

## 🎨 Design Notes
- The admin layout follows the main site's theme with black, white, and gold (#A6A182) color scheme
- No rounded corners are used to maintain the modern contemporary style
- Icons are sized appropriately (5x5 instead of 6x6) to avoid appearing oversized
- Consistent spacing and padding throughout the layout

## 🔧 Technical Notes
- Uses Tailwind CSS with the `tw-` prefix to avoid conflicts
- Implements proper mobile responsiveness with different layouts for mobile and desktop
- Uses React hooks for state management
- Handles user authentication with Supabase
