// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/utils/clerk-supabase';

/**
 * Get a specific shipping rule
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      );
    }
    
    // Create Supabase client
    const supabase = await createServerSupabaseClient();
    
    // Get the shipping rule
    const { data, error } = await supabase
      .from('shipping_rules')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching shipping rule:', error);
      return NextResponse.json(
        { error: 'Shipping rule not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ rule: data });
  } catch (error) {
    console.error('Error in shipping rules API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Delete a shipping rule (admin only)
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Rule ID is required' },
        { status: 400 }
      );
    }
    
    // Create Supabase client
    const supabase = await createServerSupabaseClient();
    
    // Check if user is authenticated and is admin
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const isAdmin = session.user.user_metadata?.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Delete the shipping rule
    const { error } = await supabase
      .from('shipping_rules')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting shipping rule:', error);
      return NextResponse.json(
        { error: 'Failed to delete shipping rule' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in shipping rules API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
