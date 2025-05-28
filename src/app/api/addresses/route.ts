// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminSupabaseClient } from '@/utils/clerk-supabase';

// Get all addresses for the current user
export async function GET(req: Request) {
  try {
    // Check authentication with Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create Supabase client with service role
    const supabase = createAdminSupabaseClient();

    // Get all addresses for the user
    const { data, error } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching addresses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch addresses' },
        { status: 500 }
      );
    }

    return NextResponse.json({ addresses: data });
  } catch (error) {
    console.error('Error in addresses API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new address
export async function POST(req: Request) {
  try {
    // Get request body
    const body = await req.json();
    const {
      firstName,
      lastName,
      address,
      apartment,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !address || !city || !state || !postalCode || !country || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createAdminSupabaseClient();

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If this is the default address, set all other addresses to non-default
    if (isDefault) {
      await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('user_id', session.user.id);
    }

    // Create the new address
    const { data, error } = await supabase
      .from('shipping_addresses')
      .insert({
        user_id: session.user.id,
        first_name: firstName,
        last_name: lastName,
        address,
        apartment,
        city,
        state,
        postal_code: postalCode,
        country,
        phone,
        is_default: isDefault || false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating address:', error);
      return NextResponse.json(
        { error: 'Failed to create address' },
        { status: 500 }
      );
    }

    return NextResponse.json({ address: data });
  } catch (error) {
    console.error('Error in addresses API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update an existing address
export async function PUT(req: Request) {
  try {
    // Get request body
    const body = await req.json();
    const {
      id,
      firstName,
      lastName,
      address,
      apartment,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault
    } = body;

    // Validate required fields
    if (!id || !firstName || !lastName || !address || !city || !state || !postalCode || !country || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createAdminSupabaseClient();

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the address belongs to the user
    const { data: existingAddress, error: fetchError } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (fetchError || !existingAddress) {
      return NextResponse.json(
        { error: 'Address not found or does not belong to user' },
        { status: 404 }
      );
    }

    // If this is the default address, set all other addresses to non-default
    if (isDefault) {
      await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('user_id', session.user.id);
    }

    // Update the address
    const { data, error } = await supabase
      .from('shipping_addresses')
      .update({
        first_name: firstName,
        last_name: lastName,
        address,
        apartment,
        city,
        state,
        postal_code: postalCode,
        country,
        phone,
        is_default: isDefault || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating address:', error);
      return NextResponse.json(
        { error: 'Failed to update address' },
        { status: 500 }
      );
    }

    return NextResponse.json({ address: data });
  } catch (error) {
    console.error('Error in addresses API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
