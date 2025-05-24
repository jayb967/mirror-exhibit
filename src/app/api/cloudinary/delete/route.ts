// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { verifyAdminAccess } from '@/utils/admin-auth';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * API endpoint to delete an image from Cloudinary
 * Requires admin authentication
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin access using centralized utility
    const authResult = await verifyAdminAccess({
      operation: 'delete product images from Cloudinary'
    });

    if (!authResult.success) {
      return authResult.error;
    }

    // Get request body
    const body = await request.json();
    const { imageUrl, publicId } = body;

    if (!imageUrl && !publicId) {
      return NextResponse.json(
        { error: 'Image URL or public ID is required' },
        { status: 400 }
      );
    }

    let cloudinaryPublicId = publicId;

    // If we have an image URL but no public ID, extract it
    if (!cloudinaryPublicId && imageUrl) {
      cloudinaryPublicId = extractPublicIdFromUrl(imageUrl);
    }

    if (!cloudinaryPublicId) {
      return NextResponse.json(
        { error: 'Could not determine Cloudinary public ID' },
        { status: 400 }
      );
    }

    // Delete from Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.destroy(
        cloudinaryPublicId,
        {
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary delete error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });

    // Check if deletion was successful
    if (result.result === 'ok') {
      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully from Cloudinary',
        publicId: cloudinaryPublicId,
        result: result
      });
    } else if (result.result === 'not found') {
      return NextResponse.json({
        success: true,
        message: 'Image not found in Cloudinary (may have been already deleted)',
        publicId: cloudinaryPublicId,
        result: result
      });
    } else {
      return NextResponse.json(
        {
          error: 'Failed to delete image from Cloudinary',
          result: result
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * Extract Cloudinary public ID from a Cloudinary URL
 * @param url Cloudinary image URL
 * @returns Public ID or null if not a valid Cloudinary URL
 */
function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Check if it's a Cloudinary URL
    if (!url.includes('res.cloudinary.com')) {
      return null;
    }

    // Extract public ID from Cloudinary URL
    // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.ext
    // or: https://res.cloudinary.com/cloud_name/image/upload/folder/public_id.ext
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');

    if (uploadIndex === -1) {
      return null;
    }

    // Get everything after 'upload' and before the file extension
    const pathAfterUpload = urlParts.slice(uploadIndex + 1);

    // Remove version if present (starts with 'v' followed by numbers)
    if (pathAfterUpload[0] && /^v\d+$/.test(pathAfterUpload[0])) {
      pathAfterUpload.shift();
    }

    // Join the remaining parts and remove file extension
    const publicIdWithExt = pathAfterUpload.join('/');
    const lastDotIndex = publicIdWithExt.lastIndexOf('.');

    if (lastDotIndex === -1) {
      return publicIdWithExt;
    }

    return publicIdWithExt.substring(0, lastDotIndex);
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
}
