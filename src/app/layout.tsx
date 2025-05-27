import './globals.css';
import '@/styles/custom-fixes.css';
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { AppWrapper } from '@/components/AppWrapper';

// Font Awesome configuration
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

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
}