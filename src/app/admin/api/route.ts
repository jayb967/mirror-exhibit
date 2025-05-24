import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  }

  // Check if user is admin
  const userRole = sessionClaims?.metadata?.role ||
                  sessionClaims?.publicMetadata?.role ||
                  sessionClaims?.privateMetadata?.role;

  if (userRole !== 'admin') {
    // Redirect to home if not admin
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  }

  // If authenticated and admin, redirect to dashboard
  return NextResponse.redirect(new URL('/admin/dashboard', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
}
