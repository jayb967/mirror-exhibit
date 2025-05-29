'use client'

import { ReactNode } from 'react'

// STEP 3: Absolutely minimal - no imports except React
export function AppWrapper({ children }: { children: ReactNode }) {
  console.log('🔍 STEP3 DEBUG: AppWrapper starting - ABSOLUTELY MINIMAL')

  try {
    console.log('🔍 STEP3 DEBUG: About to render children with no providers')

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px', color: 'red', fontWeight: 'bold' }}>
          DEBUG MODE: Minimal AppWrapper - No Redux, No Complex Imports
        </div>
        {children}
      </div>
    )
  } catch (error) {
    console.error('🔍 STEP3 DEBUG: Error in minimal AppWrapper:', error)
    console.error('🔍 STEP3 DEBUG: Error message:', (error as any)?.message)

    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
      console.error('🔍 STEP3 DEBUG: *** FOUND Ba CONSTRUCTOR ERROR IN MINIMAL APPWRAPPER! ***')
    }

    throw error
  }
}
