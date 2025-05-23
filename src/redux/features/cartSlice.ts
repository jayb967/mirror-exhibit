

import { toast } from "react-toastify";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getLocalStorage, setLocalStorage } from "@/utils/localstorage";
import { createClient } from '@supabase/supabase-js';

interface Product {
  id: string;
  title: string;
  quantity: number;
  price: number;
  image?: string;
  size?: string;
  size_name?: string;
  frame_type?: string;
  frame_name?: string;
  variation_id?: string;
  product_id?: string;
}
interface CartState {
  cart: Product[];
  orderQuantity: number;
  isLoading: boolean;
  isSyncing: boolean;
  appliedCoupon: any | null;
  discount: number;
}

const initialState: CartState = {
  cart: [],
  orderQuantity: 1,
  isLoading: false,
  isSyncing: false,
  appliedCoupon: null,
  discount: 0,
};

// Helper function to get guest token
const getGuestToken = (): string => {
  if (typeof window === 'undefined') return '';
  let guestToken = localStorage.getItem('guest_token');
  if (!guestToken) {
    guestToken = 'guest_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('guest_token', guestToken);
  }
  return guestToken;
};

// Helper function to ensure anonymous user is signed in (Clerk version)
const ensureAnonymousUser = async (): Promise<any> => {
  try {
    // For Clerk, we'll create a pseudo-anonymous user using guest token
    const guestToken = getGuestToken();

    // Create a pseudo-user ID for guest cart functionality
    const anonymousUserId = `guest_${guestToken}`;

    // Store in session storage for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('anonymous_user_id', anonymousUserId);
    }

    // Guest user functionality is now handled by cart_tracking table
    // No need for separate database function calls
    console.log('Anonymous user initialized for cart tracking:', anonymousUserId);

    return { id: anonymousUserId, is_anonymous: true };
  } catch (error) {
    console.log('Anonymous user setup failed (non-critical):', error);
    return null;
  }
};

// Async thunk for adding to cart with immediate UI response and background database sync
export const addToCartWithAuth = createAsyncThunk(
  'cart/addToCartWithAuth',
  async (product: Product & { silent?: boolean }, { dispatch }) => {
    try {
      // 1. IMMEDIATE: Add to local cart first for instant UI response
      dispatch(addToCart({ ...product, silent: false })); // Show toast from Redux

      // 2. BACKGROUND: Handle database operations asynchronously
      // Import cart service dynamically to avoid circular imports
      const { cartService } = await import('@/services/cartService');

      // Ensure anonymous user is signed in (background)
      ensureAnonymousUser().then(async () => {
        try {
          // Always use product_id for cart service operations (not variation_id)
          const productId = product.product_id || product.id;

          // Add to database in background (silent mode to prevent duplicate toasts)
          await cartService.addToCart(
            productId,
            product.quantity || 1,
            {
              variation_id: product.variation_id,
              frame_type: product.frame_type,
              frame_name: product.frame_name,
              size: product.size,
              size_name: product.size_name,
              price: product.price
            },
            true // silent mode - no toasts from cart service
          );

          // Also track cart activity for guest users
          const { cartTrackingService } = await import('@/services/cartTrackingService');
          const currentCart = await cartService.getCart();

          // Track cart activity (this will work for both guest and authenticated users)
          await cartTrackingService.trackCartActivity(
            currentCart.map(item => ({
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.product?.price || item.product?.base_price || product.price || 0,
              title: item.product?.name || product.title || 'Product',
              image: item.product?.image_url || item.product?.image || product.image,
              size_name: (item as any).size_name,
              frame_name: (item as any).frame_name,
              variation_id: (item as any).variation_id
            })),
            undefined, // email
            false, // checkout_started
            false, // checkout_completed
            undefined // userId (will use guest token)
          );
        } catch (dbError) {
          console.log('Background database sync failed, item already in local cart:', dbError);
          // Don't show error to user since item is already in cart locally
        }
      }).catch(authError => {
        console.log('Background auth failed, item already in local cart:', authError);
        // Don't show error to user since item is already in cart locally
      });

      return product;
    } catch (error) {
      console.error('Error in addToCartWithAuth:', error);
      // Fallback to regular add to cart (local storage only)
      dispatch(addToCart(product));
      return product;
    }
  }
);

// Async thunk for syncing cart with database using cart_tracking table (no validation)
export const syncCartWithDatabase = createAsyncThunk(
  'cart/syncWithDatabase',
  async (_, { getState }) => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Test database connection first
      const { error: connectionError } = await supabase.from('cart_tracking').select('id').limit(1);
      if (connectionError) {
        // Silently skip cart sync if table doesn't exist - this is expected during development
        if (connectionError.code === '42P01' || connectionError.message?.includes('does not exist')) {
          // Table doesn't exist yet, skip sync silently
          return null;
        }
        console.log('Database not available for cart sync (non-critical):', connectionError.message);
        return null; // Return null to indicate no sync occurred
      }

      // For Clerk, we'll handle user authentication at the component level
      // In Redux, we'll primarily work with guest tokens
      const state = getState() as { cart: CartState };
      const localCart = state.cart.cart;

      // Skip sync if cart is empty
      if (localCart.length === 0) {
        return null;
      }

      // Prepare cart items for tracking (no validation, just sync)
      const cartItems = localCart.map(item => ({
        product_id: item.product_id || item.id,
        quantity: Math.max(1, item.quantity),
        price: item.price,
        title: item.title,
        image: item.image,
        size_name: item.size_name,
        frame_name: item.frame_name,
        variation_id: item.variation_id
      }));

      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // For now, always treat as guest user since we're in Redux
      // TODO: Implement proper Clerk user detection in Redux
      const guestToken = getGuestToken();

      // Try to update existing record first, then insert if not found
      const { data: existingRecord } = await supabase
        .from('cart_tracking')
        .select('id')
        .eq('guest_token', guestToken)
        .single();

      if (existingRecord) {
        // Update existing record
        await supabase
          .from('cart_tracking')
          .update({
            cart_items: cartItems,
            subtotal: subtotal,
            last_activity: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('guest_token', guestToken);
      } else {
        // Insert new record
        await supabase
          .from('cart_tracking')
          .insert({
            guest_token: guestToken,
            cart_items: cartItems,
            subtotal: subtotal,
            last_activity: new Date().toISOString(),
            checkout_started: false,
            checkout_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }

      return null; // No cart changes needed
    } catch (error) {
      console.warn('Cart sync failed, continuing with local storage:', error);
      return null; // Don't break the app if sync fails
    }
  }
);

// Async thunk for loading cart from database after login (with validation)
export const loadCartFromDatabase = createAsyncThunk(
  'cart/loadFromDatabase',
  async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Test database connection first
      const { error: connectionError } = await supabase.from('cart_tracking').select('id').limit(1);
      if (connectionError) {
        // Silently skip cart load if table doesn't exist - this is expected during development
        if (connectionError.code === '42P01' || connectionError.message?.includes('does not exist')) {
          // Table doesn't exist yet, return empty array silently
          return [];
        }
        console.log('Database not available for cart load (non-critical):', connectionError.message);
        return []; // Return empty array if database not available
      }

      // For Clerk, we'll handle user authentication differently
      // For now, return empty cart since we're focusing on guest functionality
      // TODO: Implement proper Clerk user detection for cart loading
      return [];
    } catch (error) {
      console.warn('Error loading cart from database, continuing with local storage:', error);
      return []; // Return empty array instead of rejecting
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, { payload }: PayloadAction<Product & { silent?: boolean }>) => {
      // Create a unique identifier that includes product ID and variation details
      const createUniqueKey = (item: Product) => {
        if (item.variation_id) {
          return item.variation_id;
        }
        // For items without variation_id, create unique key from product + size + frame
        // Use frame_type and size as fallbacks if frame_name and size_name are not available
        const sizeKey = item.size_name || item.size || 'no-size';
        const frameKey = item.frame_name || item.frame_type || 'no-frame';
        return `${item.product_id || item.id}-${sizeKey}-${frameKey}`;
      };

      const uniqueKey = createUniqueKey(payload);

      // Find the product by its unique key
      const productIndex = state.cart.findIndex((item) => {
        const itemKey = createUniqueKey(item);
        return itemKey === uniqueKey;
      });

      if (productIndex >= 0) {
        // If the product is already in the cart, increase its quantity
        state.cart[productIndex].quantity += payload.quantity || 1;

        // Only show toast if not silent
        if (!payload.silent) {
          toast.info(`${payload.title} Increase Product Quantity`, {
            position: "top-center",
          });
        }
      }
      else {
        // Make sure quantity is at least 1
        const tempProduct = {
          ...payload,
          quantity: payload.quantity || 1,
          // Store unique key for reference
          id: uniqueKey,
          variation_id: payload.variation_id,
          product_id: payload.product_id || payload.id
        };
        state.cart.push(tempProduct);

        // Only show toast if not silent
        if (!payload.silent) {
          // Show variation details in toast if available
          let toastMessage = `${payload.title} added to cart`;
          if (payload.size_name || payload.frame_name) {
            toastMessage += ` (${[
              payload.size_name ? `Size: ${payload.size_name}` : '',
              payload.frame_name ? `Frame: ${payload.frame_name}` : ''
            ].filter(Boolean).join(', ')})`;
          }

          toast.success(toastMessage, {
            position: "top-center",
          });
        }
      }
      setLocalStorage("cart", state.cart);
      // Note: Database sync will be triggered by middleware
    },
    // Load cart from service (used by async thunks)
    loadCartFromService: (state, { payload }: PayloadAction<any[]>) => {
      // Convert cart service format to Redux format
      state.cart = payload.map(item => ({
        id: item.product_id,
        product_id: item.product_id,
        title: item.product?.name || 'Product',
        quantity: item.quantity,
        price: item.product?.price || item.product?.base_price || 0,
        image: item.product?.image_url || item.product?.image,
        size_name: item.size_name,
        frame_name: item.frame_name,
        variation_id: item.variation_id || item.product_variation_id
      }));
      setLocalStorage("cart", state.cart);
    },
    //
    increment: (state) => {
      state.orderQuantity = state.orderQuantity + 1;
    },
    decrement: (state) => {
      state.orderQuantity =
        state.orderQuantity > 1
          ? state.orderQuantity - 1
          : (state.orderQuantity = 1);
    },
    //

    decrease_quantity: (state, { payload }: PayloadAction<Product & { silent?: boolean }>) => {
      // Use variation_id or id as the unique identifier
      const uniqueId = payload.variation_id || payload.id;

      // Find the product by its unique ID
      const cartIndex = state.cart.findIndex((item) =>
        (item.variation_id && item.variation_id === uniqueId) ||
        (!item.variation_id && item.id === uniqueId)
      );

      if (cartIndex >= 0 && state.cart[cartIndex].quantity > 1) {
        state.cart[cartIndex].quantity -= 1;

        // Only show toast if not silent and we have a valid title
        if (!payload.silent && payload.title) {
          // Show variation details in toast if available
          let toastMessage = `${payload.title} quantity decreased`;
          if (payload.size_name || payload.frame_name) {
            toastMessage += ` (${[
              payload.size_name ? `Size: ${payload.size_name}` : '',
              payload.frame_name ? `Frame: ${payload.frame_name}` : ''
            ].filter(Boolean).join(', ')})`;
          }

          toast.error(toastMessage, {
            position: "top-center",
          });
        }
      }
      setLocalStorage("cart", state.cart);
    },
    remove_cart_product: (state, { payload }: PayloadAction<Product>) => {
      // Create a unique identifier that includes product ID and variation details
      const createUniqueKey = (item: Product) => {
        if (item.variation_id) {
          return item.variation_id;
        }
        // For items without variation_id, create unique key from product + size + frame
        // Use frame_type and size as fallbacks if frame_name and size_name are not available
        const sizeKey = item.size_name || item.size || 'no-size';
        const frameKey = item.frame_name || item.frame_type || 'no-frame';
        return `${item.product_id || item.id}-${sizeKey}-${frameKey}`;
      };

      const uniqueKey = createUniqueKey(payload);

      // Filter out the product by its unique key
      state.cart = state.cart.filter((item) => {
        const itemKey = createUniqueKey(item);
        return itemKey !== uniqueKey;
      });

      // Show variation details in toast if available
      let toastMessage = `${payload.title} removed from cart`;
      if (payload.size_name || payload.frame_name) {
        toastMessage += ` (${[
          payload.size_name ? `Size: ${payload.size_name}` : '',
          payload.frame_name ? `Frame: ${payload.frame_name}` : ''
        ].filter(Boolean).join(', ')})`;
      }

      toast.error(toastMessage, {
        position: "top-center",
      });
      setLocalStorage("cart", state.cart);
    },
    clear_cart: (state) => {
      // Only show confirm dialog on client side
      if (typeof window !== 'undefined') {
        const confirmMsg = window.confirm("Are you sure you want to delete your bag?");
        if (confirmMsg) {
          state.cart = [];
          setLocalStorage("cart", state.cart);
        }
      } else {
        // Server-side rendering path
        state.cart = [];
      }
    },
    get_cart_products: (state) => {
      state.cart = getLocalStorage<Product>("cart");
      // Also load coupon data from localStorage
      if (typeof window !== 'undefined') {
        const savedCoupon = localStorage.getItem("appliedCoupon");
        const savedDiscount = localStorage.getItem("discount");
        if (savedCoupon) {
          try {
            state.appliedCoupon = JSON.parse(savedCoupon);
            state.discount = savedDiscount ? parseFloat(savedDiscount) : 0;
          } catch (error) {
            console.warn('Error parsing saved coupon data:', error);
          }
        }
      }
    },
    apply_coupon: (state, { payload }: PayloadAction<{ coupon: any; discount: number }>) => {
      state.appliedCoupon = payload.coupon;
      state.discount = payload.discount;
      if (typeof window !== 'undefined') {
        localStorage.setItem("appliedCoupon", JSON.stringify(payload.coupon));
        localStorage.setItem("discount", payload.discount.toString());
      }
    },
    remove_coupon: (state) => {
      state.appliedCoupon = null;
      state.discount = 0;
      if (typeof window !== 'undefined') {
        localStorage.removeItem("appliedCoupon");
        localStorage.removeItem("discount");
      }
    },
    quantityDecrement: (state, { payload }: PayloadAction<Product>) => {
      // Create a unique identifier that includes product ID and variation details
      const createUniqueKey = (item: Product) => {
        if (item.variation_id) {
          return item.variation_id;
        }
        // For items without variation_id, create unique key from product + size + frame
        // Use frame_type and size as fallbacks if frame_name and size_name are not available
        const sizeKey = item.size_name || item.size || 'no-size';
        const frameKey = item.frame_name || item.frame_type || 'no-frame';
        return `${item.product_id || item.id}-${sizeKey}-${frameKey}`;
      };

      const uniqueKey = createUniqueKey(payload);

      state.cart = state.cart.map((item) => {
        const itemKey = createUniqueKey(item);
        if (itemKey === uniqueKey && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });
      setLocalStorage("cart", state.cart);
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle addToCartWithAuth
      .addCase(addToCartWithAuth.pending, () => {
        // Optional: show loading state
      })
      .addCase(addToCartWithAuth.fulfilled, () => {
        // Cart is already updated by the loadCartFromService action
      })
      .addCase(addToCartWithAuth.rejected, (_, action) => {
        console.error('Add to cart with auth failed:', action.error);
      })
      // Handle syncCartWithDatabase
      .addCase(syncCartWithDatabase.pending, (state) => {
        state.isSyncing = true;
      })
      .addCase(syncCartWithDatabase.fulfilled, (state) => {
        state.isSyncing = false;
        // Sync doesn't modify cart anymore, just syncs to database
      })
      .addCase(syncCartWithDatabase.rejected, (state, action) => {
        state.isSyncing = false;
        console.error('Cart sync failed:', action.payload);
      })
      // Handle loadCartFromDatabase
      .addCase(loadCartFromDatabase.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadCartFromDatabase.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        setLocalStorage("cart", state.cart);

        if (action.payload.length > 0) {
          toast.success(`Cart loaded with ${action.payload.length} item${action.payload.length > 1 ? 's' : ''}`, {
            position: "top-center",
          });
        }
      })
      .addCase(loadCartFromDatabase.rejected, (state, action) => {
        state.isLoading = false;
        console.error('Failed to load cart from database:', action.payload);
      });
  },
});

export const {
  addToCart,
  decrease_quantity,
  remove_cart_product,
  clear_cart,
  get_cart_products,
  quantityDecrement,
  increment,
  decrement,
  apply_coupon,
  remove_coupon,
  loadCartFromService,
} = cartSlice.actions;

// Async thunks are already exported above where they're defined

export default cartSlice.reducer;


