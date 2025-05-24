'use client';

import React, { useState, useEffect } from 'react';

interface ClientOnlyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wrapper component that prevents rendering during static generation
 * This solves the useContext errors during build time
 */
export default function ClientOnlyWrapper({ children, fallback = null }: ClientOnlyWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything during static generation
  if (!mounted) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        {fallback || 'Loading...'}
      </div>
    );
  }

  return <>{children}</>;
}
