import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// Delete an address
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
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
    
    // Delete the address
    const { error } = await supabase
      .from('shipping_addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error('Error deleting address:', error);
      return NextResponse.json(
        { error: 'Failed to delete address' },
        { status: 500 }
      );
    }
    
    // If the deleted address was the default, set another address as default
    if (existingAddress.is_default) {
      const { data: addresses } = await supabase
        .from('shipping_addresses')
        .select('id')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (addresses && addresses.length > 0) {
        await supabase
          .from('shipping_addresses')
          .update({ is_default: true })
          .eq('id', addresses[0].id);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in addresses API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get a specific address
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the address
    const { data, error } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();
    
    if (error) {
      console.error('Error fetching address:', error);
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
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
