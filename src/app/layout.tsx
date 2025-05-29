import './globals.css';
import '@/styles/custom-fixes.css';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/index.scss';
import '@/styles/carousel-arrows.css';
import '@/styles/shop-details.css';
import '@/styles/product-details-enhancements.css';
import '@/styles/cart.css';
import '@/styles/product-modal.css';
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { AppWrapper } from '@/components/AppWrapper';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'Mirror Exhibit',
  description: 'Mirror Exhibit E-commerce Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log('🔍 STEP4 SSR DEBUG: RootLayout starting - STEP 4 WITH ULTRA-AGGRESSIVE ERROR HANDLING')

  try {
    console.log('🔍 STEP4 SSR DEBUG: About to render ClerkProvider')

    return (
      <ClerkProvider>
        <html lang="en">
          <head>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  // STEP 4: ULTRA-AGGRESSIVE ERROR CATCHING
                  console.log('🔍 STEP4 DEBUG: Installing ultra-aggressive error handlers');

                  // Override console.error to catch all errors
                  const originalConsoleError = console.error;
                  console.error = function(...args) {
                    originalConsoleError.apply(console, args);

                    const errorString = args.join(' ');
                    if (errorString.includes('constructor') || errorString.includes('Ba')) {
                      console.log('🔍 STEP4 CONSOLE.ERROR: *** FOUND Ba CONSTRUCTOR ERROR IN CONSOLE! ***');
                      console.log('🔍 STEP4 CONSOLE.ERROR: Full error:', errorString);
                      console.log('🔍 STEP4 CONSOLE.ERROR: Stack trace:', new Error().stack);
                    }
                  };

                  // Global error handler to catch ALL errors
                  window.addEventListener('error', function(event) {
                    console.log('🔍 STEP4 GLOBAL ERROR: Caught error:', event.error);
                    console.log('🔍 STEP4 GLOBAL ERROR: Error message:', event.error?.message);
                    console.log('🔍 STEP4 GLOBAL ERROR: Error stack:', event.error?.stack);
                    console.log('🔍 STEP4 GLOBAL ERROR: Event filename:', event.filename);
                    console.log('🔍 STEP4 GLOBAL ERROR: Event lineno:', event.lineno);
                    console.log('🔍 STEP4 GLOBAL ERROR: Event colno:', event.colno);

                    if (event.error?.message?.includes('constructor') || event.error?.message?.includes('Ba')) {
                      console.log('🔍 STEP4 GLOBAL ERROR: *** FOUND Ba CONSTRUCTOR ERROR! ***');
                      console.log('🔍 STEP4 GLOBAL ERROR: This is the Ba constructor error we are hunting!');
                    }
                  });

                  // Catch unhandled promise rejections
                  window.addEventListener('unhandledrejection', function(event) {
                    console.log('🔍 STEP4 PROMISE REJECTION: Caught rejection:', event.reason);
                    console.log('🔍 STEP4 PROMISE REJECTION: Reason message:', event.reason?.message);
                    console.log('🔍 STEP4 PROMISE REJECTION: Reason stack:', event.reason?.stack);

                    if (event.reason?.message?.includes('constructor') || event.reason?.message?.includes('Ba')) {
                      console.log('🔍 STEP4 PROMISE REJECTION: *** FOUND Ba CONSTRUCTOR ERROR IN PROMISE! ***');
                    }
                  });

                  // Override window.onerror as backup
                  window.onerror = function(message, source, lineno, colno, error) {
                    console.log('🔍 STEP4 WINDOW.ONERROR: Message:', message);
                    console.log('🔍 STEP4 WINDOW.ONERROR: Source:', source);
                    console.log('🔍 STEP4 WINDOW.ONERROR: Line:', lineno);
                    console.log('🔍 STEP4 WINDOW.ONERROR: Column:', colno);
                    console.log('🔍 STEP4 WINDOW.ONERROR: Error:', error);

                    if (message && (message.includes('constructor') || message.includes('Ba'))) {
                      console.log('🔍 STEP4 WINDOW.ONERROR: *** FOUND Ba CONSTRUCTOR ERROR IN WINDOW.ONERROR! ***');
                    }

                    return false; // Don't prevent default error handling
                  };

                  console.log('🔍 STEP4 DEBUG: Ultra-aggressive error handlers installed');
                `,
              }}
            />
          </head>
          <body suppressHydrationWarning={true} className={inter.className}>
            <AppWrapper>
              {children}
            </AppWrapper>
          </body>
        </html>
      </ClerkProvider>
    );
  } catch (error) {
    console.error('🔍 STEP4 SSR DEBUG: Error in Step 4 RootLayout:', error)
    console.error('🔍 STEP4 SSR DEBUG: RootLayout error name:', (error as any)?.name)
    console.error('🔍 STEP4 SSR DEBUG: RootLayout error message:', (error as any)?.message)
    console.error('🔍 STEP4 SSR DEBUG: RootLayout error stack:', (error as any)?.stack)

    // Check if this is the constructor error we're looking for
    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
      console.error('🔍 STEP4 SSR DEBUG: *** FOUND THE Ba CONSTRUCTOR ERROR IN STEP 4 ROOTLAYOUT! ***')
    }

    throw error
  }
}