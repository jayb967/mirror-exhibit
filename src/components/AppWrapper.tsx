'use client'

import { ReactNode } from 'react'
import { StoreProvider } from './StoreProvider'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import '@/styles/index.scss'
import '@/styles/carousel-arrows.css'
import '@/styles/shop-details.css'
import '@/styles/cart.css'

export function AppWrapper({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </StoreProvider>
  )
}
