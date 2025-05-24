import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('token');

  if (!token) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/admin/login', 'http://localhost:3000'));
  }

  // If authenticated, redirect to dashboard
  return NextResponse.redirect(new URL('/admin/dashboard', 'http://localhost:3000'));
}
