import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user role
    const { data: userData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Only allow admins to test
    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Check if Cloudinary environment variables are set
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET ||
        !process.env.NEXT_PUBLIC_CLOUDINARY_URL) {
      return NextResponse.json(
        { error: 'Cloudinary environment variables are not properly configured' },
        { status: 500 }
      );
    }

    // Test Cloudinary API by getting account info
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.api.ping((error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    // Return success response
    return NextResponse.json({
      status: 'success',
      message: 'Cloudinary configuration is working correctly',
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      uploadUrl: process.env.NEXT_PUBLIC_CLOUDINARY_URL,
      result,
    });

  } catch (error) {
    console.error('Error testing Cloudinary:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to test Cloudinary configuration' },
      { status: 500 }
    );
  }
}
