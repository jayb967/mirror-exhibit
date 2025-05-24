'use client';

import React from 'react';
import Image from 'next/image';

interface PlaceholderImageProps {
  width?: number;
  height?: number;
  className?: string;
}

const PlaceholderImage: React.FC<PlaceholderImageProps> = ({ 
  width = 80, 
  height = 80,
  className = ''
}) => {
  // Simple gray placeholder with product icon
  return (
    <div 
      className={`tw-flex tw-items-center tw-justify-center tw-bg-gray-200 ${className}`}
      style={{ width, height }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={width * 0.5} 
        height={height * 0.5} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="tw-text-gray-400"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    </div>
  );
};

export default PlaceholderImage;
