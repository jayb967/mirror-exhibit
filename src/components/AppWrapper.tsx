'use client'

import { ReactNode } from 'react'
import { StoreProvider } from './StoreProvider'

// STEP 2: Add back StoreProvider only (minimal Redux setup)
export function AppWrapper({ children }: { children: ReactNode }) {
  console.log('🔍 STEP2 DEBUG: AppWrapper starting - STEP 2: StoreProvider only')

  try {
    console.log('🔍 STEP2 DEBUG: About to render StoreProvider')

    return (
      <StoreProvider>
        {children}
      </StoreProvider>
    )
  } catch (error) {
    console.error('🔍 STEP2 DEBUG: Error in Step 2 AppWrapper:', error)
    console.error('🔍 STEP2 DEBUG: Error message:', (error as any)?.message)

    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
      console.error('🔍 STEP2 DEBUG: *** FOUND Ba CONSTRUCTOR ERROR IN STEP 2! ***')
    }

    throw error
  }
}
