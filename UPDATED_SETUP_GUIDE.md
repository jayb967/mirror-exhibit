# Mirror Exhibit Database Setup Guide

This guide provides step-by-step instructions for setting up the Mirror Exhibit e-commerce database in Supabase. Each step must be completed in order to ensure all dependencies are properly created.

## Overview

The Mirror Exhibit e-commerce site allows customers to:
- Browse mirrors from different brands
- Choose between wood or steel frames (with various styles)
- Select from three different sizes (small, medium, large)
- Add customized products to cart
- Complete checkout with Stripe

## Step-by-Step Setup Instructions

### Step 1: Create Basic Profiles Table

**File to use: `SETUP_STEP1_SIMPLIFIED.sql`**

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `SETUP_STEP1_SIMPLIFIED.sql`
3. Run the script
4. Verify that the `profiles` table has been created with the correct columns

This step creates:
- The profiles table with a TEXT `role` column
- Basic row-level security policies
- Necessary permissions

### Step 2: Add Triggers and Functions

**File to use: `SETUP_STEP1_PART2.sql`**

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `SETUP_STEP1_PART2.sql`
3. Run the script
4. Verify that the triggers and functions have been created

This step creates:
- Updated_at trigger function and trigger
- New user creation function and trigger (only inserts the ID, letting the default value handle the role)
- Indexes for better performance
- Function permissions

### Step 3: Create Product-Related Tables

**File to use: `SETUP_STEP2.sql`**

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `SETUP_STEP2.sql`
3. Run the script
4. Verify that the product-related tables have been created

This step creates:
- Brands table
- Product categories table
- Frame types table (for wood and steel frames)
- Product sizes table (small, medium, large)
- Products table
- Product variations table (combinations of products, sizes, and frames)
- Product images table

### Step 4: Create Cart and Order Tables

**File to use: `SETUP_STEP3.sql`**

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `SETUP_STEP3.sql`
3. Run the script
4. Verify that the cart and order-related tables have been created

This step creates:
- Cart items table
- Orders table
- Order items table
- Product reviews table
- Wishlists table
- Wishlist items table
- Coupons table

### Step 5: Create Security Policies

**File to use: `SETUP_STEP4.sql`**

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `SETUP_STEP4.sql`
3. Run the script
4. Verify that the policies have been created

This step creates:
- Triggers to update timestamps on record changes
- Row-level security policies for all tables
- Access control for cart items, orders, and order items

### Step 6: Create Cart and Product Variation Functions

**File to use: `SETUP_STEP5.sql`**

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `SETUP_STEP5.sql`
3. Run the script
4. Verify that the functions have been created

This step creates:
- Function to calculate product variation prices
- Function to create or update product variations
- Functions for cart management (add, update, get)

### Step 7: Insert Sample Data

**File to use: `SETUP_STEP6.sql`**

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `SETUP_STEP6.sql`
3. Run the script
4. Verify that sample data has been inserted

This step inserts:
- Sample brands
- Sample frame types (wood and steel options)
- Sample product sizes (small, medium, large)
- Sample product categories
- Sample products
- Product variations for all combinations

### Step 8: Create Admin User

**File to use: `SETUP_STEP7.sql`**

Before running this step, you need to:
1. Create a user in Supabase Authentication
2. Note the user ID (UUID) of the user you created

To find the user ID:
- Go to Authentication > Users in your Supabase dashboard
- Click on the user you created
- Copy the UUID shown in the user details

Then:
1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `SETUP_STEP7.sql`
3. Replace 'your-admin-user-id' with the UUID you copied
4. Run the script
5. Verify that the user's role has been updated to 'admin'

### Step 9: Add Admin-Specific Functions and Policies

**File to use: `SETUP_STEP1_5.sql`**

Now that you have an admin user, you can add the admin-specific functions and policies:

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `SETUP_STEP1_5.sql`
3. Run the script
4. Verify that the admin policies have been created

This step creates:
- Admin-specific row-level security policies
- Function to check if a user is an admin

## Verifying the Setup

After completing all steps, you should:

1. Check the Tables section in Supabase to ensure all tables have been created
2. Verify that sample data has been inserted by running:
   ```sql
   SELECT * FROM products;
   SELECT * FROM frame_types;
   SELECT * FROM product_sizes;
   SELECT * FROM product_variations;
   ```
3. Verify that your admin user has been created by running:
   ```sql
   SELECT id, role FROM profiles WHERE role = 'admin';
   ```
   You should see the UUID of your admin user with the role 'admin'
4. Verify that admin policies are working by running:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```
   You should see policies including "Admins can view all profiles" and "Admins can update all profiles"

## Environment Configuration

After setting up the database, create a `.env.local` file in the root directory with the following variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
NEXT_PUBLIC_AUTH_REDIRECT_URL=http://localhost:3000/auth/callback

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Cloudinary Configuration
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=mirror_exhibit
NEXT_PUBLIC_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/your-cloud-name/image/upload

# Application Settings
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Mirror Exhibit
```

Replace the placeholder values with your actual Supabase and Stripe credentials.

## Running the Application

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Setting Up Stripe Webhooks

For the payment system to work correctly, you need to set up Stripe webhooks:

1. For local development, install the Stripe CLI and run:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

2. For production, set up a webhook in your Stripe dashboard pointing to `https://your-domain.com/api/webhooks/stripe`

## Setting Up Cloudinary

For image uploads and product image management to work correctly, you need to set up Cloudinary:

1. **Create a Cloudinary Account**:
   - Sign up at [Cloudinary](https://cloudinary.com/)
   - Note your cloud name, API key, and API secret from your dashboard

2. **Create an Upload Preset**:
   - Log in to your Cloudinary dashboard
   - Go to Settings > Upload
   - Scroll down to "Upload presets"
   - Click "Add upload preset"
   - Name it `mirror_exhibit`
   - Set it to "Unsigned" (since we're using it from the server-side with API credentials)
   - Configure optional settings:
     - Folder: `product-images` (recommended)
     - Transformations: Enable auto-optimization
   - Save the preset

3. **Update Environment Variables**:
   - Make sure your `.env.local` file includes all the Cloudinary variables listed in the Environment Configuration section
   - Double-check that `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` is set to `mirror_exhibit`

## Troubleshooting

- **"Column 'role' does not exist" error**: This error occurs if you try to reference the 'role' column in policies or functions before it's properly created. Make sure to follow these steps:
  1. Verify that Step 1 (SETUP_STEP1_SIMPLIFIED.sql) completed successfully by checking if the profiles table exists with a 'role' column
  2. If you're still getting this error in Step 2, try running this SQL first to verify the table structure:
     ```sql
     SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles';
     ```
  3. If the 'role' column doesn't appear in the results, there was an issue with Step 1. Try running Step 1 again.
- **"Column 'email' does not exist" error**: We've designed the profiles table to not include an email field since it's already in auth.users.
- **"Relation does not exist" errors**: Verify that the previous steps completed successfully before moving to the next step.
- **Authentication issues**: Check that the profiles table and authentication functions were created correctly in Steps 1 and 2.
- **Missing product variations**: Verify that the product variation function (Step 6) and sample data insertion (Step 7) completed successfully.
- **Admin policies not working**: Ensure you've created an admin user (Step 8) and run Step 9 to add the admin-specific policies.
- **Can't find user ID**: In the Supabase dashboard, go to Authentication > Users, click on the user, and copy the UUID shown in the user details.
- **Cloudinary upload errors**: If you encounter "Upload preset not found" errors:
  1. Verify that you've created the `mirror_exhibit` upload preset in your Cloudinary dashboard
  2. Check that your environment variables are correctly set, especially `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
  3. Ensure your Cloudinary API key and secret are correct
  4. For CSV product imports, make sure the image URLs are publicly accessible

## Important Notes

- Execute each SQL file in the exact order specified
- Verify that each step completes successfully before proceeding to the next
- If you encounter any errors, check the troubleshooting section and fix the issue before continuing
- The admin user must be created before adding admin-specific policies

## Database Schema Overview

The database schema is designed to support product customization with the following key tables:

1. **products**: Base product information including name, description, and base price
2. **brands**: Information about mirror brands
3. **product_categories**: Categories for organizing products
4. **frame_types**: Available frame types (wood, steel) with price adjustments
5. **product_sizes**: Available sizes (small, medium, large) with price adjustments
6. **product_variations**: Combinations of products, sizes, and frame types with calculated prices
7. **cart_items**: Items in user carts, referencing product variations
8. **orders** and **order_items**: Order information and items purchased

The schema includes functions for:
- Adding items to cart
- Updating cart quantities
- Calculating prices for product variations
- Creating and updating product variations

## Next Steps

- Upload actual product images to replace placeholder URLs
- Customize product categories, brands, frame types, and sizes to match your specific needs
- Set up email notifications for order status updates
- Configure a production deployment on a platform like Vercel or Netlify
