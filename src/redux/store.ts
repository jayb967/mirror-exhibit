import { configureStore } from '@reduxjs/toolkit'
import cartSlice from './features/cartSlice'
import productSlice from './features/productSlice'
import { productApi } from './features/productApi'

const store = configureStore({
  reducer: {
    cart: cartSlice,
    products: productSlice,
    [productApi.reducerPath]: productApi.reducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(productApi.middleware),
})

export default store