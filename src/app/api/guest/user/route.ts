// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/clerk-supabase';
import { cookies } from 'next/headers';

// Get guest user information
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const guestToken = url.searchParams.get('token');
    
    if (!guestToken) {
      return NextResponse.json(
        { error: 'Guest token is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createServerSupabaseClient();
    
    // Get guest user
    const { data, error } = await supabase
      .from('guest_users')
      .select('*')
      .eq('guest_token', guestToken)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" which is fine
      console.error('Error fetching guest user:', error);
      return NextResponse.json(
        { error: 'Failed to fetch guest user' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ user: data || null });
  } catch (error) {
    console.error('Guest user API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create or update guest user
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      guestToken, 
      email, 
      firstName, 
      lastName, 
      address, 
      apartment, 
      city, 
      state, 
      postalCode, 
      country, 
      phone 
    } = body;
    
    // Validate request
    if (!guestToken) {
      return NextResponse.json(
        { error: 'Guest token is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createServerSupabaseClient();
    
    // Create or update guest user
    const { data, error } = await supabase
      .rpc('create_guest_user', {
        p_guest_token: guestToken,
        p_email: email,
        p_first_name: firstName,
        p_last_name: lastName,
        p_address: address,
        p_apartment: apartment,
        p_city: city,
        p_state: state,
        p_postal_code: postalCode,
        p_country: country,
        p_phone: phone
      });
    
    if (error) {
      console.error('Error creating/updating guest user:', error);
      return NextResponse.json(
        { error: 'Failed to create/update guest user' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ user: data });
  } catch (error) {
    console.error('Guest user API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Convert guest to registered user
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { guestToken } = body;
    
    // Validate request
    if (!guestToken) {
      return NextResponse.json(
        { error: 'Guest token is required' },
        { status: 400 }
      );
    }
    
    const supabase = await createServerSupabaseClient();
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Convert guest to user
    const { error } = await supabase
      .rpc('convert_guest_to_user', {
        p_guest_token: guestToken,
        p_user_id: session.user.id
      });
    
    if (error) {
      console.error('Error converting guest to user:', error);
      return NextResponse.json(
        { error: 'Failed to convert guest to user' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Guest user API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
