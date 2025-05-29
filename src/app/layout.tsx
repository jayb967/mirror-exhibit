import './globals.css';
import '@/styles/custom-fixes.css';
import { Inter } from "next/font/google";
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
  console.log('🔍 STEP3 SSR DEBUG: RootLayout starting - NO CLERK')

  try {
    console.log('🔍 STEP3 SSR DEBUG: About to render without ClerkProvider')

    return (
      <html lang="en">
        <body suppressHydrationWarning={true} className={inter.className}>
          <div style={{ padding: '20px', backgroundColor: '#ffe6e6', marginBottom: '20px' }}>
            <strong>DEBUG MODE: No Clerk, No Redux, Minimal Setup</strong>
          </div>
          <AppWrapper>
            {children}
          </AppWrapper>
        </body>
      </html>
    );
  } catch (error) {
    console.error('🔍 STEP3 SSR DEBUG: Error in minimal RootLayout:', error)
    console.error('🔍 STEP3 SSR DEBUG: RootLayout error name:', (error as any)?.name)
    console.error('🔍 STEP3 SSR DEBUG: RootLayout error message:', (error as any)?.message)

    // Check if this is the constructor error we're looking for
    if ((error as any)?.message?.includes('constructor') || (error as any)?.message?.includes('Ba')) {
      console.error('🔍 STEP3 SSR DEBUG: *** FOUND THE Ba CONSTRUCTOR ERROR IN MINIMAL ROOTLAYOUT! ***')
    }

    throw error
  }
}