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
  console.log('🔍 STEP3 SSR DEBUG: RootLayout starting - STEP 3 WITH GLOBAL ERROR HANDLING')

  try {
    console.log('🔍 STEP3 SSR DEBUG: About to render ClerkProvider')

    return (
      <ClerkProvider>
        <html lang="en">
          <head>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  // Global error handler to catch ALL errors
                  window.addEventListener('error', function(event) {
                    console.error('🔍 GLOBAL ERROR HANDLER: Caught error:', event.error);
                    console.error('🔍 GLOBAL ERROR HANDLER: Error message:', event.error?.message);
                    console.error('🔍 GLOBAL ERROR HANDLER: Error stack:', event.error?.stack);

                    if (event.error?.message?.includes('constructor') || event.error?.message?.includes('Ba')) {
                      console.error('🔍 GLOBAL ERROR HANDLER: *** FOUND Ba CONSTRUCTOR ERROR! ***');
                      console.error('🔍 GLOBAL ERROR HANDLER: This is the Ba constructor error we are hunting!');
                    }
                  });

                  // Catch unhandled promise rejections
                  window.addEventListener('unhandledrejection', function(event) {
                    console.error('🔍 GLOBAL PROMISE REJECTION: Caught rejection:', event.reason);
                    console.error('🔍 GLOBAL PROMISE REJECTION: Reason message:', event.reason?.message);

                    if (event.reason?.message?.includes('constructor') || event.reason?.message?.includes('Ba')) {
                      console.error('🔍 GLOBAL PROMISE REJECTION: *** FOUND Ba CONSTRUCTOR ERROR IN PROMISE! ***');
                    }
                  });

                  console.log('🔍 GLOBAL DEBUG: Global error handlers installed');
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
    console.error('🔍 STEP3 SSR DEBUG: Error in Step 3 RootLayout:', error)
    console.error('🔍 STEP3 SSR DEBUG: RootLayout error name:', (error as any)?.name)
    console.error('🔍 STEP3 SSR DEBUG: RootLayout error message:', (error as any)?.message)

    // Check if this is the constructor error we're looking for
    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
      console.error('🔍 STEP3 SSR DEBUG: *** FOUND THE Ba CONSTRUCTOR ERROR IN STEP 3 ROOTLAYOUT! ***')
    }

    throw error
  }
}