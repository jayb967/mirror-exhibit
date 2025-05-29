'use client'

import { ReactNode, useEffect, useState } from 'react'
import { StoreProvider } from './StoreProvider'
import { GlobalModalProvider } from '@/contexts/GlobalModalContext'
import GlobalProductModal from './common/GlobalProductModal'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import '@/styles/index.scss'
import '@/styles/carousel-arrows.css'
import '@/styles/shop-details.css'
import '@/styles/product-details-enhancements.css'
import '@/styles/cart.css'
import '@/styles/product-modal.css'

export function AppWrapper({ children }: { children: ReactNode }) {
  console.log('🔍 SSR DEBUG: AppWrapper starting')

  // Prevent SSR issues by only rendering on client
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    console.log('🔍 SSR DEBUG: AppWrapper useEffect - setting isClient to true')
    setIsClient(true)
  }, [])

  // Show loading state during SSR
  if (!isClient) {
    console.log('🔍 SSR DEBUG: AppWrapper rendering SSR fallback')
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    )
  }

  try {
    console.log('🔍 SSR DEBUG: About to render StoreProvider (client-side)')

    return (
      <StoreProvider>
        <GlobalModalProvider>
          {children}
          <GlobalProductModal />
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
        </GlobalModalProvider>
      </StoreProvider>
    )
  } catch (error) {
    console.error('🔍 SSR DEBUG: Error in AppWrapper:', error)
    console.error('🔍 SSR DEBUG: AppWrapper error name:', (error as any)?.name)
    console.error('🔍 SSR DEBUG: AppWrapper error message:', (error as any)?.message)

    // Check if this is the constructor error we're looking for
    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
      console.error('🔍 SSR DEBUG: *** FOUND THE Ba CONSTRUCTOR ERROR IN APPWRAPPER! ***')
    }

    throw error
  }
}
