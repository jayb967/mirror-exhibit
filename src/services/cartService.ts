import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { stockService } from './stockService';

// Cache to prevent repeated API calls for non-existent tables
const tableExistenceCache: Record<string, boolean> = {};

// Types
export interface CartItem {
  id?: string;
  product_id: string;
  quantity: number;
  product?: Product;
  user_id?: string;
  guest_token?: string;
}

export interface Product {
  id: string;
  name: string;
  title?: string; // For compatibility with existing code
  price?: number; // Make price optional since we'll map from base_price
  base_price: number; // The actual column in the database
  image_url?: string;
  image?: string; // For compatibility with existing code
  stock_quantity?: number; // Optional since it might not exist in the database
}

export interface GuestUser {
  id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  apartment?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  guest_token: string;
}

// Local storage keys
const CART_STORAGE_KEY = 'cart';
const GUEST_TOKEN_KEY = 'guest_token';

/**
 * Cart Service - Handles cart operations with Supabase and local storage
 * Uses Supabase for authenticated users and local storage for guests
 */
class CartService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /**
   * Get the current user from Clerk (via window.Clerk if available)
   * @returns The current user or null if not authenticated
   */
  private async getCurrentUser() {
    // For Clerk, we need to check if the user is authenticated differently
    // Since this is a service class, we'll check for Clerk on the window object
    if (typeof window !== 'undefined' && (window as any).Clerk) {
      const clerk = (window as any).Clerk;
      return clerk.user ? {
        id: clerk.user.id,
        email: clerk.user.emailAddresses[0]?.emailAddress || '',
      } : null;
    }
    return null;
  }

  /**
   * Get or create a guest token (private method)
   * @returns The guest token
   */
  private getGuestTokenPrivate(): string {
    if (typeof window === 'undefined') return '';

    let guestToken = localStorage.getItem(GUEST_TOKEN_KEY);
    if (!guestToken) {
      guestToken = uuidv4();
      localStorage.setItem(GUEST_TOKEN_KEY, guestToken);
    }
    return guestToken;
  }

  /**
   * Public method to get guest token for external use
   * @returns The guest token
   */
  getGuestToken(): string {
    return this.getGuestTokenPrivate();
  }



  /**
   * Get cart items from local storage
   * @returns Array of cart items
   */
  private getLocalCart(): CartItem[] {
    if (typeof window === 'undefined') return [];

    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    if (cartData) {
      try {
        return JSON.parse(cartData);
      } catch (error) {
        console.error('Error parsing cart data from localStorage:', error);
        return [];
      }
    }
    return [];
  }

  /**
   * Save cart items to local storage
   * @param items Cart items to save
   */
  private saveLocalCart(items: CartItem[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }

  /**
   * Create a guest user in the database
   * @param guestData Guest user data
   * @returns The created guest user
   */
  async createGuestUser(guestData: Partial<GuestUser>): Promise<GuestUser | null> {
    try {
      const guestToken = this.getGuestTokenPrivate();

      // Try to update existing record first, then insert if not found
      const { data: existingRecord } = await this.supabase
        .from('guest_users')
        .select('id')
        .eq('guest_token', guestToken)
        .single();

      let data, error;
      if (existingRecord) {
        // Update existing record
        const result = await this.supabase
          .from('guest_users')
          .update({
            ...guestData,
            updated_at: new Date().toISOString()
          })
          .eq('guest_token', guestToken)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        // Insert new record
        const result = await this.supabase
          .from('guest_users')
          .insert({
            ...guestData,
            guest_token: guestToken,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating guest user:', error);
      return null;
    }
  }

  /**
   * Update guest user in the database
   * @param guestData Guest user data to update
   * @returns The updated guest user
   */
  async updateGuestUser(guestData: Partial<GuestUser>): Promise<GuestUser | null> {
    try {
      const guestToken = this.getGuestTokenPrivate();

      // Try to update existing record first, then insert if not found
      const { data: existingRecord } = await this.supabase
        .from('guest_users')
        .select('id')
        .eq('guest_token', guestToken)
        .single();

      let data, error;
      if (existingRecord) {
        // Update existing record
        const result = await this.supabase
          .from('guest_users')
          .update({
            ...guestData,
            updated_at: new Date().toISOString()
          })
          .eq('guest_token', guestToken)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        // Insert new record
        const result = await this.supabase
          .from('guest_users')
          .insert({
            ...guestData,
            guest_token: guestToken,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating guest user:', error);
      return null;
    }
  }

  /**
   * Get guest user from database
   * @returns The guest user or null if not found
   */
  // Cache to prevent repeated API calls for guest user checks
  private guestUserChecked = false;

  async getGuestUser(): Promise<GuestUser | null> {
    // Guest users table was removed in favor of cart_tracking
    // Return null to indicate no guest user database record
    return null;
  }

  /**
   * Get cart items
   * @returns Promise resolving to cart items with product details
   */
  async getCart(): Promise<CartItem[]> {
    try {
      const user = await this.getCurrentUser();

      // If user is authenticated, get cart from Supabase
      if (user) {
        const { data, error } = await this.supabase
          .from('cart_items')
          .select(`
            *,
            product:product_id (
              id,
              name,
              base_price,
              image_url
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;

        // Map the data to ensure price compatibility
        return (data || []).map(item => ({
          ...item,
          product: item.product ? {
            ...item.product,
            price: item.product.base_price // Map base_price to price for compatibility
          } : undefined
        }));
      }

      // Guest users table was removed - skip database guest cart lookup
      // All guest cart functionality now uses local storage only

      // Otherwise, get cart from local storage
      const localCart = this.getLocalCart();

      // If local cart has items, fetch product details
      if (localCart.length > 0) {
        const productIds = localCart.map(item => item.product_id).filter(id => id); // Filter out any undefined IDs

        // If no valid product IDs, return the local cart as is
        if (!productIds.length) {
          console.log('No valid product IDs in cart');
          return localCart;
        }

        try {
          const { data: products, error } = await this.supabase
            .from('products')
            .select('id, name, base_price, image_url')
            .in('id', productIds);

          if (error) {
            console.warn('Error fetching product details:', error);
            return localCart; // Return local cart without product details
          }

          // Merge product details with cart items and ensure price compatibility
          return localCart.map(item => {
            const product = products?.find(p => p.id === item.product_id);
            return {
              ...item,
              product: product ? {
                ...product,
                price: product.base_price // Map base_price to price for compatibility
              } : undefined
            };
          });
        } catch (err) {
          console.warn('Error in product fetch:', err);
          return localCart; // Return local cart without product details
        }
      }

      return localCart;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return this.getLocalCart();
    }
  }

  /**
   * Add item to cart
   * @param productId Product ID
   * @param quantity Quantity to add
   * @param variationData Optional variation data (size, frame, etc.)
   * @param silent Optional flag to suppress toast notifications
   * @returns Promise resolving to updated cart
   */
  async addToCart(productId: string, quantity: number = 1, variationData?: any, silent: boolean = false): Promise<CartItem[]> {
    try {
      // Get product details
      const { data: productData, error: productError } = await this.supabase
        .from('products')
        .select('id, name, base_price, image_url')
        .eq('id', productId)
        .single();

      // Create a product object with price compatibility
      const product = productData ? {
        ...productData,
        price: productData.base_price // Map base_price to price for compatibility
      } : null;

      if (productError || !product) {
        if (!silent) {
          toast.error('Product not found');
        }
        return this.getCart();
      }

      // Skip stock validation for made-to-order products
      // These products are manufactured on demand, so no inventory limits apply

      const user = await this.getCurrentUser();

      // If user is authenticated, add to Supabase
      if (user) {
        try {
          // First, try to find or create a product variation
          let variationId = variationData?.variation_id;

          if (!variationId) {
            // If no variation provided, try to find a default variation or create one
            const { data: variations, error: variationError } = await this.supabase
              .from('product_variations')
              .select('id')
              .eq('product_id', productId)
              .limit(1);

            if (!variationError && variations && variations.length > 0) {
              variationId = variations[0].id;
            } else {
              // Try the old schema function first
              try {
                await this.supabase.rpc('add_to_cart', {
                  p_user_id: user.id,
                  p_product_id: productId,
                  p_quantity: quantity
                });

                // Track cart activity
                await this.trackCartActivity(user.id);

                toast.success(`${product.name} added to cart`);
                return this.getCart();
              } catch (oldSchemaError: any) {
                console.log('Old schema add_to_cart failed, product variations may be required');
                throw new Error('Product variation required but not found');
              }
            }
          }

          if (variationId) {
            // Use the new schema function with product variations
            await this.supabase.rpc('add_to_cart', {
              p_user_id: user.id,
              p_product_variation_id: variationId,
              p_quantity: quantity
            });
          } else {
            throw new Error('No product variation available');
          }

          // Track cart activity
          await this.trackCartActivity(user.id);

          if (!silent) {
            toast.success(`${product.name} added to cart`);
          }
          return this.getCart();
        } catch (error: any) {
          console.error('Error adding to cart in database:', error);
          // Fall back to local storage if database fails
          if (!silent) {
            toast.warning('Added to cart locally. Please refresh to sync with server.');
          }
        }
      }

      // Guest users table was removed - skip database guest operations
      // All guest cart functionality now uses local storage only

      // Otherwise, add to local storage
      const localCart = this.getLocalCart();

      // Create unique identifier for variations
      const itemId = variationData?.variation_id || productId;
      const existingItemIndex = localCart.findIndex(item => {
        const cartItemId = (item as any).variation_id || item.product_id;
        return cartItemId === itemId;
      });

      if (existingItemIndex >= 0) {
        localCart[existingItemIndex].quantity += quantity;
        if (!silent) {
          toast.info(`Increased quantity for ${product.name}`);
        }
      } else {
        const cartItem: any = {
          product_id: productId,
          quantity,
          product,
          ...variationData // Include variation data (size_name, frame_name, variation_id, etc.)
        };

        localCart.push(cartItem);

        if (!silent) {
          // Show variation details in toast if available
          let toastMessage = `${product.name} added to cart`;
          if (variationData?.size_name || variationData?.frame_name) {
            toastMessage += ` (${[
              variationData.size_name ? `Size: ${variationData.size_name}` : '',
              variationData.frame_name ? `Frame: ${variationData.frame_name}` : ''
            ].filter(Boolean).join(', ')})`;
          }

          toast.success(toastMessage);
        }
      }

      this.saveLocalCart(localCart);
      return localCart;
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (!silent) {
        toast.error('Failed to add item to cart');
      }
      return this.getCart();
    }
  }

  /**
   * Update cart item quantity
   * @param itemId Product ID or Variation ID
   * @param quantity New quantity
   * @returns Promise resolving to updated cart
   */
  async updateQuantity(itemId: string, quantity: number): Promise<CartItem[]> {
    try {
      if (quantity < 0) {
        toast.error('Quantity cannot be negative');
        return this.getCart();
      }

      // If quantity is 0, just remove the item
      if (quantity === 0) {
        return this.removeFromCart(itemId);
      }

      // Skip stock validation for made-to-order products
      // These products are manufactured on demand, so no inventory limits apply

      // Get the actual product_id for database operations
      const currentCart = await this.getCart();
      const existingItem = currentCart.find(item => {
        const cartItemId = (item as any).variation_id || item.product_id;
        return cartItemId === itemId;
      });
      const productId = existingItem?.product_id || itemId;

      const user = await this.getCurrentUser();

      // If user is authenticated, update in Supabase
      if (user) {
        try {
          await this.supabase.rpc('update_cart_quantity', {
            p_user_id: user.id,
            p_product_id: productId,
            p_quantity: quantity
          });

          // Track cart activity
          await this.trackCartActivity(user.id);
        } catch (error: any) {
          console.error('Error updating cart in database:', error);
          // Continue with local storage fallback
        }

        return this.getCart();
      }

      // Guest users table was removed - skip database guest operations
      // All guest cart functionality now uses local storage only

      // Otherwise, update in local storage
      const localCart = this.getLocalCart();

      const updatedCart = localCart.map(item => {
        const cartItemId = (item as any).variation_id || item.product_id;
        if (cartItemId === itemId) {
          return { ...item, quantity };
        }
        return item;
      });

      this.saveLocalCart(updatedCart);

      // Return cart with product details by calling getCart()
      return this.getCart();
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      toast.error('Failed to update quantity');
      return this.getCart();
    }
  }

  /**
   * Remove item from cart
   * @param itemId Product ID or Variation ID to remove
   * @returns Promise resolving to updated cart
   */
  async removeFromCart(itemId: string): Promise<CartItem[]> {
    try {
      const user = await this.getCurrentUser();

      // If user is authenticated, remove from Supabase
      if (user) {
        try {
          await this.supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', itemId);

          // Track cart activity
          await this.trackCartActivity(user.id);

          toast.info('Item removed from cart');
        } catch (error: any) {
          console.error('Error removing from cart in database:', error);
          toast.error('Failed to remove item from cart');
        }

        return this.getCart();
      }

      // Guest users table was removed - skip database guest operations
      // All guest cart functionality now uses local storage only

      // Otherwise, remove from local storage
      const localCart = this.getLocalCart();
      const updatedCart = localCart.filter(item => {
        const cartItemId = (item as any).variation_id || item.product_id;
        return cartItemId !== itemId;
      });

      this.saveLocalCart(updatedCart);
      toast.info('Item removed from cart');
      return updatedCart;
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
      return this.getCart();
    }
  }

  /**
   * Clear the entire cart
   * @returns Promise resolving to empty cart
   */
  async clearCart(): Promise<CartItem[]> {
    try {
      const user = await this.getCurrentUser();

      // If user is authenticated, clear from Supabase
      if (user) {
        try {
          await this.supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id);

          // Track cart activity (empty cart)
          await this.trackCartActivity(user.id);
        } catch (error: any) {
          console.error('Error clearing cart in database:', error);
        }
      }

      // Guest users table was removed - skip database guest operations
      // All guest cart functionality now uses local storage only

      // Always clear local storage
      this.saveLocalCart([]);
      toast.info('Cart cleared');
      return [];
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
      return this.getCart();
    }
  }

  /**
   * Synchronize local cart with database after login
   * @returns Promise resolving to synchronized cart
   */
  async syncCartAfterLogin(): Promise<CartItem[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return this.getLocalCart();

      // Guest users table was removed - skip database guest operations
      // All guest cart functionality now uses local storage only

      // Otherwise, sync local cart
      const localCart = this.getLocalCart();
      if (localCart.length === 0) return this.getCart();

      // Add each local cart item to the database
      for (const item of localCart) {
        await this.supabase.rpc('add_to_cart', {
          p_user_id: user.id,
          p_product_id: item.product_id,
          p_quantity: item.quantity
        });
      }

      // Clear local storage after sync
      this.saveLocalCart([]);
      toast.success('Cart synchronized');

      return this.getCart();
    } catch (error) {
      console.error('Error synchronizing cart:', error);
      return this.getCart();
    }
  }

  /**
   * Track cart activity for analytics
   * Uses the cart tracking service with API endpoint to bypass RLS policies
   * @param userId User ID
   * @param email Optional email
   * @returns Promise resolving to success status
   */
  private async trackCartActivity(userId: string, email?: string): Promise<boolean> {
    try {
      const cartItems = await this.getCart();

      if (cartItems.length === 0) {
        return true; // No items to track
      }

      // Prepare cart items for tracking
      const trackingItems = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product?.price || item.product?.base_price || 0,
        title: item.product?.name || 'Product',
        image: item.product?.image_url || item.product?.image,
        size_name: (item as any).size_name,
        frame_name: (item as any).frame_name,
        variation_id: (item as any).variation_id || (item as any).product_variation_id
      }));

      // Use the cart tracking service instead of direct Supabase calls
      const { cartTrackingService } = await import('./cartTrackingService');

      return await cartTrackingService.trackCartActivity(
        trackingItems,
        email,
        false, // checkout_started
        false, // checkout_completed
        userId
      );
    } catch (error) {
      console.error('Error in cart tracking:', error);
      return false;
    }
  }

  /**
   * Convert guest to registered user
   * @param userId User ID
   * @returns Promise resolving to success status
   */
  async convertGuestToUser(userId: string): Promise<boolean> {
    try {
      const guestToken = this.getGuestTokenPrivate();
      if (!guestToken) return false;

      try {
        await this.supabase.rpc('convert_guest_to_user', {
          p_guest_token: guestToken,
          p_user_id: userId
        });
      } catch (error: any) {
        // If the function doesn't exist yet, handle gracefully
        if (error.code === '42883' || error.message?.includes('function') || error.message?.includes('does not exist')) {
          console.log('Guest to user conversion function not set up yet. Proceeding with local cart sync.');

          // Manually sync local cart as fallback
          const localCart = this.getLocalCart();
          if (localCart.length > 0) {
            for (const item of localCart) {
              await this.supabase.rpc('add_to_cart', {
                p_user_id: userId,
                p_product_id: item.product_id,
                p_quantity: item.quantity
              });
            }
            this.saveLocalCart([]);
          }
        } else {
          throw error;
        }
      }

      // Clear guest token from local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(GUEST_TOKEN_KEY);
      }

      return true;
    } catch (error) {
      console.error('Error converting guest to user:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const cartService = new CartService();
