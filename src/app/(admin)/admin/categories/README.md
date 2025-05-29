# Admin Categories Management

## 📌 Purpose
This page provides admin interface for managing product categories in the Mirror Exhibit e-commerce platform. Admins can create, edit, and delete categories with hierarchical support (parent/child relationships).

## 📂 Files Overview
- `page.tsx` - Main admin categories management page
- `CategoryModal.tsx` - Modal component for creating/editing categories

## 🔒 Security Model
**Middleware Protection:** This page is protected by Next.js middleware that ensures only authenticated admin users can access `/admin/*` routes.

**Service Role API:** Uses admin API endpoints that leverage Supabase service role for database operations.

## 🧩 Features

### Category Management
- **Create Categories:** Add new product categories with name, description, and image
- **Edit Categories:** Update existing category information
- **Delete Categories:** Remove categories (with safety checks)
- **Hierarchical Structure:** Support for parent/child category relationships
- **Status Management:** Enable/disable categories

### Search and Filtering
- **Search:** Filter categories by name
- **Status Filter:** Show/hide inactive categories
- **Product Count:** Display number of products in each category

### Safety Features
- **Deletion Protection:** Cannot delete categories with assigned products
- **Circular Reference Prevention:** Cannot set a category as its own parent
- **Confirmation Dialogs:** Confirm before deleting categories

## 🎨 User Interface

### Layout
- **Header:** Page title with "Add New Category" button
- **Filters:** Search box and inactive category toggle
- **Table View:** Comprehensive category listing with actions
- **Modal:** Create/edit category form

### Table Columns
1. **Image:** Category image thumbnail or placeholder
2. **Name:** Category name with subcategory indicator
3. **Description:** Category description (truncated)
4. **Parent:** Parent category badge or "Top Level"
5. **Products:** Product count badge
6. **Status:** Active/Inactive status badge
7. **Actions:** Edit and delete buttons

### Category Modal Fields
- **Name:** Required category name
- **Parent Category:** Optional parent selection
- **Description:** Optional category description
- **Image URL:** Optional category image
- **Active Status:** Enable/disable toggle

## 🔧 API Integration

### Endpoints Used
- `GET /api/admin/categories` - Fetch categories with filters
- `POST /api/admin/categories` - Create new category
- `PUT /api/admin/categories/[id]` - Update existing category
- `DELETE /api/admin/categories/[id]` - Delete category

### Data Flow
1. **Load Categories:** Fetch from API with search/filter parameters
2. **Create/Edit:** Submit form data to appropriate endpoint
3. **Delete:** Confirm and send delete request
4. **Refresh:** Reload category list after operations

## 🚨 Error Handling

### Validation
- **Required Fields:** Category name is mandatory
- **Circular References:** Prevent parent/child loops
- **Product Dependencies:** Block deletion of categories with products

### User Feedback
- **Success Messages:** Toast notifications for successful operations
- **Error Messages:** Clear error descriptions for failures
- **Loading States:** Spinners during API operations

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2025-01-27 | **🆕 CREATED:** Admin categories management page and API endpoints | User requested categories management matching brands/tags pages |
| 2025-01-27 | **🔧 IMPLEMENTED:** Hierarchical category support with parent/child relationships | Support complex category structures |
| 2025-01-27 | **🛡️ ADDED:** Safety checks for category deletion and circular references | Prevent data integrity issues |

## 🎯 Usage Examples

### Creating a Category
1. Click "Add New Category" button
2. Fill in category name (required)
3. Optionally set parent category, description, and image
4. Click "Create Category"

### Editing a Category
1. Click on any category row in the table
2. Modify fields in the modal
3. Click "Update Category"

### Deleting a Category
1. Click the delete button (trash icon) for a category
2. Confirm deletion in the dialog
3. Category is removed if no products are assigned

### Hierarchical Structure
- **Top Level:** Categories without a parent
- **Subcategories:** Categories with a parent assigned
- **Visual Indicators:** Subcategories show parent badge and level indicator

## 🚀 Future Improvements
- **Drag & Drop Reordering:** Visual category ordering
- **Bulk Operations:** Select multiple categories for batch actions
- **Category Analytics:** Usage statistics and insights
- **Image Upload:** Direct image upload instead of URL input
- **Category Templates:** Pre-defined category structures
- **Import/Export:** CSV import/export functionality

## 🔗 Related Components
- **BrandModal:** Similar modal pattern for brand management
- **TagModal:** Similar modal pattern for tag management
- **SimpleAdminLayout:** Shared admin page layout
- **Product Management:** Categories are used in product assignment
