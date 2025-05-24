/**
 * Coupon Service
 * Handles coupon validation and application
 */

import { useSupabaseClient } from '@/utils/supabase-client';
import { ENABLE_FREE_SHIPPING_RULES } from '@/config/featureFlags';
import { shippingService } from './shippingService';

// Coupon types
export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  starts_at: string;
  expires_at: string | null;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  compatible_with_free_shipping?: boolean;
  priority?: number;
  category_id?: string;
  product_id?: string;
}

export interface CouponValidationResult {
  isValid: boolean;
  coupon?: Coupon;
  error?: string;
  discount?: number;
}

/**
 * Coupon Service
 * Handles coupon validation and application
 */
class CouponService {
  private supabase = useSupabaseClient();

  /**
   * Validate a coupon code
   * @param code Coupon code
   * @param subtotal Order subtotal
   * @param cartItems Optional cart items for checking product-specific rules
   * @param address Optional shipping address for checking location-specific rules
   * @returns Validation result
   */
  async validateCoupon(
    code: string,
    subtotal: number,
    cartItems?: any[],
    address?: any
  ): Promise<CouponValidationResult> {
    try {
      if (!code) {
        return { isValid: false, error: 'Coupon code is required' };
      }

      // Fetch coupon from database
      const { data, error } = await this.supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { isValid: false, error: 'Invalid coupon code' };
      }

      const coupon = data as Coupon;

      // Check if coupon has expired
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return { isValid: false, error: 'Coupon has expired' };
      }

      // Check if coupon has reached max uses
      if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
        return { isValid: false, error: 'Coupon has reached maximum uses' };
      }

      // Check if order meets minimum purchase requirement
      if (subtotal < coupon.min_purchase) {
        return {
          isValid: false,
          error: `Order must be at least $${coupon.min_purchase.toFixed(2)} to use this coupon`
        };
      }

      // Check compatibility with free shipping if applicable
      if (ENABLE_FREE_SHIPPING_RULES && cartItems && address) {
        // Check if order is eligible for free shipping
        const isEligibleForFreeShipping = await shippingService.isEligibleForFreeShipping(
          subtotal,
          cartItems,
          address
        );

        // If eligible for free shipping and coupon is not compatible with free shipping
        if (isEligibleForFreeShipping && coupon.compatible_with_free_shipping === false) {
          return {
            isValid: false,
            error: 'This coupon cannot be combined with free shipping',
            coupon
          };
        }
      }

      // Check product-specific restrictions
      if (coupon.product_id && cartItems) {
        const hasProduct = cartItems.some(item => item.product_id === coupon.product_id);
        if (!hasProduct) {
          return {
            isValid: false,
            error: 'This coupon can only be used with specific products',
            coupon
          };
        }
      }

      // Check category-specific restrictions
      if (coupon.category_id && cartItems) {
        const hasCategory = cartItems.some(item =>
          item.product?.category_id === coupon.category_id
        );
        if (!hasCategory) {
          return {
            isValid: false,
            error: 'This coupon can only be used with specific product categories',
            coupon
          };
        }
      }

      // Calculate discount
      const discount = this.calculateDiscount(coupon, subtotal);

      return {
        isValid: true,
        coupon,
        discount
      };
    } catch (error) {
      console.error('Error validating coupon:', error);
      return { isValid: false, error: 'Error validating coupon' };
    }
  }

  /**
   * Apply a coupon to an order
   * @param couponId Coupon ID
   * @param orderId Order ID
   * @returns Success status
   */
  async applyCoupon(couponId: string, orderId: string): Promise<boolean> {
    try {
      // Increment coupon usage
      const { error: updateError } = await this.supabase
        .from('coupons')
        .update({ current_uses: this.supabase.rpc('increment', { row_id: couponId }) })
        .eq('id', couponId);

      if (updateError) {
        console.error('Error updating coupon usage:', updateError);
        return false;
      }

      // Add coupon to order
      const { error: orderError } = await this.supabase
        .from('orders')
        .update({ coupon_id: couponId })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error applying coupon to order:', orderError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error applying coupon:', error);
      return false;
    }
  }

  /**
   * Calculate discount amount based on coupon and subtotal
   * @param coupon Coupon
   * @param subtotal Order subtotal
   * @returns Discount amount
   */
  private calculateDiscount(coupon: Coupon, subtotal: number): number {
    if (coupon.discount_type === 'percentage') {
      // Calculate percentage discount
      return (coupon.discount_value / 100) * subtotal;
    } else {
      // Fixed amount discount
      return Math.min(coupon.discount_value, subtotal);
    }
  }

  /**
   * Format discount for display
   * @param coupon Coupon
   * @returns Formatted discount string
   */
  formatDiscount(coupon: Coupon): string {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`;
    } else {
      return `$${coupon.discount_value.toFixed(2)}`;
    }
  }
}

// Export a singleton instance
export const couponService = new CouponService();
