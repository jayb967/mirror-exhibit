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
        last_activity: new Date().toISOString(),
        checkout_started: checkoutStarted,
        checkout_completed: checkoutCompleted,
        recovery_email_sent: false,
        utm_source: this.getUtmParameter('utm_source'),
        utm_medium: this.getUtmParameter('utm_medium'),
        utm_campaign: this.getUtmParameter('utm_campaign'),
        device_type: this.getDeviceType(),
        browser: this.getBrowser(),
        referrer: this.getReferrer()
      };

      // Check if record exists first, then insert or update accordingly
      let error = null;

      if (userId) {
        // For authenticated users, try to update first, then insert if not found
        const { data: existingRecord } = await this.supabase
          .from(this.TRACKING_TABLE)
          .select('id')
          .eq('user_id', userId)
          .single();

        if (existingRecord) {
          // Update existing record
          const { error: updateError } = await this.supabase
            .from(this.TRACKING_TABLE)
            .update({
              ...trackingData,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
          error = updateError;
        } else {
          // Insert new record
          const { error: insertError } = await this.supabase
            .from(this.TRACKING_TABLE)
            .insert({
              ...trackingData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          error = insertError;
        }
      } else if (guestToken) {
        // For guest users, try to update first, then insert if not found
        const { data: existingRecord } = await this.supabase
          .from(this.TRACKING_TABLE)
          .select('id')
          .eq('guest_token', guestToken)
          .single();

        if (existingRecord) {
          // Update existing record
          const { error: updateError } = await this.supabase
            .from(this.TRACKING_TABLE)
            .update({
              ...trackingData,
              updated_at: new Date().toISOString()
            })
            .eq('guest_token', guestToken);
          error = updateError;
        } else {
          // Insert new record
          const { error: insertError } = await this.supabase
            .from(this.TRACKING_TABLE)
            .insert({
              ...trackingData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          error = insertError;
        }
      }

      if (error) {
        console.error('Error tracking cart activity:', error);
        // Don't fail the cart operation if tracking fails
        return true; // Return true to not break cart functionality
      }

      return true;
    } catch (error) {
      console.error('Error in trackCartActivity:', error);
      // Don't fail the cart operation if tracking fails
      return true; // Return true to not break cart functionality
    }
  }

  /**
   * Track guest user data
   * @param guestData Guest user data
   * @returns Promise resolving to success status
   */
  async trackGuestUserData(guestData: any): Promise<boolean> {
    try {
      const guestToken = this.getGuestToken();
      if (!guestToken) return false;

      // Update the cart tracking record with guest data
      const { error } = await this.supabase
        .from(this.TRACKING_TABLE)
        .update({
          ...guestData,
          updated_at: new Date().toISOString()
        })
        .eq('guest_token', guestToken);

      if (error) {
        console.error('Error tracking guest user data:', error);
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

      const updateData = {
        checkout_started: checkoutStarted,
        checkout_completed: checkoutCompleted,
        email: email || undefined,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let error = null;

      if (userId) {
        const { error: updateError } = await this.supabase
          .from(this.TRACKING_TABLE)
          .update(updateData)
          .eq('user_id', userId);
        error = updateError;
      } else if (guestToken) {
        const { error: updateError } = await this.supabase
          .from(this.TRACKING_TABLE)
          .update(updateData)
          .eq('guest_token', guestToken);
        error = updateError;
      }

      if (error) {
        console.error('Error updating checkout status:', error);
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
   * Convert guest cart to authenticated user cart
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

      // Try RPC function first, fallback to manual implementation
      try {
        const { data, error } = await this.supabase
          .rpc('merge_guest_cart_with_user', {
            p_guest_token: guestToken,
            p_clerk_user_id: clerkUserId
          });

        if (!error && data !== null) {
          console.log('Guest cart conversion via RPC successful:', data);
          this.clearGuestToken();
          return data === true;
        }

        console.log('RPC function failed or not found, using manual implementation:', error);
      } catch (rpcError) {
        console.log('RPC call failed, using manual implementation:', rpcError);
      }

      // Manual implementation as fallback
      const success = await this.manualGuestToUserConversion(guestToken, clerkUserId);

      if (success) {
        console.log('Guest cart conversion via manual method successful');
        this.clearGuestToken();
      }

      return success;
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
