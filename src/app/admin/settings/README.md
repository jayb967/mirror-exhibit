# Admin Settings

## 📌 Purpose
This directory contains the main admin settings page for the Mirror Exhibit application, providing comprehensive configuration options for the e-commerce platform using the original legacy layout that the user preferred.

## 📂 Files Overview
- `page.tsx` - Main admin settings route with tabbed interface using SimpleAdminLayout

## 🧩 Components and Functions
### AdminSettingsRoute Component
- **Purpose:** Comprehensive admin settings interface with classic tabbed navigation
- **Layout:** Uses SimpleAdminLayout (legacy preferred layout)
- **Features:**
  - **General Tab:** Store name, low stock threshold
  - **Contact Tab:** Store email, phone, order notification email
  - **Social Media Tab:** Facebook, Instagram, Twitter URLs
  - **Shipping & Tax Tab:** 🆕 **Origin address configuration** + free shipping threshold + tax settings
  - **SEO Tab:** Meta title, description, keywords
  - **FAQs Tab:** 🆕 **FAQ management** for product and general pages
  - **Account Tab:** 🆕 **Admin account management** with sign out functionality

### Key Settings Available
1. **Origin Address Configuration (Shipping & Tax Tab):**
   - Company name and contact information
   - Full shipping address (street, city, state, postal code, country)
   - Phone and email for shipping notifications
   - Dropdown for country selection

2. **Database Schema Compatibility:**
   - Only saves fields that exist in current database schema
   - Prevents "column not found" errors
   - Uses correct field names (store_name, store_email, etc.)

3. **Shipping Settings:**
   - Free shipping threshold configuration
   - Integration with Easyship for dynamic shipping rates

4. **Tax Configuration:**
   - Enable/disable tax calculation
   - Set tax rates as percentages

5. **FAQ Management (FAQs Tab):** 🆕
   - **Product FAQs:** Displayed on individual product detail pages
   - **General FAQs:** Displayed on the main FAQ page (/faq)
   - Add, edit, and delete FAQs with confirmation dialogs
   - Real-time updates to frontend without page refresh
   - Automatic sorting and numbering

6. **Account Management (Account Tab):** 🆕
   - **Sign Out:** Secure sign out functionality using Clerk authentication
   - Redirects to admin login page after successful sign out
   - No save button needed (account actions are immediate)

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2025-01-27 | Added Account tab with sign out functionality and fixed mobile profile icon | Allow admin to sign out from settings and fix mobile navbar |
| 2025-01-27 | Fixed guidelines violation - removed duplicate admin-settings route | Follow guidelines: avoid duplicating components |
| 2025-01-27 | Restored original /admin/settings route with working functionality | Preserve existing code and routes as per guidelines |
| 2025-01-27 | Fixed database schema compatibility issues                         | Resolved "address column not found" error by using correct field names |
| 2025-01-27 | Updated settings interface to match existing database schema       | Ensure all fields save properly without database errors |
| 2025-01-27 | Restored original legacy settings layout with SimpleAdminLayout   | User preferred original tabbed interface over modern card layout |
| 2025-01-27 | Added comprehensive origin address configuration to shipping tab   | Enable Easyship integration with proper origin address |
| 2025-01-27 | Added FAQ management functionality with admin interface            | Enable dynamic FAQ management for product and general pages |

## 🎯 Usage
Access the admin settings by:
1. Navigating to `/admin/settings` directly
2. Clicking "Settings" in the admin sidebar menu
3. Using the admin navigation menu

## 🏠 Origin Address Configuration
The origin address is crucial for:
- Easyship shipping rate calculations
- Order fulfillment and shipping labels
- Customer shipping notifications
- Return address information

**Required Fields:**
- Company Name: Mirror Exhibit
- Contact Name: [Your contact person]
- Street Address: 3311 Cahuenga Blvd W
- City: Los Angeles
- State: CA
- Postal Code: 90068
- Country: US (dropdown selection)
- Phone Number: [Your phone]
- Email Address: [Your shipping email]

## 💾 Database Fields
**✅ Fields that work and save properly:**
- `store_name` - Store name
- `store_email` - Store email address
- `store_phone` - Store phone number
- `free_shipping_threshold` - Free shipping threshold amount
- `origin_address` - Complete origin address (JSONB)
- `tax_rate` - Tax rate percentage
- `tax_enabled` - Enable/disable tax calculation
- `meta_title`, `meta_description`, `meta_keywords` - SEO settings
- `facebook_url`, `instagram_url`, `twitter_url` - Social media URLs
- `order_notification_email` - Where order notifications are sent
- `low_stock_threshold` - Low stock alert threshold
- `product_faqs` - Product page FAQs (JSONB array)
- `general_faqs` - General FAQ page FAQs (JSONB array)

## 💡 Guidelines Followed
- ✅ **Never removed existing code** - Preserved original /admin/settings route
- ✅ **Avoided duplicating components** - Removed duplicate admin-settings route
- ✅ **Maintained consistency** - Used existing SimpleAdminLayout
- ✅ **Preserved existing functionality** - All original features work
- ✅ **Fixed without breaking** - Database compatibility without schema changes

## 🚀 Result
- **No more routing confusion** - Single settings page at /admin/settings
- **Clean navigation** - Sidebar takes you directly to the correct settings
- **Origin address configuration** - Available and working properly
- **Database compatibility** - No more "column not found" errors
- **Guidelines compliant** - No duplicate routes or removed existing code
