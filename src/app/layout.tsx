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
  console.log('🔍 SSR DEBUG: RootLayout starting')

  try {
    console.log('🔍 SSR DEBUG: About to render ClerkProvider')

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
    console.error('🔍 SSR DEBUG: Error in RootLayout:', error)
    console.error('🔍 SSR DEBUG: RootLayout error name:', (error as any)?.name)
    console.error('🔍 SSR DEBUG: RootLayout error message:', (error as any)?.message)

    // Check if this is the constructor error we're looking for
    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
      console.error('🔍 SSR DEBUG: *** FOUND THE Ba CONSTRUCTOR ERROR IN ROOTLAYOUT! ***')
    }

    throw error
  }
}