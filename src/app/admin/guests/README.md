# Guest User Management

## 📌 Purpose
This folder contains the admin interface for managing guest users in the Mirror Exhibit e-commerce platform.

## 📂 Files Overview
- `page.tsx` - Main guest user management page component

## 🧩 Components and Functions

### Guest User Management Page
- **Purpose:** Provides an interface for administrators to view and manage guest users
- **Features:**
  - Display statistics about guest users (total guests, conversion rate, etc.)
  - List all guest users with their details
  - Clean up old guest user data

## 🔄 Database Functions

### get_guest_users_with_stats
- **Purpose:** Retrieves guest users with their cart items count and orders count
- **Returns:** A list of guest users with additional statistics

### get_guest_stats
- **Purpose:** Retrieves overall statistics about guest users
- **Returns:** Total guests, guests with orders, conversion rate, abandoned carts, and average cart value

### cleanup_old_guest_data
- **Purpose:** Removes old guest user data that has no associated orders
- **Parameters:** Number of days old (default: 30)
- **Returns:** Number of deleted users and cart items

## 🔐 Security Considerations
- Only administrators can access this page
- Database functions are secured with SECURITY DEFINER to ensure proper access control
- Guest data is protected by row-level security policies

## 🚀 Recent Changes
| Date       | Change Description                                                 | Reason                                      |
|------------|-------------------------------------------------------------------|---------------------------------------------|
| 2023-06-15 | Created guest user management page                                 | Provide admin interface for guest users     |
| 2023-06-15 | Added guest statistics                                             | Monitor guest user activity                 |
| 2023-06-15 | Implemented guest data cleanup                                     | Maintain database performance and security  |
