// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/utils/clerk-supabase';

/**
 * Set an address as the default
 * 
 * Request body:
 * {
 *   addressId: string
 * }
 */
export async function POST(req: Request) {
  try {
    // Get request body
    const body = await req.json();
    const { addressId } = body;
    
    if (!addressId) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }
    
    // Create Supabase client
    const supabase = await createServerSupabaseClient();
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if the address belongs to the user
    const { data: existingAddress, error: fetchError } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('id', addressId)
      .eq('user_id', session.user.id)
      .single();
    
    if (fetchError || !existingAddress) {
      return NextResponse.json(
        { error: 'Address not found or does not belong to user' },
        { status: 404 }
      );
    }
    
    // Set all addresses to non-default
    await supabase
      .from('shipping_addresses')
      .update({ is_default: false })
      .eq('user_id', session.user.id);
    
    // Set the selected address as default
    const { error } = await supabase
      .from('shipping_addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error('Error setting default address:', error);
      return NextResponse.json(
        { error: 'Failed to set default address' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in set default address API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
