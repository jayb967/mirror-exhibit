"use client";

import { ToastContainer } from "react-toastify";
import ScrollToTop from "@/components/common/ScrollToTop";
import FloatingCartButton from "@/components/common/FloatingCartButton";

// STEP 2: Add back essential components but keep GSAP minimal
const Wrapper = ({ children }: any) => {
  console.log('🔍 STEP2 DEBUG: Wrapper component starting - STEP 2 with essential components')

  try {
    console.log('🔍 STEP2 DEBUG: About to render Wrapper with essential components')

    return (
      <>
        {children}
        <ScrollToTop />
        <FloatingCartButton />
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          limit={1}
        />
      </>
    );
  } catch (error) {
    console.error('🔍 STEP2 DEBUG: Error in Step 2 Wrapper:', error)
    console.error('🔍 STEP2 DEBUG: Error message:', (error as any)?.message)

    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
      console.error('🔍 STEP2 DEBUG: *** FOUND Ba CONSTRUCTOR ERROR IN STEP 2 WRAPPER! ***')
    }

    throw error
  }
};

export default Wrapper;
