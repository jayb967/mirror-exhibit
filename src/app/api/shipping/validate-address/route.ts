// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/utils/clerk-supabase';
import { shippingService, ShippingAddress } from '@/services/shippingService';

/**
 * Validate a shipping address
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
 *   }
 * }
 * 
 * Response:
 * {
 *   address: ShippingAddress;
 *   isValid: boolean;
 * }
 */
export async function POST(req: Request) {
  try {
    // Get request body
    const body = await req.json();
    const { address } = body;
    
    // Validate request
    if (!address || !address.country) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }
    
    try {
      // Validate address
      const validatedAddress = await shippingService.validateAddress(address);
      
      return NextResponse.json({
        address: validatedAddress,
        isValid: true
      });
    } catch (error) {
      // Address validation failed
      return NextResponse.json({
        address,
        isValid: false,
        error: (error as Error).message
      });
    }
  } catch (error) {
    console.error('Error validating address:', error);
    return NextResponse.json(
      { error: 'Failed to validate address' },
      { status: 500 }
    );
  }
}
