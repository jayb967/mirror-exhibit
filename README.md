# Mirror Exhibit E-commerce

This is a Next.js e-commerce application for Mirror Exhibit, a shop that sells bespoke laser-engraved mirrors. The application offers a complete shopping experience with a product catalog, detailed product pages, shopping cart, checkout process, and integration with Stripe for payment processing.

## Features

- **Product Catalog:** Browse and filter the collection of mirrors
- **Product Details:** View detailed information about each product
- **Shopping Cart:** Add items to cart, update quantities, and remove items
- **User Accounts:** Create an account, manage your profile, and view order history
- **Checkout Process:** Securely checkout with multiple payment options
- **Stripe Integration:** Process payments with Stripe, including Apple Pay
- **Order Management:** Track orders from processing to delivery
- **Admin Dashboard:** Manage products, orders, and customers (admin only)

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth
- **Payment Processing:** Stripe
- **Image Processing:** Cloudinary
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account
- Stripe account
- Cloudinary account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mirror-exhibit-nextjs.git
   cd mirror-exhibit-nextjs
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Authentication
   NEXT_PUBLIC_AUTH_REDIRECT_URL=http://localhost:3000/auth/callback

   # Stripe Configuration
   STRIPE_SECRET_KEY=your-stripe-secret-key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

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

4. Set up your Supabase database using the schema in `supabase/schema.sql`. You can run this file in the Supabase SQL editor.

5. For local development with Stripe webhooks, install the Stripe CLI and run:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

6. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `src/app/` - Next.js app router pages and API routes
- `src/components/` - React components
- `src/lib/` - Utility functions and configuration
- `src/types/` - TypeScript type definitions
- `public/` - Static assets
- `supabase/` - Supabase configuration and schema

## E-commerce Flow

1. **Browse Products:** Users can browse products on the shop page
2. **View Product Details:** Click on a product to see detailed information
3. **Add to Cart:** Add products to the shopping cart
4. **View Cart:** Review items in the cart, adjust quantities, or remove items
5. **Checkout:** Proceed to checkout, enter shipping and payment information
6. **Payment:** Complete payment through Stripe
7. **Order Confirmation:** Receive order confirmation and updates

## API Routes

- `/api/create-checkout-session` - Creates a Stripe checkout session
- `/api/webhooks/stripe` - Handles Stripe webhook events
- `/api/debug/cart` - Debug endpoint for cart troubleshooting (development only)

## Stripe Integration

This project uses Stripe for payment processing. The integration includes:

- Checkout Session API for secure payments
- Support for multiple payment methods (credit card, Apple Pay, etc.)
- Webhook handling for payment events
- Order status updates based on payment status

## Cloudinary Integration

Cloudinary is used for image management and optimization. The setup includes:

### Setting Up Cloudinary

1. **Create a Cloudinary Account**:
   - Sign up at [Cloudinary](https://cloudinary.com/)
   - Note your cloud name, API key, and API secret

2. **Configure Environment Variables**:
   - Add the following to your `.env.local` file:
   ```
   CLOUDINARY_API_SECRET=your-api-secret
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=mirror_exhibit
   NEXT_PUBLIC_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/your-cloud-name/image/upload
   ```

3. **Create an Upload Preset**:
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

4. **Features Enabled**:
   - Automatic image optimization and resizing
   - Secure server-side uploads for product images
   - Support for remote URL uploads (for CSV product imports)
   - Image transformation and delivery optimization

## Supabase Integration

Supabase provides the database and authentication for the application:

- PostgreSQL database with RLS (Row Level Security)
- User authentication and management
- Real-time updates for cart and orders
- Stored procedures for cart operations

## License

[MIT](LICENSE)

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [Stripe](https://stripe.com/)
- [Tailwind CSS](https://tailwindcss.com/)