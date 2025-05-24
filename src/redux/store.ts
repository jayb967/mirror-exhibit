import { configureStore } from '@reduxjs/toolkit'
import cartSlice from './features/cartSlice'
import productSlice from './features/productSlice'
import { productApi } from './features/productApi'

// This file is kept for backward compatibility
// The actual store creation is now in StoreProvider.tsx
// to ensure proper client-side only instantiation

// Create a function to create a store
export function createStore() {
  return configureStore({
    reducer: {
      cart: cartSlice,
      products: productSlice,
      [productApi.reducerPath]: productApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(productApi.middleware),
  })
}

// For backward compatibility
const store = typeof window !== 'undefined' ? createStore() : null

export default store