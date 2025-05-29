import { configureStore } from '@reduxjs/toolkit'
import cartSlice from './features/cartSlice'
import productSlice from './features/productSlice'
import { productApi } from './features/productApi'

// This file is kept for backward compatibility
// The actual store creation is now in StoreProvider.tsx
// to ensure proper client-side only instantiation

// Create a function to create a store
export function createStore() {
  console.log('🔍 CLIENT DEBUG: createStore() function called')

  try {
    console.log('🔍 CLIENT DEBUG: About to call configureStore()')

    const store = configureStore({
      reducer: {
        cart: cartSlice,
        products: productSlice,
        [productApi.reducerPath]: productApi.reducer,
      },
      middleware: (getDefaultMiddleware) => {
        console.log('🔍 CLIENT DEBUG: Configuring middleware')
        try {
          const defaultMiddleware = getDefaultMiddleware()
          console.log('🔍 CLIENT DEBUG: Got default middleware')
          const result = defaultMiddleware.concat(productApi.middleware)
          console.log('🔍 CLIENT DEBUG: Middleware configuration successful')
          return result
        } catch (middlewareError) {
          console.error('🔍 CLIENT DEBUG: Error in middleware configuration:', middlewareError)
          console.error('🔍 CLIENT DEBUG: Middleware error name:', (middlewareError as any)?.name)
          console.error('🔍 CLIENT DEBUG: Middleware error message:', (middlewareError as any)?.message)

          // Check if this is the constructor error we're looking for
          if ((middlewareError as any)?.message?.includes('constructor') || (middlewareError as any)?.message?.includes('Ba')) {
            console.error('🔍 CLIENT DEBUG: *** FOUND THE Ba CONSTRUCTOR ERROR IN MIDDLEWARE! ***')
          }
          throw middlewareError
        }
      },
    })

    console.log('🔍 CLIENT DEBUG: configureStore() successful')
    return store
  } catch (error) {
    console.error('🔍 CLIENT DEBUG: Error in createStore():', error)
    console.error('🔍 CLIENT DEBUG: createStore error name:', (error as any)?.name)
    console.error('🔍 CLIENT DEBUG: createStore error message:', (error as any)?.message)

    // Check if this is the constructor error we're looking for
    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
      console.error('🔍 CLIENT DEBUG: *** FOUND THE Ba CONSTRUCTOR ERROR IN createStore! ***')
    }
    throw error
  }
}

// For backward compatibility
const store = typeof window !== 'undefined' ? createStore() : null

export default store