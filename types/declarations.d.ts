declare module 'stripe';
declare module 'react-toastify';
declare module 'papaparse';

// Add className and style to Image component props in Next.js
import type { ImageProps as NextImageProps } from 'next/image';

declare module 'next/image' {
  interface ImageProps extends NextImageProps {
    className?: string;
    style?: React.CSSProperties;
  }
}