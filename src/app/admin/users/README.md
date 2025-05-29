# Admin Users Management

## 📌 Purpose
This directory contains the admin interface for managing users in the Mirror Exhibit e-commerce platform. It provides functionality to view, search, and manage users from Clerk authentication.

## 📂 Files Overview
- `page.tsx` - Main admin users page displaying user list with search and filtering
- `add/page.tsx` - Page for adding new users (currently mock implementation)

## 🧩 Components and Functions

### page.tsx
- **Purpose:** Display and manage all users from Clerk authentication system
- **Features:**
  - Real-time user data fetching from Clerk via `/api/admin/users`
  - Search functionality with debounced API calls (500ms delay)
  - Filter to show/hide inactive users
  - User status management (ban/unban users)
  - User role management (admin/customer)
  - Responsive table layout with loading states
- **Dependencies:** 
  - Clerk authentication for user data
  - `/api/admin/users` API endpoint
  - `SimpleAdminLayout` component
  - React Toast notifications

### add/page.tsx
- **Purpose:** Form interface for adding new users
- **Status:** Currently contains mock implementation
- **Note:** This should be updated to integrate with Clerk user creation

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2025-01-27 | Replaced hardcoded mock users with real Clerk user data          | Fix admin users page to show actual users |
| 2025-01-27 | Added API integration with `/api/admin/users` endpoint           | Fetch real user data from Clerk |
| 2025-01-27 | Implemented user ban/unban functionality                         | Allow admin to manage user access |
| 2025-01-27 | Added search debouncing (500ms) to reduce API calls             | Improve performance and reduce server load |
| 2025-01-27 | Updated user interface to handle Clerk user data structure      | Support real user properties (banned, locked, etc.) |

## 🔗 API Integration
The users page now integrates with:
- **GET /api/admin/users** - Fetch users with search and filtering
- **PUT /api/admin/users** - Update user status (ban/unban) and roles

## 🎯 User Data Structure
Users are fetched from Clerk and transformed to include:
- `id` - Clerk user ID
- `name` - Full name or constructed from first/last name
- `email` - Primary email address
- `role` - User role (admin/customer) from metadata
- `status` - Derived from banned/locked/verified status
- `avatar` - User image or generated avatar
- `banned` - Whether user is banned
- `locked` - Whether user is locked
- `emailVerified` - Email verification status
- `twoFactorEnabled` - 2FA status
- `createdAt` - Account creation date
- `lastLogin` - Last sign-in timestamp

## 🚀 Future Improvements
- Update add user page to integrate with Clerk
- Add bulk user operations
- Implement user detail view/edit modal
- Add user activity logs
- Implement user export functionality
