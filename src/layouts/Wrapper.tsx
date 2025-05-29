"use client";

// MINIMAL VERSION - STEP 1: Strip all GSAP and complex imports

const Wrapper = ({ children }: any) => {
  console.log('🔍 MINIMAL DEBUG: Wrapper component starting - MINIMAL VERSION')

  try {
    console.log('🔍 MINIMAL DEBUG: About to render Wrapper children only')

    return (
      <div>
        {children}
      </div>
    );
  } catch (error) {
    console.error('🔍 MINIMAL DEBUG: Error in minimal Wrapper:', error)
    console.error('🔍 MINIMAL DEBUG: Error message:', (error as any)?.message)

    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
      console.error('🔍 MINIMAL DEBUG: *** FOUND Ba CONSTRUCTOR ERROR IN MINIMAL WRAPPER! ***')
    }

    throw error
  }
};

export default Wrapper;
