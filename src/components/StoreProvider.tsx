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

  console.log('🔍 CLIENT DEBUG: CartInitializer component starting')

  console.log('🔍 CLIENT DEBUG: About to call useAuth()')

  // Always call useAuth first (React Hook rules)
  const authState = useAuth()

  console.log('🔍 CLIENT DEBUG: useAuth() successful')

  // Safely extract auth state with error handling
  let isAuthenticated = false
  let user = null
  let isLoading = true

  try {
    isAuthenticated = authState.isAuthenticated
    user = authState.user
    isLoading = authState.isLoading
    console.log('🔍 CLIENT DEBUG: Auth state extracted:', { isAuthenticated, hasUser: !!user, isLoading })
  } catch (error) {
    console.error('🔍 CLIENT DEBUG: Error extracting auth state properties:', error)
    console.error('🔍 CLIENT DEBUG: Auth error name:', (error as any)?.name)
    console.error('🔍 CLIENT DEBUG: Auth error message:', (error as any)?.message)

    // Check if this is the constructor error we're looking for
    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
      console.error('🔍 CLIENT DEBUG: *** FOUND THE Ba CONSTRUCTOR ERROR IN AUTH STATE EXTRACTION! ***')
    }

    // Use default values (unauthenticated state)
    isAuthenticated = false
    user = null
    isLoading = false
  }

  const prevAuthState = useRef(isAuthenticated)

  useEffect(() => {
    // Load cart from localStorage on app startup
    dispatch(get_cart_products())
  }, [dispatch])

  useEffect(() => {
    console.log('🔍 CLIENT DEBUG: Auth change useEffect triggered', {
      isLoading,
      wasAuthenticated: prevAuthState.current,
      isNowAuthenticated: isAuthenticated,
      hasUser: !!user
    })

    // Handle auth state changes
    if (isLoading) {
      console.log('🔍 CLIENT DEBUG: Auth still loading, returning early')
      return // Don't do anything while auth is loading
    }

    const wasAuthenticated = prevAuthState.current
    const isNowAuthenticated = isAuthenticated

    const handleAuthChange = async () => {
      console.log('🔍 CLIENT DEBUG: handleAuthChange starting')
      try {
        if (!wasAuthenticated && isNowAuthenticated && user) {
          console.log('🔍 CLIENT DEBUG: User just logged in - cart operations temporarily disabled for debugging...')

          // TEMPORARILY DISABLED: All cart operations during login
          // try {
          //   // Convert guest cart to user cart in cart_tracking with error handling
          //   try {
          //     await cartTrackingService.convertGuestToUser(user.id)
          //     console.log('Guest cart conversion completed')
          //   } catch (conversionError) {
          //     console.warn('Guest cart conversion failed (non-critical):', conversionError)
          //     // Continue with cart sync even if conversion fails
          //   }

          //   // Load cart from database and merge with local cart with error handling
          //   try {
          //     await dispatch(loadCartFromDatabase()).unwrap()
          //     console.log('Cart loaded from database')
          //   } catch (loadError) {
          //     console.warn('Failed to load cart from database:', loadError)
          //     // Fallback to local cart
          //     dispatch(get_cart_products())
          //   }

          //   // Sync any local cart items to database with error handling
          //   try {
          //     await dispatch(syncCartWithDatabase()).unwrap()
          //     console.log('Cart synced to database')
          //   } catch (syncError) {
          //     console.warn('Failed to sync cart to database:', syncError)
          //     // Continue with local cart - sync will be retried later
          //   }
          // } catch (error) {
          //   console.error('Error in login cart handling:', error)
          //   // Fallback to local cart if anything fails
          //   dispatch(get_cart_products())
          // }
        } else if (wasAuthenticated && !isNowAuthenticated) {
          // User logged out - continue with local storage only
          console.log('🔍 CLIENT DEBUG: User logged out, using local cart...')
          dispatch(get_cart_products())
        }

        // Update previous auth state
        console.log('🔍 CLIENT DEBUG: Updating previous auth state')
        prevAuthState.current = isAuthenticated
        console.log('🔍 CLIENT DEBUG: handleAuthChange completed successfully')
      } catch (error) {
        console.error('🔍 CLIENT DEBUG: Error in auth change handler:', error)
        console.error('🔍 CLIENT DEBUG: Auth handler error name:', (error as any)?.name)
        console.error('🔍 CLIENT DEBUG: Auth handler error message:', (error as any)?.message)

        // Check if this is the constructor error we're looking for
        if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
          console.error('🔍 CLIENT DEBUG: *** FOUND THE Ba CONSTRUCTOR ERROR IN AUTH HANDLER! ***')
        }

        // Fallback to local cart if anything fails
        dispatch(get_cart_products())
        prevAuthState.current = isAuthenticated
      }
    }

    console.log('🔍 CLIENT DEBUG: About to call handleAuthChange()')
    handleAuthChange()
    console.log('🔍 CLIENT DEBUG: handleAuthChange() called')
  }, [isAuthenticated, user, isLoading, dispatch])

  return null
}

export function StoreProvider({ children }: { children: ReactNode }) {
  console.log('🔍 CLIENT DEBUG: StoreProvider component starting')

  // Use useRef to ensure the store is only created once
  const storeRef = useRef<StoreType>()
  if (!storeRef.current) {
    console.log('🔍 CLIENT DEBUG: Creating Redux store')
    try {
      storeRef.current = createStore()
      console.log('🔍 CLIENT DEBUG: Redux store created successfully')
    } catch (error) {
      console.error('🔍 CLIENT DEBUG: Error creating Redux store:', error)
      console.error('🔍 CLIENT DEBUG: Store creation error name:', (error as any)?.name)
      console.error('🔍 CLIENT DEBUG: Store creation error message:', (error as any)?.message)

      // Check if this is the constructor error we're looking for
      if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
        console.error('🔍 CLIENT DEBUG: *** FOUND THE Ba CONSTRUCTOR ERROR IN STORE CREATION! ***')
      }
      throw error // Re-throw to prevent app from continuing with broken store
    }
  }

  console.log('🔍 CLIENT DEBUG: About to render Provider with CartInitializer')

  try {
    return (
      <Provider store={storeRef.current}>
        <CartInitializer />
        {children}
      </Provider>
    )
  } catch (error) {
    console.error('🔍 CLIENT DEBUG: Error in StoreProvider render:', error)
    console.error('🔍 CLIENT DEBUG: Render error name:', (error as any)?.name)
    console.error('🔍 CLIENT DEBUG: Render error message:', (error as any)?.message)

    // Check if this is the constructor error we're looking for
    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
      console.error('🔍 CLIENT DEBUG: *** FOUND THE Ba CONSTRUCTOR ERROR IN PROVIDER RENDER! ***')
    }
    throw error // Re-throw to prevent app from continuing
  }
}
