import './globals.css';
import '@/styles/custom-fixes.css';
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
  console.log('🔍 STEP2 SSR DEBUG: RootLayout starting - BACK TO STEP 2')

  try {
    console.log('🔍 STEP2 SSR DEBUG: About to render ClerkProvider')

    return (
      <ClerkProvider>
        <html lang="en">
          <body suppressHydrationWarning={true} className={inter.className}>
            <AppWrapper>
              {children}
            </AppWrapper>
          </body>
        </html>
      </ClerkProvider>
    );
  } catch (error) {
    console.error('🔍 STEP2 SSR DEBUG: Error in Step 2 RootLayout:', error)
    console.error('🔍 STEP2 SSR DEBUG: RootLayout error name:', (error as any)?.name)
    console.error('🔍 STEP2 SSR DEBUG: RootLayout error message:', (error as any)?.message)

    // Check if this is the constructor error we're looking for
    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
      console.error('🔍 STEP2 SSR DEBUG: *** FOUND THE Ba CONSTRUCTOR ERROR IN STEP 2 ROOTLAYOUT! ***')
    }

    throw error
  }
}