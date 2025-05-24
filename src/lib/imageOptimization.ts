/**
 * Client-side image optimization utilities
 * This can be used as an alternative to Cloudinary for image optimization
 */

import imageCompression from 'browser-image-compression';

/**
 * Options for image compression
 */
interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  maxIteration?: number;
  quality?: number;
}

/**
 * Compress an image file using browser-image-compression
 * @param file The image file to compress
 * @param options Compression options
 * @returns A Promise that resolves to the compressed file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 1, // Default max file size is 1MB
    maxWidthOrHeight: 1200, // Default max width/height is 1200px
    useWebWorker: true, // Use web worker for better performance
    maxIteration: 10, // Max number of iterations to compress
    quality: 0.8, // Image quality (0.8 is a good balance)
  };

  const compressionOptions = { ...defaultOptions, ...options };

  try {
    return await imageCompression(file, compressionOptions);
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
}

/**
 * Create a preview URL for an image file
 * @param file The image file
 * @returns A Promise that resolves to the preview URL
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Resize an image to specific dimensions
 * @param file The image file to resize
 * @param maxWidth Maximum width
 * @param maxHeight Maximum height
 * @returns A Promise that resolves to the resized file
 */
export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<File> {
  return compressImage(file, {
    maxWidthOrHeight: Math.max(maxWidth, maxHeight),
  });
}

/**
 * Generate multiple sizes of an image for responsive display
 * @param file The original image file
 * @returns A Promise that resolves to an object with different sized images
 */
export async function generateResponsiveSizes(
  file: File
): Promise<{ small: File; medium: File; large: File; original: File }> {
  const [small, medium, large] = await Promise.all([
    resizeImage(file, 400, 400),
    resizeImage(file, 800, 800),
    resizeImage(file, 1200, 1200),
  ]);

  return {
    small,
    medium,
    large,
    original: file,
  };
}

/**
 * Convert a File to a Blob URL
 * @param file The file to convert
 * @returns The Blob URL
 */
export function fileToUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke a Blob URL to free up memory
 * @param url The Blob URL to revoke
 */
export function revokeUrl(url: string): void {
  URL.revokeObjectURL(url);
}
