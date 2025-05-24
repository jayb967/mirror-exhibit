import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Cloudinary URL for direct uploads (if using unsigned uploads)
export const CLOUDINARY_UPLOAD_URL = process.env.NEXT_PUBLIC_CLOUDINARY_URL ||
  `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Upload an image to Cloudinary
 * @param file The file to upload
 * @param folder The folder to upload to (optional)
 * @returns The Cloudinary response with the image URL
 */
export const uploadImage = async (
  file: File,
  folder = 'product-images'
): Promise<{ url: string; publicId: string }> => {
  // Convert file to base64
  const base64data = await fileToBase64(file);

  // Create a unique filename
  const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

  // Upload to Cloudinary
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      base64data,
      {
        folder,
        public_id: uniqueFilename,
        transformation: [
          { width: 1200, crop: 'limit' }, // Limit max width to 1200px
          { quality: 'auto:good' }, // Auto-optimize quality
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          reject(new Error('Failed to upload image to Cloudinary'));
        }
      }
    );
  });
};

/**
 * Generate a Cloudinary URL with transformations
 * @param publicId The public ID of the image
 * @param width The desired width
 * @param height The desired height (optional)
 * @returns The transformed image URL
 */
export const getImageUrl = (
  publicId: string,
  width: number,
  height?: number
): string => {
  return cloudinary.url(publicId, {
    secure: true,
    width,
    height,
    crop: height ? 'fill' : 'scale',
    quality: 'auto:good',
    fetch_format: 'auto', // Auto-select best format (WebP, AVIF)
  });
};

/**
 * Convert a File object to a base64 string
 * @param file The file to convert
 * @returns A Promise that resolves to the base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default cloudinary;
