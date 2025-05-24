/**
 * Product Analytics Tracking Utilities
 *
 * This module provides functions for tracking user interactions
 * with products across the application.
 */

// Types for analytics events
export interface BaseAnalyticsEvent {
  product_id: string;
  source?: string;
  user_id?: string;
  session_id?: string;
}

export interface ProductViewEvent extends BaseAnalyticsEvent {
  event_type: 'view';
  event_data: {
    position?: number; // Position in carousel/list
    category?: string;
    referrer?: string;
  };
}

export interface AddToCartClickEvent extends BaseAnalyticsEvent {
  event_type: 'add_to_cart_click';
  event_data: {
    position?: number;
    from_modal?: boolean;
  };
}

export interface OptionSelectEvent extends BaseAnalyticsEvent {
  event_type: 'option_select';
  event_data: {
    option_type: 'frame_type' | 'size';
    option_value: string;
    previous_value?: string;
  };
}

export interface ModalEvent extends BaseAnalyticsEvent {
  event_type: 'modal_open' | 'modal_close';
  event_data: {
    duration_seconds?: number; // For modal_close
    trigger_source?: string; // What triggered the modal
  };
}

export interface CarouselInteractionEvent {
  event_type: 'carousel_interaction';
  event_data: {
    action: 'next' | 'prev' | 'pause' | 'resume' | 'autoplay_stop';
    section: string; // sectionId
    slide_index?: number;
  };
  source: string;
  session_id?: string;
}

export interface ProductClickEvent extends BaseAnalyticsEvent {
  event_type: 'product_click';
  event_data: {
    click_target: 'image' | 'title' | 'price' | 'card';
    position?: number;
  };
}

export type AnalyticsEvent =
  | ProductViewEvent
  | AddToCartClickEvent
  | OptionSelectEvent
  | ModalEvent
  | CarouselInteractionEvent
  | ProductClickEvent;

// Session management for anonymous users
class SessionManager {
  private static SESSION_KEY = 'me_analytics_session';
  private static sessionId: string | null = null;

  static getSessionId(): string {
    if (typeof window === 'undefined') return 'server-session';

    if (!this.sessionId) {
      this.sessionId = localStorage.getItem(this.SESSION_KEY);

      if (!this.sessionId) {
        this.sessionId = this.generateSessionId();
        localStorage.setItem(this.SESSION_KEY, this.sessionId);
      }
    }

    return this.sessionId;
  }

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static clearSession(): void {
    this.sessionId = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY);
    }
  }
}

// Analytics tracking class
class ProductAnalytics {
  private static isEnabled = true;
  private static batchQueue: AnalyticsEvent[] = [];
  private static batchTimeout: NodeJS.Timeout | null = null;
  private static readonly BATCH_SIZE = 10;
  private static readonly BATCH_DELAY = 2000; // 2 seconds

  /**
   * Track a product analytics event
   */
  static async track(event: AnalyticsEvent): Promise<void> {
    if (!this.isEnabled || typeof window === 'undefined') return;

    try {
      // Add session ID if not provided
      if (!event.session_id) {
        event.session_id = SessionManager.getSessionId();
      }

      // Add source if not provided
      if (!event.source) {
        event.source = this.detectSource();
      }

      // Add to batch queue
      this.batchQueue.push(event);

      // Process batch if it's full or start timer
      if (this.batchQueue.length >= this.BATCH_SIZE) {
        await this.processBatch();
      } else {
        this.startBatchTimer();
      }

    } catch (error) {
      console.warn('Analytics tracking failed (non-critical):', error);
      // Don't throw error - analytics failures shouldn't break the app
    }
  }

  /**
   * Track product view
   */
  static trackProductView(productId: string, options: {
    position?: number;
    category?: string;
    source?: string;
  } = {}): void {
    try {
      ProductAnalytics.track({
        event_type: 'view',
        product_id: productId,
        source: options.source,
        event_data: {
          position: options.position,
          category: options.category,
          referrer: typeof window !== 'undefined' ? document.referrer : undefined,
        }
      });
    } catch (error) {
      console.warn('Analytics tracking failed for product view:', error);
    }
  }

  /**
   * Track add to cart click
   */
  static trackAddToCartClick(productId: string, options: {
    position?: number;
    fromModal?: boolean;
    source?: string;
  } = {}): void {
    try {
      ProductAnalytics.track({
        event_type: 'add_to_cart_click',
        product_id: productId,
        source: options.source,
        event_data: {
          position: options.position,
          from_modal: options.fromModal,
        }
      });
    } catch (error) {
      console.warn('Analytics tracking failed for add to cart click:', error);
    }
  }

  /**
   * Track option selection
   */
  static trackOptionSelect(productId: string, optionType: 'frame_type' | 'size', optionValue: string, options: {
    previousValue?: string;
    source?: string;
  } = {}): void {
    try {
      ProductAnalytics.track({
        event_type: 'option_select',
        product_id: productId,
        source: options.source,
        event_data: {
          option_type: optionType,
          option_value: optionValue,
          previous_value: options.previousValue,
        }
      });
    } catch (error) {
      console.warn('Analytics tracking failed for option select:', error);
    }
  }

  /**
   * Track modal open
   */
  static trackModalOpen(productId: string, options: {
    triggerSource?: string;
    source?: string;
  } = {}): void {
    try {
      ProductAnalytics.track({
        event_type: 'modal_open',
        product_id: productId,
        source: options.source,
        event_data: {
          trigger_source: options.triggerSource,
        }
      });
    } catch (error) {
      console.warn('Analytics tracking failed for modal open:', error);
    }
  }

  /**
   * Track modal close
   */
  static trackModalClose(productId: string, durationSeconds: number, options: {
    source?: string;
  } = {}): void {
    try {
      ProductAnalytics.track({
        event_type: 'modal_close',
        product_id: productId,
        source: options.source,
        event_data: {
          duration_seconds: durationSeconds,
        }
      });
    } catch (error) {
      console.warn('Analytics tracking failed for modal close:', error);
    }
  }

  /**
   * Track carousel interaction
   */
  static trackCarouselInteraction(action: 'next' | 'prev' | 'pause' | 'resume' | 'autoplay_stop', section: string, options: {
    slideIndex?: number;
    source?: string;
  } = {}): void {
    try {
      ProductAnalytics.track({
        event_type: 'carousel_interaction',
        event_data: {
          action,
          section,
          slide_index: options.slideIndex,
        },
        source: options.source || section,
      } as CarouselInteractionEvent);
    } catch (error) {
      console.warn('Analytics tracking failed for carousel interaction:', error);
    }
  }

  /**
   * Track product click
   */
  static trackProductClick(productId: string, clickTarget: 'image' | 'title' | 'price' | 'card', options: {
    position?: number;
    source?: string;
  } = {}): void {
    try {
      ProductAnalytics.track({
        event_type: 'product_click',
        product_id: productId,
        source: options.source,
        event_data: {
          click_target: clickTarget,
          position: options.position,
        }
      });
    } catch (error) {
      console.warn('Analytics tracking failed for product click:', error);
    }
  }

  /**
   * Flush all pending events immediately
   */
  static async flush(): Promise<void> {
    if (this.batchQueue.length > 0) {
      await this.processBatch();
    }
  }

  /**
   * Enable/disable analytics tracking
   */
  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.batchQueue = [];
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
        this.batchTimeout = null;
      }
    }
  }

  // Private methods
  private static async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const events = [...this.batchQueue];
    this.batchQueue = [];

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('Analytics batch failed (non-critical):', response.statusText, errorText);

        // If it's an RLS error, suggest running the setup script
        if (errorText.includes('row-level security') || errorText.includes('42501')) {
          console.warn('Analytics RLS error detected. Please run setup_analytics_rls.sql in Supabase SQL Editor.');
        }
      } else {
        // Success - optionally log for debugging
        // console.log(`Analytics: Successfully tracked ${events.length} events`);
      }
    } catch (error) {
      console.warn('Analytics batch error (non-critical):', error);
      // Don't throw error - analytics failures shouldn't break the app
    }
  }

  private static startBatchTimer(): void {
    if (this.batchTimeout) return;

    this.batchTimeout = setTimeout(async () => {
      await this.processBatch();
    }, this.BATCH_DELAY);
  }

  private static detectSource(): string {
    if (typeof window === 'undefined') return 'server';

    const path = window.location.pathname;
    if (path === '/') return 'home_page';
    if (path.startsWith('/product/')) return 'product_page';
    if (path.startsWith('/shop')) return 'shop_page';
    if (path.startsWith('/category/')) return 'category_page';

    return 'unknown';
  }
}

// Export the main analytics interface
export default ProductAnalytics;

// Export session manager for advanced use cases
export { SessionManager };

// Utility function for React components
export const useAnalytics = () => {
  return {
    trackProductView: ProductAnalytics.trackProductView,
    trackAddToCartClick: ProductAnalytics.trackAddToCartClick,
    trackOptionSelect: ProductAnalytics.trackOptionSelect,
    trackModalOpen: ProductAnalytics.trackModalOpen,
    trackModalClose: ProductAnalytics.trackModalClose,
    trackCarouselInteraction: ProductAnalytics.trackCarouselInteraction,
    trackProductClick: ProductAnalytics.trackProductClick,
    flush: ProductAnalytics.flush,
  };
};
