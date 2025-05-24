'use client'

import { ReactNode, useRef, useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import cartSlice, { get_cart_products, syncCartWithDatabase, loadCartFromDatabase } from '@/redux/features/cartSlice'
import productSlice from '@/redux/features/productSlice'
import { productApi } from '@/redux/features/productApi'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Middleware to sync cart changes to database with debouncing and error handling
let syncTimeout: NodeJS.Timeout | null = null;

const cartSyncMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action)

  // Sync to database after cart modifications (but not during loading/syncing)
  if (action.type?.startsWith('cart/') &&
      !action.type.includes('get_cart_products') &&
      !action.type.includes('loadFromDatabase') &&
      !action.type.includes('syncWithDatabase') &&
      !action.type.includes('pending') &&
      !action.type.includes('fulfilled') &&
      !action.type.includes('rejected')) {

    // Clear existing timeout to debounce
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }

    // Debounce database sync to avoid too many calls
    syncTimeout = setTimeout(async () => {
      try {
        const state = store.getState();
        // Only sync if cart has items and we're not already syncing
        if (state.cart.cart.length > 0 && !state.cart.isSyncing) {
          await store.dispatch(syncCartWithDatabase());
        }
      } catch (error) {
        console.error('Error in cart sync middleware:', error);
      }
      syncTimeout = null;
    }, 2000); // Increased debounce time to 2 seconds
  }

  return result
}

// Create a function to create a store
function createStore() {
  return configureStore({
    reducer: {
      cart: cartSlice,
      products: productSlice,
      [productApi.reducerPath]: productApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(productApi.middleware)
        .concat(cartSyncMiddleware),
  })
}

// Define the store type
type StoreType = ReturnType<typeof createStore>

// Component to initialize cart and handle auth state changes
function CartInitializer() {
  const dispatch = useDispatch()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Load cart from localStorage on app startup
    dispatch(get_cart_products())

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // User just logged in - load cart from database and merge with local cart
        try {
          await dispatch(loadCartFromDatabase())
          // Sync any local cart items to database
          await dispatch(syncCartWithDatabase())
        } catch (error) {
          console.error('Error syncing cart after login:', error)
        }
      } else if (event === 'SIGNED_OUT') {
        // User logged out - continue with local storage only
        dispatch(get_cart_products())
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [dispatch, supabase])

  return null
}

export function StoreProvider({ children }: { children: ReactNode }) {
  // Use useRef to ensure the store is only created once
  const storeRef = useRef<StoreType>()
  if (!storeRef.current) {
    storeRef.current = createStore()
  }

  return (
    <Provider store={storeRef.current}>
      <CartInitializer />
      {children}
    </Provider>
  )
}
