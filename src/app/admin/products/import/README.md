# Folder: /admin/products/import

## 📌 Purpose
This folder contains the product import functionality for the admin interface. It provides a user-friendly interface for administrators to upload product data via CSV files in Shopify export format.

## 📂 Files Overview
- `page.tsx` - Main product import page with CSV upload functionality
- `page-backup.tsx` - Backup of the previous minimal test page
- `README.md` - This documentation file

## 🧩 Components and Functions
### page.tsx
- **Purpose:** Provide a user interface for importing products from CSV files (Shopify format)
- **Key Features:**
  - CSV file upload with validation
  - Progress tracking with detailed statistics
  - Error logging and display
  - Sample CSV template download
  - Integration with productImportService for processing
- **Usage:** Accessible at `/admin/products/import`
- **Dependencies:**
  - `productImportService` - Service for processing CSV data
  - `Papa` - CSV parsing library
  - `SimpleAdminLayout` - Admin layout component
  - React hooks and state management
  - React Icons for UI elements

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2025-01-27 | Fixed "Invalid hook call" error by replacing useSupabaseClient hook with direct service role client in productCompatibilityService.ts | Fix React hook call error in admin protected route |
| 2025-01-27 | Restored full CSV import functionality                             | Fix broken import feature      |
| 2025-01-27 | Added sample CSV template download                                 | Provide template for users     |
| 2025-01-27 | Integrated with productImportService                               | Leverage existing import logic |
| 2025-01-27 | Added progress tracking and error handling                         | Improve user experience        |

## 📝 Usage Notes

### CSV Format
The import page expects a CSV file in the Shopify product export format, which includes:
- Product information (Handle, Title, Body, Vendor, etc.)
- Variant information (Size, Frame type, Price, etc.)
- Image URLs
- SEO information

### Import Process
1. Click "Download Sample CSV" to get a template
2. Prepare your CSV file with product data
3. Click "Choose File" to select your CSV file
4. The system will automatically:
   - Parse the CSV file
   - Process products and variations
   - Download and upload images to Cloudinary
   - Create categories and brands if they don't exist
   - Update existing products if they already exist

### Error Handling
- The import process continues even if some products fail
- Errors are logged and displayed in the error section
- Administrators can fix issues and re-upload the CSV file

### Performance Considerations
- Images are processed in batches to avoid overwhelming the server
- The import process is designed to handle large CSV files
- Progress is tracked and displayed in real-time

## 🔗 Related Components
- `src/services/productImportService.ts` - Service for processing CSV data
- `src/app/api/admin/csv-import/route.ts` - API endpoint for CSV import operations
- `src/app/api/cloudinary/upload-from-url/route.ts` - API endpoint for uploading images to Cloudinary
