import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * API endpoint to upload an image to Cloudinary from a URL
 * This is a direct upload endpoint for the CSV import functionality
 * that doesn't require authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    const { imageUrl } = body;
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }
    
    // Create a unique filename
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    // Upload to Cloudinary directly from the URL
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        imageUrl,
        {
          folder: 'product-images',
          public_id: uniqueFilename,
          upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'mirror_exhibit',
          transformation: [
            { width: 1200, crop: 'limit' }, // Limit max width to 1200px
            { quality: 'auto:good' }, // Auto-optimize quality
          ],
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
    
    // Return the optimized image URL and other details
    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    });
    
  } catch (error) {
    console.error('Error uploading image from URL to Cloudinary:', error);
    
    // Provide more detailed error information
    let errorMessage = 'Failed to upload image from URL';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for specific error types
      if (errorMessage.includes('not found') || errorMessage.includes('Invalid')) {
        statusCode = 400;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: statusCode }
    );
  }
}
