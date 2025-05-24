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
  const [supabaseClient] = useState(() => supabase)

  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className={inter.className}>
        <AppWrapper>
          {children}
        </AppWrapper>
      </body>
    </html>
  );
}