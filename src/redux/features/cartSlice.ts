

import { toast } from "react-toastify";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getLocalStorage, setLocalStorage } from "@/utils/localstorage";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
}

const initialState: CartState = {
  cart: [],
  orderQuantity: 1,
  isLoading: false,
  isSyncing: false,
};

// Helper function to get guest token
const getGuestToken = (): string => {
  if (typeof window === 'undefined') return '';
  let guestToken = localStorage.getItem('guest_token');
  if (!guestToken) {
    guestToken = 'guest_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('guest_token', guestToken);
  }
  return guestToken;
};

// Async thunk for syncing cart with database using cart_tracking table (no validation)
export const syncCartWithDatabase = createAsyncThunk(
  'cart/syncWithDatabase',
  async (_, { getState }) => {
    try {
      const supabase = createClientComponentClient();

      // Test database connection first
      const { error: connectionError } = await supabase.from('cart_tracking').select('id').limit(1);
      if (connectionError) {
        console.warn('Database not available, skipping cart sync');
        return null; // Return null to indicate no sync occurred
      }

      const { data: { user } } = await supabase.auth.getUser();
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

      if (user) {
        // User is logged in - sync to cart_tracking table
        await supabase
          .from('cart_tracking')
          .upsert({
            user_id: user.id,
            email: user.email,
            cart_items: cartItems,
            subtotal: subtotal,
            last_activity: new Date().toISOString(),
            checkout_started: false,
            checkout_completed: false
          }, {
            onConflict: 'user_id'
          });
      } else {
        // Guest user - save to cart_tracking with guest_token
        const guestToken = getGuestToken();

        await supabase
          .from('cart_tracking')
          .upsert({
            guest_token: guestToken,
            cart_items: cartItems,
            subtotal: subtotal,
            last_activity: new Date().toISOString(),
            checkout_started: false,
            checkout_completed: false
          }, {
            onConflict: 'guest_token'
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
  async (_, { rejectWithValue }) => {
    try {
      const supabase = createClientComponentClient();

      // Test database connection first
      const { error: connectionError } = await supabase.from('cart_tracking').select('id').limit(1);
      if (connectionError) {
        console.warn('Database not available, skipping cart load');
        return []; // Return empty array if database not available
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Not logged in, return empty cart
        return [];
      }

      // Try to get cart from cart_tracking table
      const { data, error } = await supabase
        .from('cart_tracking')
        .select('cart_items, subtotal')
        .eq('user_id', user.id)
        .eq('checkout_completed', false)
        .single();

      if (error || !data || !data.cart_items) {
        // No cart found in database, return empty cart
        return [];
      }

      // Validate and convert cart_items back to Product format (only on load)
      const validCartItems = [];
      const invalidItems = [];

      for (const item of data.cart_items) {
        try {
          // Validate that the product still exists and is active
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, title, base_price, is_active')
            .eq('id', item.product_id)
            .single();

          if (productError || !product || !product.is_active) {
            console.warn(`Product ${item.product_id} from database cart is no longer available`);
            invalidItems.push(item);
            continue; // Skip this item
          }

          // Validate variation if exists
          if (item.variation_id) {
            const { data: variation, error: variationError } = await supabase
              .from('product_variations')
              .select('id, price')
              .eq('id', item.variation_id)
              .single();

            if (variationError || !variation) {
              console.warn(`Variation ${item.variation_id} from database cart is no longer available`);
              invalidItems.push(item);
              continue; // Skip this item
            }
          }

          // Create unique key for the item
          const createUniqueKey = (cartItem: any) => {
            if (cartItem.variation_id) {
              return cartItem.variation_id;
            }
            const sizeKey = cartItem.size_name || 'no-size';
            const frameKey = cartItem.frame_name || 'no-frame';
            return `${cartItem.product_id}-${sizeKey}-${frameKey}`;
          };

          validCartItems.push({
            id: createUniqueKey(item),
            title: item.title,
            price: item.price,
            quantity: Math.max(1, item.quantity), // Ensure quantity is at least 1
            image: item.image,
            size_name: item.size_name,
            frame_name: item.frame_name,
            variation_id: item.variation_id,
            product_id: item.product_id
          });
        } catch (error) {
          console.warn(`Error validating cart item from database:`, error);
          invalidItems.push(item);
        }
      }

      // If some items were invalid, update the database to remove them
      if (invalidItems.length > 0) {
        console.log(`Removing ${invalidItems.length} invalid items from database cart`);
        const updatedCartItems = validCartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          title: item.title,
          image: item.image,
          size_name: item.size_name,
          frame_name: item.frame_name,
          variation_id: item.variation_id
        }));

        const updatedSubtotal = updatedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Update database with cleaned cart
        await supabase
          .from('cart_tracking')
          .update({
            cart_items: updatedCartItems,
            subtotal: updatedSubtotal,
            last_activity: new Date().toISOString()
          })
          .eq('user_id', user.id);
      }

      return validCartItems;
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
    //
    increment: (state, { payload }) => {
      state.orderQuantity = state.orderQuantity + 1;
    },
    decrement: (state, { payload }) => {
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
      // Handle syncCartWithDatabase
      .addCase(syncCartWithDatabase.pending, (state) => {
        state.isSyncing = true;
      })
      .addCase(syncCartWithDatabase.fulfilled, (state, action) => {
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
} = cartSlice.actions;

// Async thunks are already exported above where they're defined

export default cartSlice.reducer;


