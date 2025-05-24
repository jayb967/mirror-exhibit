// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/utils/clerk-supabase';
import { shippingService, ShippingAddress } from '@/services/shippingService';
import { CartItem } from '@/services/cartService';

/**
 * Get shipping rates based on address and cart items
 *
 * Request body:
 * {
 *   address: {
 *     country: string;
 *     state?: string;
 *     city?: string;
 *     postalCode?: string;
 *     address?: string;
 *     address2?: string;
 *     name?: string;
 *     phone?: string;
 *     email?: string;
 *   },
 *   cartItems?: CartItem[]
 * }
 *
 * Response:
 * {
 *   options: ShippingOption[];
 *   freeShippingEligible: boolean;
 *   freeShippingThreshold: number;
 *   remainingForFreeShipping: number;
 * }
 */
export async function POST(req: Request) {
  try {
    // Get request body
    const body = await req.json();
    const { address, cartItems } = body;

    // Validate request
    if (!address || !address.country) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    // Get shipping options
    const options = await shippingService.getShippingOptions(address, cartItems);

    // Calculate subtotal
    const subtotal = cartItems?.reduce((sum: number, item: CartItem) => {
      return sum + (item.price || item.product?.price || 0) * item.quantity;
    }, 0) || 0;

    // Check free shipping eligibility
    const freeShippingEligible = await shippingService.isEligibleForFreeShipping(
      subtotal,
      cartItems,
      address
    );

    // Get free shipping threshold
    const freeShippingThreshold = await shippingService.getFreeShippingThreshold(
      address.country
    );

    // Get remaining amount for free shipping
    const remainingForFreeShipping = await shippingService.getRemainingForFreeShipping(
      subtotal,
      address.country
    );

    return NextResponse.json({
      options,
      freeShippingEligible,
      freeShippingThreshold,
      remainingForFreeShipping
    });
  } catch (error) {
    console.error('Error getting shipping rates:', error);
    return NextResponse.json(
      { error: 'Failed to get shipping rates' },
      { status: 500 }
    );
  }
}
