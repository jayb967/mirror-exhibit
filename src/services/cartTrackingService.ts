import { createClient } from '@supabase/supabase-js';
import { CartItem } from './cartService';

export interface CartTrackingData {
  id?: string;
  user_id?: string;
  guest_token?: string;
  email?: string;
  cart_items: CartItem[];
  subtotal: number;
  last_activity: string;
  checkout_started: boolean;
  checkout_completed: boolean;
  recovery_email_sent: boolean;
  // Enhanced marketing tracking fields
  payment_intent_started?: boolean;
  payment_intent_started_at?: string;
  stripe_session_id?: string;
  payment_abandoned?: boolean;
  payment_abandoned_at?: string;
  marketing_emails_sent?: number;
  last_marketing_email_sent?: string;
  checkout_form_completed?: boolean;
  checkout_form_completed_at?: string;
  customer_data?: any;
  shipping_data?: any;
  // UTM and device tracking
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  device_type?: string;
  browser?: string;
  referrer?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Cart Tracking Service
 * Tracks cart activity for marketing and analytics purposes
 */
class CartTrackingService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  private readonly TRACKING_TABLE = 'cart_tracking';
  private readonly CART_TRACKING_ID_KEY = 'cart_tracking_id';

  /**
   * Track cart activity
   * @param cartItems Current cart items
   * @param subtotal Cart subtotal
   * @param email User email (if available)
   * @param checkoutStarted Whether checkout has started
   * @returns Promise resolving to tracking ID
   */
  async trackCart(
    cartItems: CartItem[],
    subtotal: number,
    email?: string,
    checkoutStarted: boolean = false
  ): Promise<string | null> {
    try {
      if (cartItems.length === 0) {
        return null;
      }

      // Get current user or guest token (Clerk version)
      // For now, we'll primarily work with guest tokens since this is a service class
      // TODO: Implement proper Clerk user detection in service classes
      const userId = null; // Will be set by components that have access to Clerk
      const guestToken = this.getGuestToken();

      if (!userId && !guestToken && !email) {
        return null;
      }

      // Get tracking data
      const trackingData: CartTrackingData = {
        user_id: userId || null,
        guest_token: !userId ? guestToken : null,
        email: email || user?.email || null,
        cart_items: cartItems,
        subtotal,
        last_activity: new Date().toISOString(),
        checkout_started: checkoutStarted,
        checkout_completed: false,
        recovery_email_sent: false,
        utm_source: this.getUtmParameter('utm_source'),
        utm_medium: this.getUtmParameter('utm_medium'),
        utm_campaign: this.getUtmParameter('utm_campaign'),
        device_type: this.getDeviceType(),
        browser: this.getBrowser(),
        referrer: this.getReferrer()
      };

      // Check if we already have a tracking ID
      const trackingId = this.getTrackingId();

      if (trackingId) {
        // Update existing tracking record
        const { data, error } = await this.supabase
          .from(this.TRACKING_TABLE)
          .update({
            ...trackingData,
            updated_at: new Date().toISOString()
          })
          .eq('id', trackingId)
          .select('id')
          .single();

        if (error) {
          console.error('Error updating cart tracking:', error);
          return null;
        }

        return data.id;
      } else {
        // Create new tracking record
        const { data, error } = await this.supabase
          .from(this.TRACKING_TABLE)
          .insert({
            ...trackingData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error creating cart tracking:', error);
          return null;
        }

        // Save tracking ID to local storage
        this.saveTrackingId(data.id);
        return data.id;
      }
    } catch (error) {
      console.error('Error tracking cart:', error);
      return null;
    }
  }

  /**
   * Mark checkout as started
   * @param email User email
   * @returns Promise resolving to success status
   */
  async markCheckoutStarted(email?: string): Promise<boolean> {
    try {
      const trackingId = this.getTrackingId();
      if (!trackingId) return false;

      const { error } = await this.supabase
        .from(this.TRACKING_TABLE)
        .update({
          checkout_started: true,
          email: email || undefined,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', trackingId);

      return !error;
    } catch (error) {
      console.error('Error marking checkout as started:', error);
      return false;
    }
  }

  /**
   * Mark checkout as completed
   * @returns Promise resolving to success status
   */
  async markCheckoutCompleted(): Promise<boolean> {
    try {
      const trackingId = this.getTrackingId();
      if (!trackingId) return false;

      const { error } = await this.supabase
        .from(this.TRACKING_TABLE)
        .update({
          checkout_completed: true,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', trackingId);

      if (!error) {
        // Clear tracking ID after successful checkout
        this.clearTrackingId();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error marking checkout as completed:', error);
      return false;
    }
  }

  /**
   * Get guest token from local storage
   * @returns Guest token or null
   */
  private getGuestToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('guest_token');
  }

  /**
   * Get tracking ID from local storage
   * @returns Tracking ID or null
   */
  private getTrackingId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.CART_TRACKING_ID_KEY);
  }

  /**
   * Save tracking ID to local storage
   * @param id Tracking ID
   */
  private saveTrackingId(id: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.CART_TRACKING_ID_KEY, id);
  }

  /**
   * Clear tracking ID from local storage
   */
  private clearTrackingId(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.CART_TRACKING_ID_KEY);
  }

  /**
   * Get UTM parameter from URL
   * @param param UTM parameter name
   * @returns UTM parameter value or null
   */
  private getUtmParameter(param: string): string | null {
    if (typeof window === 'undefined') return null;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  /**
   * Get device type
   * @returns Device type (desktop, tablet, mobile)
   */
  private getDeviceType(): string {
    if (typeof window === 'undefined') return 'unknown';
    const userAgent = navigator.userAgent;
    if (/iPad|Android(?!.*Mobile)|Tablet/i.test(userAgent)) {
      return 'tablet';
    } else if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Get browser name
   * @returns Browser name
   */
  private getBrowser(): string {
    if (typeof window === 'undefined') return 'unknown';
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
    if (userAgent.indexOf('Safari') > -1) return 'Safari';
    if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
    if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) return 'IE';
    if (userAgent.indexOf('Edge') > -1) return 'Edge';
    return 'unknown';
  }

  /**
   * Get referrer
   * @returns Referrer URL or null
   */
  private getReferrer(): string | null {
    if (typeof window === 'undefined') return null;
    return document.referrer || null;
  }

  /**
   * Track cart activity with explicit parameters (for Clerk compatibility)
   * Uses API endpoint with service role to bypass RLS policies
   * @param cartItems Current cart items
   * @param email User email
   * @param checkoutStarted Whether checkout has started
   * @param checkoutCompleted Whether checkout is completed
   * @param userId Optional user ID from Clerk
   * @returns Promise resolving to success status
   */
  async trackCartActivity(
    cartItems: CartItem[],
    email?: string,
    checkoutStarted: boolean = false,
    checkoutCompleted: boolean = false,
    userId?: string
  ): Promise<boolean> {
    try {
      // If cart tracking is disabled, return true to not block cart operations
      if (process.env.NEXT_PUBLIC_DISABLE_CART_TRACKING === 'true') {
        return true;
      }

      if (cartItems.length === 0) {
        return true; // Don't block cart operations
      }

      const guestToken = this.getGuestToken();
      if (!userId && !guestToken && !email) {
        return true; // Don't block cart operations
      }

      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Prepare tracking data
      const trackingData = {
        user_id: userId || null,
        guest_token: !userId ? guestToken : null,
        email: email || null,
        cart_items: cartItems,
        subtotal,
        checkout_started: checkoutStarted,
        checkout_completed: checkoutCompleted,
        metadata: {
          utm_source: this.getUtmParameter('utm_source'),
          utm_medium: this.getUtmParameter('utm_medium'),
          utm_campaign: this.getUtmParameter('utm_campaign'),
          device_type: this.getDeviceType(),
          browser: this.getBrowser(),
          referrer: this.getReferrer()
        }
      };

      // Use API endpoint instead of direct Supabase calls to bypass RLS
      const response = await fetch('/api/cart-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'track',
          ...trackingData
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Cart tracking API error:', errorData);
        // Don't fail the cart operation if tracking fails
        return true;
      }

      const result = await response.json();
      console.log('Cart tracking successful:', result);
      return true;

    } catch (error) {
      console.error('Error in trackCartActivity:', error);
      // Don't fail the cart operation if tracking fails
      return true; // Return true to not break cart functionality
    }
  }

  /**
   * Track guest user data
   * Uses API endpoint with service role to bypass RLS policies
   * @param guestData Guest user data
   * @returns Promise resolving to success status
   */
  async trackGuestUserData(guestData: any): Promise<boolean> {
    try {
      const guestToken = this.getGuestToken();
      if (!guestToken) return false;

      // Use API endpoint instead of direct Supabase calls
      const response = await fetch('/api/cart-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          guest_token: guestToken,
          ...guestData
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Guest data tracking API error:', errorData);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in trackGuestUserData:', error);
      return false;
    }
  }

  /**
   * Update checkout status
   * @param checkoutStarted Whether checkout has started
   * @param checkoutCompleted Whether checkout is completed
   * @param email User email
   * @param userId Optional user ID from Clerk
   * @returns Promise resolving to success status
   */
  async updateCheckoutStatus(
    checkoutStarted: boolean,
    checkoutCompleted: boolean,
    email?: string,
    userId?: string
  ): Promise<boolean> {
    try {
      const guestToken = this.getGuestToken();
      if (!userId && !guestToken) return false;

      // Use API endpoint instead of direct Supabase calls
      const response = await fetch('/api/cart-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          user_id: userId,
          guest_token: !userId ? guestToken : undefined,
          checkout_started: checkoutStarted,
          checkout_completed: checkoutCompleted,
          email: email
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Checkout status update API error:', errorData);
        return false;
      }

      if (checkoutCompleted) {
        this.clearTrackingId();
      }

      return true;
    } catch (error) {
      console.error('Error in updateCheckoutStatus:', error);
      return false;
    }
  }

  /**
   * Mark checkout form as completed (for marketing tracking)
   * @param customerData Customer information from the form
   * @param shippingData Shipping information from the form
   * @param email User email
   * @param userId Optional user ID from Clerk
   * @returns Promise resolving to success status
   */
  async markCheckoutFormCompleted(
    customerData: any,
    shippingData: any,
    email?: string,
    userId?: string
  ): Promise<boolean> {
    try {
      const guestToken = this.getGuestToken();
      if (!userId && !guestToken && !email) return false;

      // Use API endpoint for consistent tracking
      const response = await fetch('/api/cart-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          user_id: userId,
          guest_token: !userId ? guestToken : undefined,
          checkout_form_completed: true,
          checkout_form_completed_at: new Date().toISOString(),
          customer_data: customerData,
          shipping_data: shippingData,
          email: email
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Checkout form completion API error:', errorData);
        return false;
      }

      console.log('Checkout form completion tracked for marketing');
      return true;
    } catch (error) {
      console.error('Error marking checkout form completed:', error);
      return false;
    }
  }

  /**
   * Mark payment intent as started (when user reaches Stripe)
   * @param stripeSessionId Stripe checkout session ID
   * @param email User email
   * @param userId Optional user ID from Clerk
   * @returns Promise resolving to success status
   */
  async markPaymentIntentStarted(
    stripeSessionId: string,
    email?: string,
    userId?: string
  ): Promise<boolean> {
    try {
      const guestToken = this.getGuestToken();
      if (!userId && !guestToken && !email) return false;

      // Use API endpoint for consistent tracking
      const response = await fetch('/api/cart-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          user_id: userId,
          guest_token: !userId ? guestToken : undefined,
          payment_intent_started: true,
          payment_intent_started_at: new Date().toISOString(),
          stripe_session_id: stripeSessionId,
          email: email
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Payment intent started API error:', errorData);
        return false;
      }

      console.log('Payment intent started tracked for marketing');
      return true;
    } catch (error) {
      console.error('Error marking payment intent started:', error);
      return false;
    }
  }

  /**
   * Mark payment as abandoned (for marketing follow-up)
   * @param email User email
   * @param userId Optional user ID from Clerk
   * @returns Promise resolving to success status
   */
  async markPaymentAbandoned(
    email?: string,
    userId?: string
  ): Promise<boolean> {
    try {
      const guestToken = this.getGuestToken();
      if (!userId && !guestToken && !email) return false;

      // Use API endpoint for consistent tracking
      const response = await fetch('/api/cart-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          user_id: userId,
          guest_token: !userId ? guestToken : undefined,
          payment_abandoned: true,
          payment_abandoned_at: new Date().toISOString(),
          email: email
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Payment abandoned API error:', errorData);
        return false;
      }

      console.log('Payment abandonment tracked for marketing follow-up');
      return true;
    } catch (error) {
      console.error('Error marking payment abandoned:', error);
      return false;
    }
  }

  /**
   * Increment marketing email count
   * @param email User email
   * @param userId Optional user ID from Clerk
   * @returns Promise resolving to success status
   */
  async incrementMarketingEmailCount(
    email?: string,
    userId?: string
  ): Promise<boolean> {
    try {
      const guestToken = this.getGuestToken();
      if (!userId && !guestToken && !email) return false;

      // Use API endpoint for consistent tracking
      const response = await fetch('/api/cart-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'increment_marketing_email',
          user_id: userId,
          guest_token: !userId ? guestToken : undefined,
          email: email
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Marketing email increment API error:', errorData);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error incrementing marketing email count:', error);
      return false;
    }
  }

  /**
   * Convert guest cart to authenticated user cart
   * Uses API endpoint with service role to bypass RLS policies
   * @param clerkUserId Clerk user ID
   * @returns Promise resolving to success status
   */
  async convertGuestToUser(clerkUserId: string): Promise<boolean> {
    try {
      const guestToken = this.getGuestToken();
      if (!guestToken) {
        console.log('No guest token found, nothing to convert');
        return false;
      }

      console.log('Converting guest cart to user cart:', { guestToken, clerkUserId });

      // Use API endpoint instead of direct Supabase calls
      const response = await fetch('/api/cart-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'convert_guest',
          guest_token: guestToken,
          clerk_user_id: clerkUserId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Guest conversion API error:', errorData);
        return false;
      }

      const result = await response.json();
      if (result.success) {
        console.log('Guest cart conversion successful');
        this.clearGuestToken();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error in convertGuestToUser:', error);
      return false;
    }
  }

  /**
   * Manual guest to user cart conversion (fallback when RPC function fails)
   */
  private async manualGuestToUserConversion(guestToken: string, clerkUserId: string): Promise<boolean> {
    try {
      console.log('Starting manual guest cart conversion...');

      // Get guest cart record
      const { data: guestCart, error: guestError } = await this.supabase
        .from('cart_tracking')
        .select('*')
        .eq('guest_token', guestToken)
        .single();

      if (guestError || !guestCart) {
        console.log('No guest cart found for token:', guestToken);
        return false;
      }

      console.log('Found guest cart with', guestCart.cart_items?.length || 0, 'items');

      // Check if user already has a cart (handle potential RLS errors gracefully)
      let userCart = null;
      let userError = null;

      try {
        const result = await this.supabase
          .from('cart_tracking')
          .select('*')
          .eq('user_id', clerkUserId)
          .single();

        userCart = result.data;
        userError = result.error;
      } catch (error) {
        console.log('Error checking for existing user cart (non-critical):', error);
        userError = error;
      }

      if (userCart && !userError) {
        console.log('Found existing user cart, merging...');

        // Merge cart items
        const mergedItems = [...(userCart.cart_items || []), ...(guestCart.cart_items || [])];
        const mergedSubtotal = (userCart.subtotal || 0) + (guestCart.subtotal || 0);
        const mergedCheckoutStarted = userCart.checkout_started || guestCart.checkout_started;

        // Update user cart with merged data
        const { error: updateError } = await this.supabase
          .from('cart_tracking')
          .update({
            cart_items: mergedItems,
            subtotal: mergedSubtotal,
            last_activity: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            checkout_started: mergedCheckoutStarted,
            email: userCart.email || guestCart.email
          })
          .eq('user_id', clerkUserId);

        if (updateError) {
          console.error('Error updating user cart:', updateError);
          return false;
        }

        // Delete guest cart
        const { error: deleteError } = await this.supabase
          .from('cart_tracking')
          .delete()
          .eq('guest_token', guestToken);

        if (deleteError) {
          console.error('Error deleting guest cart:', deleteError);
          // Don't return false here, the merge was successful
        }

        console.log('Successfully merged guest cart with existing user cart');
        return true;

      } else {
        console.log('No existing user cart, converting guest cart...');

        // Convert guest cart to user cart
        const { error: convertError } = await this.supabase
          .from('cart_tracking')
          .update({
            user_id: clerkUserId,
            guest_token: null,
            is_anonymous: false,
            updated_at: new Date().toISOString()
          })
          .eq('guest_token', guestToken);

        if (convertError) {
          console.error('Error converting guest cart:', convertError);
          return false;
        }

        console.log('Successfully converted guest cart to user cart');
        return true;
      }

    } catch (error) {
      console.error('Error in manual guest cart conversion:', error);
      return false;
    }
  }

  /**
   * Clear guest token from localStorage
   */
  private clearGuestToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guest_token');
    }
  }
}

// Export a singleton instance
export const cartTrackingService = new CartTrackingService();
