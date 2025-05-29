'use client'

import { ReactNode, createContext, useContext } from 'react'

// Mock Redux context
const MockReduxContext = createContext({
  dispatch: () => {},
  getState: () => ({
    cart: {
      cart: [],
      total: 0,
      quantity: 0,
      isSyncing: false
    },
    products: {
      products: []
    }
  })
})

// Mock useSelector hook
export function useSelector(selector: any) {
  console.log('🔍 STEP3 DEBUG: Mock useSelector called')
  const context = useContext(MockReduxContext)
  try {
    return selector(context.getState())
  } catch (error) {
    console.error('🔍 STEP3 DEBUG: Error in mock useSelector:', error)
    // Return safe defaults
    return []
  }
}

// Mock useDispatch hook
export function useDispatch() {
  console.log('🔍 STEP3 DEBUG: Mock useDispatch called')
  const context = useContext(MockReduxContext)
  return context.dispatch
}

// Mock Provider component
export function MockReduxProvider({ children }: { children: ReactNode }) {
  console.log('🔍 STEP3 DEBUG: MockReduxProvider starting')
  
  try {
    console.log('🔍 STEP3 DEBUG: About to render mock provider')
    
    return (
      <MockReduxContext.Provider value={{
        dispatch: () => {
          console.log('🔍 STEP3 DEBUG: Mock dispatch called')
        },
        getState: () => ({
          cart: {
            cart: [],
            total: 0,
            quantity: 0,
            isSyncing: false
          },
          products: {
            products: []
          }
        })
      }}>
        {children}
      </MockReduxContext.Provider>
    )
  } catch (error) {
    console.error('🔍 STEP3 DEBUG: Error in MockReduxProvider:', error)
    console.error('🔍 STEP3 DEBUG: Error message:', (error as any)?.message)
    
    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
      console.error('🔍 STEP3 DEBUG: *** FOUND Ba CONSTRUCTOR ERROR IN MOCK REDUX! ***')
    }
    
    throw error
  }
}
