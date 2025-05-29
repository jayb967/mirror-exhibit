'use client'

import { ReactNode, useRef, useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import cartSlice, { get_cart_products } from '@/redux/features/cartSlice'
import productSlice from '@/redux/features/productSlice'
import { productApi } from '@/redux/features/productApi'

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

// STEP 2: Minimal CartInitializer - no auth logic, just basic cart loading
function CartInitializer() {
  const dispatch = useDispatch()

  console.log('🔍 STEP2 DEBUG: CartInitializer starting - MINIMAL VERSION')

  useEffect(() => {
    console.log('🔍 STEP2 DEBUG: Loading cart from localStorage only')
    try {
      // Only load cart from localStorage - no auth logic
      dispatch(get_cart_products())
      console.log('🔍 STEP2 DEBUG: Cart loaded successfully')
    } catch (error) {
      console.error('🔍 STEP2 DEBUG: Error loading cart:', error)
      console.error('🔍 STEP2 DEBUG: Cart error message:', (error as any)?.message)

      if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
        console.error('🔍 STEP2 DEBUG: *** FOUND Ba CONSTRUCTOR ERROR IN CART LOADING! ***')
      }
    }
  }, [dispatch])

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
