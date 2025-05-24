# Admin Dashboard

## 📌 Purpose
This folder contains the admin dashboard page for the Mirror Exhibit e-commerce platform. The dashboard provides an overview of key metrics and quick access to common administrative tasks.

## 📂 Files Overview
- `page.tsx` - Main dashboard component that displays statistics and recent orders

## 🧩 Components and Functions

### Dashboard Page
- **Purpose:** Provides an overview of store performance and recent activity
- **Features:**
  - Display key statistics (total products, low stock products, total orders, revenue)
  - Show recent orders with customer information
  - Provide quick access links to common admin tasks
  - Responsive design for all device sizes

### StatsCard Component
- **Purpose:** Reusable component for displaying statistics in a visually appealing card
- **Props:**
  - `title`: The name of the statistic
  - `value`: The value to display
  - `borderColor`: Border color for the left side of the card

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2024-06-01 | Updated dashboard UI to match main site theme                      | Consistency with frontend      |
| 2024-06-01 | Fixed data loading issues and added error handling                 | Improve reliability            |
| 2024-06-01 | Adjusted icon sizes and removed rounded corners                    | Match design requirements      |
| 2024-06-01 | Implemented responsive design for mobile devices                   | Improve mobile experience      |
| 2024-06-01 | Removed artist-related content and updated to mirror store metrics | Align with business focus      |
| 2024-06-01 | Added real-time data fetching from Supabase                        | Show accurate store statistics |
| 2024-06-01 | Added recent orders table with formatting                          | Improve order visibility       |

## 🎨 Design Notes
- The dashboard follows the main site's theme with black, white, and gold (#A6A182) color scheme
- No rounded corners are used to maintain the modern contemporary style
- Icons are sized appropriately to avoid appearing oversized
- Cards use subtle shadows instead of heavy borders for a cleaner look

## 🔧 Technical Notes
- Uses React hooks for state management
- Implements proper cleanup in useEffect to prevent memory leaks
- Handles loading states and error conditions gracefully
- Uses Supabase for data fetching
