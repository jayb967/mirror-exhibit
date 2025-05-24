import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Create a Supabase client with the service role key
const getAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables for admin client');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

/**
 * API endpoint to create or get frame types with admin privileges
 * This bypasses RLS policies using the service role key
 */
export async function POST(request: NextRequest) {
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
    
    // Only allow admins to create/get frame types
    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { name, description } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Frame type name is required' },
        { status: 400 }
      );
    }
    
    // Get admin client
    const adminClient = getAdminClient();
    
    // Check if frame type exists
    const { data: existingFrameType } = await adminClient
      .from('frame_types')
      .select('id')
      .eq('name', name)
      .maybeSingle();
    
    if (existingFrameType) {
      return NextResponse.json({
        message: 'Frame type already exists',
        id: existingFrameType.id
      });
    }
    
    // Create new frame type
    const frameTypeId = uuidv4();
    const { error: insertError } = await adminClient
      .from('frame_types')
      .insert({
        id: frameTypeId,
        name,
        description: description || `${name} frame option`
      });
    
    if (insertError) {
      console.error('Error creating frame type:', insertError);
      return NextResponse.json(
        { error: `Failed to create frame type: ${insertError.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Successfully created frame type',
      id: frameTypeId
    });
  } catch (error) {
    console.error('Error in frame type API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
