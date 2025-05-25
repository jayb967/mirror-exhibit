'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface FloatingFilterButtonProps {
  onClick: () => void;
  activeFiltersCount?: number;
}

const FloatingFilterButton: React.FC<FloatingFilterButtonProps> = ({ 
  onClick, 
  activeFiltersCount = 0 
}) => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  // Show the floating filter button only on shop page and mobile devices
  useEffect(() => {
    const checkVisibility = () => {
      const isShopPage = pathname === '/shop';
      const isMobile = window.innerWidth <= 768;
      
      setIsVisible(isShopPage && isMobile);
    };

    // Initial check
    checkVisibility();

    // Listen for resize events
    window.addEventListener('resize', checkVisibility);
    
    return () => {
      window.removeEventListener('resize', checkVisibility);
    };
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <button
      className="floating-filter-button"
      onClick={onClick}
      aria-label="Open filters"
    >
      <i className="fa-solid fa-filter"></i>
      {activeFiltersCount > 0 && (
        <span className="filter-badge">{activeFiltersCount}</span>
      )}
    </button>
  );
};

export default FloatingFilterButton;
