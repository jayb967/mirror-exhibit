# Product Import Module

This module handles the import of products from CSV files into the Mirror Exhibit database.

## Features

- Supports both standard CSV format and Shopify export format
- Automatically maps CSV headers to database fields
- Handles product variations for Shopify products
- Processes images and uploads them to Cloudinary
- Strips HTML tags from product descriptions
- Creates default variations for products without explicit variations

## Files

- `page.tsx` - Main import page component with UI and import logic
- `README.md` - This documentation file

## Recent Changes

| Date       | Change Description                                                 | Reason                         |
|------------|--------------------------------------------------------------------|--------------------------------|
| 2024-06-XX | Added HTML tag stripping for product descriptions                  | Fix display issues with HTML content in descriptions |
| 2024-06-XX | Improved product variations handling                               | Ensure all products have at least one variation |
| 2024-06-XX | Added default variation creation                                   | Fix issue where products without variations weren't usable |

## CSV Import Process

1. User uploads a CSV file
2. System detects the format (standard or Shopify)
3. Headers are mapped to database fields (automatically or manually)
4. Images are processed and uploaded to Cloudinary
5. Products are saved to the database
6. Variations are created for each product
7. Product images are associated with products

## Handling Product Variations

The system handles product variations in the following ways:

1. For Shopify format:
   - Products with the same "Handle" are treated as variations of the same product
   - Option1 is mapped to "Size" and Option2 is mapped to "Frame"
   - Each variation is stored in the product_variations table

2. For standard format:
   - A default variation is created for each product
   - Default size and frame type are used

## HTML Content Handling

Product descriptions from CSV files may contain HTML tags. The system:

1. Detects HTML content in descriptions
2. Strips all HTML tags to ensure clean display
3. Stores the plain text version in the database

## Troubleshooting

If variations are not being created:
- Check that the CSV has proper Option1/Option2 fields for Shopify format
- Verify that product_sizes and frame_types tables have entries
- Check the browser console for any errors during import

If HTML content is showing in descriptions:
- Make sure the latest version of the code is deployed
- The stripHtmlTags function should be handling this automatically
