'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  priority?: boolean; // For above-the-fold content
}

/**
 * LazySection component that only renders its children when they come into view
 * This helps improve initial page load performance by deferring non-critical content
 */
const LazySection: React.FC<LazySectionProps> = ({
  children,
  fallback = null,
  rootMargin = '100px',
  threshold = 0.1,
  className = '',
  id,
  style,
  priority = false
}) => {
  const [isIntersecting, setIsIntersecting] = useState(priority); // Priority content loads immediately
  const [hasIntersected, setHasIntersected] = useState(priority);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip intersection observer for priority content
    if (priority) return;

    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [hasIntersected, threshold, rootMargin, priority]);

  // For priority content or content that has intersected, render children
  if (priority || hasIntersected) {
    return (
      <div ref={targetRef} className={className} id={id} style={style}>
        {children}
      </div>
    );
  }

  // For non-priority content that hasn't intersected yet, render fallback or placeholder
  return (
    <div 
      ref={targetRef} 
      className={className} 
      id={id} 
      style={{
        ...style,
        minHeight: style?.minHeight || '200px', // Maintain layout
      }}
    >
      {fallback || (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            color: '#ccc',
            fontSize: '14px',
          }}
        >
          Loading...
        </div>
      )}
    </div>
  );
};

export default LazySection;
