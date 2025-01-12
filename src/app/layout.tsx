'use client'

import '../styles/index.scss';
import store from '@/redux/store';
import { Provider } from 'react-redux';
import {supabase} from '@/utils/supabase/client'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [supabaseClient] = useState(() => supabase)

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Montserrat:wght@300;400;500;600;700;800;900&family=Satisfy&family=Poppins:wght@300;400;500;600;700&family=Schoolbell&display=swap"
        />
      </head>
      <body suppressHydrationWarning={true}>
        <Provider store={store}>
          <SessionContextProvider supabaseClient={supabaseClient}>
            {children}
          </SessionContextProvider>
        </Provider>
      </body>
    </html>
  );
}