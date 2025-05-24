# Shopify Product Import

## 📌 Purpose
This folder contains the admin interface for importing products from Shopify CSV export files. It provides a user-friendly interface for administrators to upload product data, including variations and images, and automatically processes the data to match the Mirror Exhibit database schema.

## 📂 Files Overview
- `page.tsx` - The main page component for the Shopify product import interface

## 🧩 Components and Functions

### page.tsx
- **Purpose:** Provide a user interface for importing products from Shopify CSV export files
- **Key Features:**
  - CSV file upload with validation
  - Progress tracking with detailed statistics
  - Error logging and display
  - Batch processing of images with Cloudinary integration
  - Automatic category and brand creation
- **Dependencies:**
  - `productImportService` - Service for processing Shopify CSV data
  - `Papa` - CSV parsing library
  - `AdminLayout` - Admin layout component
  - React hooks and state management

## 🔄 Recent Changes

| Date       | Change Description                                                 | Reason                                                |
|------------|-------------------------------------------------------------------|-------------------------------------------------------|
| 2024-06-01 | Created import-shopify page                                        | Support importing products from Shopify CSV format |
| 2024-06-01 | Added progress tracking and statistics                             | Provide feedback during import process |
| 2024-06-01 | Implemented error handling and display                             | Help administrators identify and fix import issues |
| 2024-06-01 | Added sample CSV download                                          | Provide a template for administrators to follow |
| 2024-06-01 | Integrated with productImportService                               | Leverage robust import functionality |

## 📝 Usage Notes

### CSV Format
The import page expects a CSV file in the Shopify product export format, which includes:
- Product information (title, description, vendor, etc.)
- Variant information (size, frame type, price, etc.)
- Image URLs

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
- `src/services/productImportService.ts` - Service for processing Shopify CSV data
- `src/services/productCompatibilityService.ts` - Service for ensuring compatibility with existing product functionality
- `src/app/api/cloudinary/upload-from-url/route.ts` - API endpoint for uploading images to Cloudinary
