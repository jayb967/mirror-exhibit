import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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
  private supabase = createClientComponentClient();
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

      // Get current user or guest token
      const { data: { user } } = await this.supabase.auth.getUser();
      const userId = user?.id;
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
}

// Export a singleton instance
export const cartTrackingService = new CartTrackingService();
