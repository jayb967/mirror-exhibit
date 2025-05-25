import { NextResponse } from 'next/server';

// Force dynamic rendering for all API routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Root API route - provides API information
 */
export async function GET() {
  return NextResponse.json({
    message: 'Mirror Exhibit API',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      brands: '/api/brands',
      tags: '/api/tags',
      sizes: '/api/sizes',
      cart: '/api/cart',
      orders: '/api/orders',
      shipping: '/api/shipping',
      admin: '/api/admin'
    }
  });
}
