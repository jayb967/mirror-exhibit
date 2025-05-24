import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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
  private supabase = createClientComponentClient();

  /**
   * Get the current user from Supabase
   * @returns The current user or null if not authenticated
   */
  private async getCurrentUser() {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }

  /**
   * Get or create a guest token
   * @returns The guest token
   */
  private getGuestToken(): string {
    if (typeof window === 'undefined') return '';

    let guestToken = localStorage.getItem(GUEST_TOKEN_KEY);
    if (!guestToken) {
      guestToken = uuidv4();
      localStorage.setItem(GUEST_TOKEN_KEY, guestToken);
    }
    return guestToken;
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
      const guestToken = this.getGuestToken();

      const { data, error } = await this.supabase
        .from('guest_users')
        .upsert({
          ...guestData,
          guest_token: guestToken
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating guest user:', error);
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
    try {
      const guestToken = this.getGuestToken();
      if (!guestToken) return null;

      // If we've already checked and failed, don't try again during this session
      if (this.guestUserChecked) {
        return null;
      }

      // Mark that we've checked to prevent repeated calls
      this.guestUserChecked = true;

      try {
        // Use a simpler query that's less likely to cause errors
        const { data, error } = await this.supabase
          .from('guest_users')
          .select('id')
          .limit(1);

        // If there's an error with this simple query, the table likely doesn't exist
        // or there's a permissions issue
        if (error) {
          console.log('Unable to access guest_users table:', error.message);
          return null;
        }

        // Now try to get the specific guest user
        // Only do this if the first query succeeded
        const { data: userData, error: userError } = await this.supabase
          .from('guest_users')
          .select('*')
          .eq('guest_token', guestToken)
          .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no record is found

        if (userError) {
          console.log('Error fetching guest user:', userError.message);
          return null;
        }

        return userData || null;
      } catch (error: any) {
        console.log('Error in guest user fetch:', error.message);
        return null;
      }
    } catch (error) {
      console.error('Error getting guest user:', error);
      return null;
    }
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

      // Check if we have a guest user with cart in database
      const guestToken = this.getGuestToken();
      const guestUser = await this.getGuestUser();

      if (guestUser) {
        try {
          // Try to get guest cart from database
          const { data, error } = await this.supabase
            .from('guest_cart_items')
            .select(`
              *,
              product:product_id (
                id,
                name,
                base_price,
                image_url
              )
            `)
            .eq('guest_token', guestToken);

          if (error) {
            // Handle case where the table doesn't exist yet
            if (error.code === '42P01') {
              console.log('Guest cart items table does not exist yet. This is expected if guest checkout is not fully set up.');
            } else {
              console.error('Error fetching guest cart from database:', error);
            }
          } else if (data && data.length > 0) {
            // Map the data to ensure price compatibility
            return data.map(item => ({
              ...item,
              product: item.product ? {
                ...item.product,
                price: item.product.base_price // Map base_price to price for compatibility
              } : undefined
            }));
          }
        } catch (dbError: any) {
          // Handle case where the table doesn't exist yet
          if (dbError.code === '42P01' || dbError.message?.includes('does not exist')) {
            console.log('Guest cart items table does not exist yet. This is expected if guest checkout is not fully set up.');
          } else {
            console.error('Error fetching guest cart from database:', dbError);
          }
        }
      }

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
   * @returns Promise resolving to updated cart
   */
  async addToCart(productId: string, quantity: number = 1, variationData?: any): Promise<CartItem[]> {
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
        toast.error('Product not found');
        return this.getCart();
      }

      // Check if the current cart already has this product
      const currentCart = await this.getCart();
      const existingItem = currentCart.find(item => item.product_id === productId);
      const currentQuantity = existingItem ? existingItem.quantity : 0;

      // Validate stock with the stock service
      const { hasStock, availableStock, errorMessage } = await stockService.checkCartItemStock(
        productId,
        currentQuantity,
        quantity
      );

      if (!hasStock) {
        toast.error(errorMessage || `Only ${availableStock} items available`);
        return this.getCart();
      }

      const user = await this.getCurrentUser();

      // If user is authenticated, add to Supabase
      if (user) {
        await this.supabase.rpc('add_to_cart', {
          p_user_id: user.id,
          p_product_id: productId,
          p_quantity: quantity
        });

        toast.success(`${product.name} added to cart`);
        return this.getCart();
      }

      // Check if we have a guest user
      const guestUser = await this.getGuestUser();
      const guestToken = this.getGuestToken();

      if (guestUser) {
        try {
          // Add to guest cart in database
          await this.supabase.rpc('add_to_guest_cart', {
            p_guest_token: guestToken,
            p_product_id: productId,
            p_quantity: quantity
          });

          toast.success(`${product.name} added to cart`);
          return this.getCart();
        } catch (error: any) {
          // If the function doesn't exist yet, fall back to local storage
          if (error.code === '42883' || error.message?.includes('function') || error.message?.includes('does not exist')) {
            console.log('Guest cart functions not set up yet. Using local storage instead.');
            // Continue to local storage fallback below
          } else {
            throw error;
          }
        }
      }

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
        toast.info(`Increased quantity for ${product.name}`);
      } else {
        const cartItem: any = {
          product_id: productId,
          quantity,
          product,
          ...variationData // Include variation data (size_name, frame_name, variation_id, etc.)
        };

        localCart.push(cartItem);

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

      this.saveLocalCart(localCart);
      return localCart;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
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

      // Get current cart to check if we're increasing or decreasing quantity
      const currentCart = await this.getCart();
      // Find item by variation_id if it exists, otherwise by product_id
      const existingItem = currentCart.find(item => {
        const cartItemId = (item as any).variation_id || item.product_id;
        return cartItemId === itemId;
      });
      const currentQuantity = existingItem ? existingItem.quantity : 0;

      // Get the actual product_id for stock validation
      const productId = existingItem?.product_id || itemId;

      // Only validate stock if we're increasing quantity
      // This prevents "Product not found" errors when just decreasing quantity
      if (quantity > currentQuantity) {
        // Validate stock with the stock service
        const { hasStock, availableStock, allowedQuantity, errorMessage } = await stockService.checkCartItemStock(
          productId,
          0,
          quantity
        );

        if (!hasStock) {
          // Only show error if it's not a "Product not found" error when decreasing
          if (!errorMessage?.includes('Product not found')) {
            toast.warning(errorMessage || `Only ${availableStock} items available`);
          }

          // If there's some stock available, update to the maximum available quantity
          if (availableStock > 0) {
            quantity = allowedQuantity;
            toast.info(`Quantity adjusted to ${quantity}`);
          } else {
            return this.getCart();
          }
        }
      }

      const user = await this.getCurrentUser();

      // If user is authenticated, update in Supabase
      if (user) {
        await this.supabase.rpc('update_cart_quantity', {
          p_user_id: user.id,
          p_product_id: productId,
          p_quantity: quantity
        });

        return this.getCart();
      }

      // Check if we have a guest user
      const guestUser = await this.getGuestUser();
      const guestToken = this.getGuestToken();

      if (guestUser) {
        try {
          // Update guest cart in database
          await this.supabase.rpc('update_guest_cart_quantity', {
            p_guest_token: guestToken,
            p_product_id: productId,
            p_quantity: quantity
          });

          return this.getCart();
        } catch (error: any) {
          // If the function doesn't exist yet, fall back to local storage
          if (error.code === '42883' || error.message?.includes('function') || error.message?.includes('does not exist')) {
            console.log('Guest cart functions not set up yet. Using local storage instead.');
            // Continue to local storage fallback below
          } else {
            throw error;
          }
        }
      }

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
        await this.supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', itemId);

        toast.info('Item removed from cart');
        return this.getCart();
      }

      // Check if we have a guest user
      const guestUser = await this.getGuestUser();
      const guestToken = this.getGuestToken();

      if (guestUser) {
        try {
          // Remove from guest cart in database
          await this.supabase
            .from('guest_cart_items')
            .delete()
            .eq('guest_token', guestToken)
            .eq('product_id', itemId);

          toast.info('Item removed from cart');
          return this.getCart();
        } catch (error: any) {
          // If the table doesn't exist yet, fall back to local storage
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            console.log('Guest cart items table does not exist yet. Using local storage instead.');
            // Continue to local storage fallback below
          } else {
            throw error;
          }
        }
      }

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
        await this.supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
      }

      // Check if we have a guest user
      const guestUser = await this.getGuestUser();
      const guestToken = this.getGuestToken();

      if (guestUser) {
        try {
          // Clear guest cart in database
          await this.supabase
            .from('guest_cart_items')
            .delete()
            .eq('guest_token', guestToken);
        } catch (error: any) {
          // If the table doesn't exist yet, just continue
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            console.log('Guest cart items table does not exist yet. Skipping database clear.');
          } else {
            console.error('Error clearing guest cart:', error);
          }
        }
      }

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

      // Check if we have a guest user
      const guestUser = await this.getGuestUser();
      const guestToken = this.getGuestToken();

      if (guestUser) {
        try {
          // Convert guest user to registered user
          await this.supabase.rpc('convert_guest_to_user', {
            p_guest_token: guestToken,
            p_user_id: user.id
          });

          // Clear guest token from local storage
          if (typeof window !== 'undefined') {
            localStorage.removeItem(GUEST_TOKEN_KEY);
          }

          toast.success('Guest cart transferred to your account');
          return this.getCart();
        } catch (error: any) {
          // If the function doesn't exist yet, just continue with local cart sync
          if (error.code === '42883' || error.message?.includes('function') || error.message?.includes('does not exist')) {
            console.log('Guest to user conversion function not set up yet. Proceeding with local cart sync.');
            // Continue to local cart sync below
          } else {
            console.error('Error converting guest to user:', error);
            // Continue to local cart sync as fallback
          }
        }
      }

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
   * Convert guest to registered user
   * @param userId User ID
   * @returns Promise resolving to success status
   */
  async convertGuestToUser(userId: string): Promise<boolean> {
    try {
      const guestToken = this.getGuestToken();
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
