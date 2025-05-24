'use client'

import { ReactNode, useRef, useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import cartSlice, { get_cart_products, syncCartWithDatabase, loadCartFromDatabase } from '@/redux/features/cartSlice'
import productSlice from '@/redux/features/productSlice'
import { productApi } from '@/redux/features/productApi'
import { useAuth } from '@/hooks/useClerkAuth'
import { createClient } from '@supabase/supabase-js'
import { cartTrackingService } from '@/services/cartTrackingService'

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
  const { isAuthenticated, user, isLoading } = useAuth()
  const prevAuthState = useRef(isAuthenticated)

  useEffect(() => {
    // Load cart from localStorage on app startup
    dispatch(get_cart_products())
  }, [dispatch])

  useEffect(() => {
    // Handle auth state changes
    if (isLoading) return // Don't do anything while auth is loading

    const wasAuthenticated = prevAuthState.current
    const isNowAuthenticated = isAuthenticated

    const handleAuthChange = async () => {
      if (!wasAuthenticated && isNowAuthenticated && user) {
        // User just logged in - convert guest cart and sync
        console.log('User logged in, converting guest cart and syncing...')
        try {
          // Convert guest cart to user cart in cart_tracking
          await cartTrackingService.convertGuestToUser(user.id)

          // Load cart from database and merge with local cart
          dispatch(loadCartFromDatabase())
          // Sync any local cart items to database
          dispatch(syncCartWithDatabase())
        } catch (error) {
          console.error('Error syncing cart after login:', error)
        }
      } else if (wasAuthenticated && !isNowAuthenticated) {
        // User logged out - continue with local storage only
        console.log('User logged out, using local cart...')
        dispatch(get_cart_products())
      }

      // Update previous auth state
      prevAuthState.current = isAuthenticated
    }

    handleAuthChange()
  }, [isAuthenticated, user, isLoading, dispatch])

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
