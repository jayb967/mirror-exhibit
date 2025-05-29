'use client'

import { ReactNode, useRef, useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import cartSlice, { get_cart_products } from '@/redux/features/cartSlice'
import productSlice from '@/redux/features/productSlice'
import { productApi } from '@/redux/features/productApi'
import { useAuth } from '@/hooks/useClerkAuth'

// STEP 2: Remove complex middleware for now

// Create a function to create a store
function createStore() {
  console.log('🔍 STEP2 DEBUG: createStore() function called')

  try {
    console.log('🔍 STEP2 DEBUG: About to call configureStore()')

    const store = configureStore({
      reducer: {
        cart: cartSlice,
        products: productSlice,
        [productApi.reducerPath]: productApi.reducer,
      },
      middleware: (getDefaultMiddleware) => {
        console.log('🔍 STEP2 DEBUG: Configuring middleware')
        try {
          const defaultMiddleware = getDefaultMiddleware()
          console.log('🔍 STEP2 DEBUG: Got default middleware')
          const result = defaultMiddleware.concat(productApi.middleware)
          console.log('🔍 STEP2 DEBUG: Middleware configuration successful')
          return result
        } catch (middlewareError) {
          console.error('🔍 STEP2 DEBUG: Error in middleware configuration:', middlewareError)
          console.error('🔍 STEP2 DEBUG: Middleware error name:', (middlewareError as any)?.name)
          console.error('🔍 STEP2 DEBUG: Middleware error message:', (middlewareError as any)?.message)

          // Check if this is the constructor error we're looking for
          if ((middlewareError as any)?.message?.includes('constructor') || (middlewareError as any)?.message?.includes('Ba')) {
            console.error('🔍 STEP2 DEBUG: *** FOUND THE Ba CONSTRUCTOR ERROR IN MIDDLEWARE! ***')
          }
          throw middlewareError
        }
      },
    })

    console.log('🔍 STEP2 DEBUG: configureStore() successful')
    return store
  } catch (error) {
    console.error('🔍 STEP2 DEBUG: Error in createStore():', error)
    console.error('🔍 STEP2 DEBUG: createStore error name:', (error as any)?.name)
    console.error('🔍 STEP2 DEBUG: createStore error message:', (error as any)?.message)

    // Check if this is the constructor error we're looking for
    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
      console.error('🔍 STEP2 DEBUG: *** FOUND THE Ba CONSTRUCTOR ERROR IN createStore! ***')
    }
    throw error
  }
}

// Define the store type
type StoreType = ReturnType<typeof createStore>

// STEP 3: Add back useAuth but with comprehensive error handling
function CartInitializer() {
  const dispatch = useDispatch()

  console.log('🔍 STEP5 DEBUG: CartInitializer starting - STEP 5 FIXING AUTH PROPERTY ACCESS')

  // Always call useAuth first (React Hook rules)
  console.log('🔍 STEP5 DEBUG: About to call useAuth()')
  const authState = useAuth()
  console.log('🔍 STEP5 DEBUG: useAuth() call successful')

  // Safely extract auth properties with error handling
  let isAuthenticated = false
  let user = null
  let isLoading = true
  let authError = null

  try {
    console.log('🔍 STEP5 DEBUG: Extracting auth properties')
    isAuthenticated = authState.isAuthenticated || false
    user = authState.user || null
    isLoading = authState.isLoading || false
    console.log('🔍 STEP5 DEBUG: Auth properties extracted:', { isAuthenticated, hasUser: !!user, isLoading })
  } catch (error) {
    authError = error
    console.error('🔍 STEP5 DEBUG: ERROR extracting auth properties:', error)
    console.error('🔍 STEP5 DEBUG: Auth extraction error message:', (error as any)?.message)
    console.error('🔍 STEP5 DEBUG: Auth extraction error stack:', (error as any)?.stack)

    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba') || (error as any)?.message?.includes('ja')) {
      console.error('🔍 STEP5 DEBUG: *** FOUND CONSTRUCTOR ERROR IN AUTH PROPERTY EXTRACTION! ***')
    }
  }

  useEffect(() => {
    console.log('🔍 STEP3 DEBUG: Cart loading useEffect triggered')
    try {
      // Only load cart from localStorage - no complex auth logic yet
      dispatch(get_cart_products())
      console.log('🔍 STEP3 DEBUG: Cart loaded successfully')
    } catch (error) {
      console.error('🔍 STEP3 DEBUG: Error loading cart:', error)
      console.error('🔍 STEP3 DEBUG: Cart error message:', (error as any)?.message)

      if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
        console.error('🔍 STEP3 DEBUG: *** FOUND Ba CONSTRUCTOR ERROR IN CART LOADING! ***')
      }
    }
  }, [dispatch])

  // Add useEffect to monitor auth state changes with more detailed debugging
  useEffect(() => {
    console.log('🔍 STEP3 DEBUG: Auth monitoring useEffect triggered')
    console.log('🔍 STEP3 DEBUG: Current auth state:', { isAuthenticated, hasUser: !!user, isLoading, hasAuthError: !!authError })

    try {
      if (isAuthenticated && user) {
        console.log('🔍 STEP3 DEBUG: User is authenticated - TESTING AUTH STATE ACCESS')

        // Test accessing ONLY the valid UserProfile properties
        try {
          console.log('🔍 STEP5 DEBUG: Testing valid UserProfile properties')
          console.log('🔍 STEP5 DEBUG: user.id:', user.id ? 'present' : 'null')
          console.log('🔍 STEP5 DEBUG: user.email:', user.email ? 'present' : 'null')
          console.log('🔍 STEP5 DEBUG: user.role:', user.role || 'null')
          console.log('🔍 STEP5 DEBUG: user.full_name:', user.full_name ? 'present' : 'null')
          console.log('🔍 STEP5 DEBUG: All valid UserProfile properties accessed successfully')
        } catch (userError) {
          console.error('🔍 STEP5 DEBUG: ERROR accessing valid UserProfile properties:', userError)
          if ((userError as any)?.message?.includes('constructor') || (userError as any)?.message?.includes('Ba') || (userError as any)?.message?.includes('ja')) {
            console.error('🔍 STEP5 DEBUG: *** FOUND CONSTRUCTOR ERROR IN VALID USER PROPERTIES ACCESS! ***')
          }
        }

      } else {
        console.log('🔍 STEP3 DEBUG: User is not authenticated or still loading')
      }
    } catch (error) {
      console.error('🔍 STEP3 DEBUG: ERROR in auth monitoring:', error)
      console.error('🔍 STEP3 DEBUG: Auth monitoring error message:', (error as any)?.message)
      console.error('🔍 STEP3 DEBUG: Auth monitoring error stack:', (error as any)?.stack)

      if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
        console.error('🔍 STEP3 DEBUG: *** FOUND Ba CONSTRUCTOR ERROR IN AUTH MONITORING! ***')
      }
    }
  }, [isAuthenticated, user, isLoading, authError])

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
