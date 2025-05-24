// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/utils/clerk-supabase';

/**
 * Validate a coupon code
 * 
 * Request body:
 * {
 *   code: string;
 *   subtotal: number;
 * }
 * 
 * Response:
 * {
 *   isValid: boolean;
 *   coupon?: {
 *     id: string;
 *     code: string;
 *     description: string;
 *     discount_type: 'percentage' | 'fixed';
 *     discount_value: number;
 *     min_purchase: number;
 *     ...
 *   };
 *   error?: string;
 *   discount?: number;
 * }
 */
export async function POST(req: Request) {
  try {
    // Get request body
    const body = await req.json();
    const { code, subtotal } = body;
    
    if (!code) {
      return NextResponse.json(
        { isValid: false, error: 'Coupon code is required' },
        { status: 400 }
      );
    }
    
    if (typeof subtotal !== 'number' || subtotal < 0) {
      return NextResponse.json(
        { isValid: false, error: 'Valid subtotal is required' },
        { status: 400 }
      );
    }
    
    // Create Supabase client
    const supabase = await createServerSupabaseClient();
    
    // Fetch coupon from database
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();
    
    if (error || !data) {
      return NextResponse.json(
        { isValid: false, error: 'Invalid coupon code' },
        { status: 200 }
      );
    }
    
    const coupon = data;
    
    // Check if coupon has expired
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json(
        { isValid: false, error: 'Coupon has expired' },
        { status: 200 }
      );
    }
    
    // Check if coupon has reached max uses
    if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
      return NextResponse.json(
        { isValid: false, error: 'Coupon has reached maximum uses' },
        { status: 200 }
      );
    }
    
    // Check if order meets minimum purchase requirement
    if (subtotal < coupon.min_purchase) {
      return NextResponse.json(
        {
          isValid: false,
          error: `Order must be at least $${coupon.min_purchase.toFixed(2)} to use this coupon`
        },
        { status: 200 }
      );
    }
    
    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      // Calculate percentage discount
      discount = (coupon.discount_value / 100) * subtotal;
    } else {
      // Fixed amount discount
      discount = Math.min(coupon.discount_value, subtotal);
    }
    
    return NextResponse.json({
      isValid: true,
      coupon,
      discount
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { isValid: false, error: 'Error validating coupon' },
      { status: 500 }
    );
  }
}
