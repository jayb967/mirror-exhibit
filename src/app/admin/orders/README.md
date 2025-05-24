# Admin Orders Page

## 📌 Purpose
This page provides admin users with the ability to view and manage all orders in the Mirror Exhibit e-commerce platform.

## 📂 Files Overview
- `page.tsx` - Main admin orders page component
- `[id]/page.tsx` - Individual order detail page

## 🧩 Components and Functions

### OrdersPage Component
- **Purpose:** Display a paginated list of all orders with filtering and status management capabilities
- **Authentication:** Admin only (protected by Clerk authentication)
- **Features:**
  - View all orders with pagination
  - Filter orders by status (pending, paid, processing, completed, cancelled, refunded)
  - Search orders by ID, customer name, or status
  - Update order status directly from the list
  - Navigate to detailed order view

### Key Functions
- `fetchOrders()` - Fetches orders from the admin API endpoint with pagination and filtering
- `handleStatusChange()` - Updates order status via the admin API
- `handleSearch()` - Filters orders based on search query (client-side filtering)

## 🔧 API Integration
This page uses the `/api/admin/orders` endpoint instead of direct Supabase queries to:
- Bypass RLS (Row Level Security) policies using service role key
- Ensure proper admin authentication
- Prevent unauthorized access to order data

## 🎨 UI Features
- **Status Badges:** Color-coded status indicators (green for completed, yellow for pending, red for cancelled, etc.)
- **Responsive Design:** Mobile-friendly layout with proper table overflow handling
- **Pagination:** Navigate through large order lists efficiently
- **Filter Buttons:** Quick status filtering with visual active state
- **Search Bar:** Real-time search functionality
- **Action Buttons:** View order details and change status options

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                                                |
|------------|-------------------------------------------------------------------|-------------------------------------------------------|
| 2025-01-27 | Replaced direct Supabase queries with admin API endpoint calls   | Fix RLS policy issues and duplicate toast notifications |
| 2025-01-27 | Improved error handling to not show toasts for empty results     | Better user experience when no orders exist yet      |
| 2025-01-27 | Updated status change functionality to use API endpoint          | Ensure consistent admin authentication and permissions |

## 🚨 Error Handling
- **No Orders:** Shows "No orders found" message instead of error toast
- **API Errors:** Displays appropriate error messages via toast notifications
- **Authentication:** Redirects to login if not authenticated as admin
- **Network Issues:** Graceful handling of network failures with user feedback

## 🔐 Security
- Admin-only access enforced by Clerk authentication
- All order operations go through authenticated API endpoints
- Service role key used server-side to bypass RLS policies safely
- No direct database access from client-side code
