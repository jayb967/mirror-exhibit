// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/utils/clerk-supabase';

/**
 * Get all shipping rules
 */
export async function GET(req: Request) {
  try {
    // Create Supabase client
    const supabase = await createServerSupabaseClient();
    
    // Get active shipping rules
    const { data, error } = await supabase
      .from('shipping_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });
    
    if (error) {
      console.error('Error fetching shipping rules:', error);
      return NextResponse.json(
        { error: 'Failed to fetch shipping rules' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ rules: data });
  } catch (error) {
    console.error('Error in shipping rules API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Create a new shipping rule (admin only)
 */
export async function POST(req: Request) {
  try {
    // Get request body
    const body = await req.json();
    const {
      name,
      description,
      ruleType,
      thresholdAmount,
      categoryId,
      productId,
      countryCodes,
      isActive,
      startDate,
      endDate,
      priority
    } = body;
    
    // Validate required fields
    if (!name || !ruleType) {
      return NextResponse.json(
        { error: 'Name and rule type are required' },
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
    
    // Create the shipping rule
    const { data, error } = await supabase
      .from('shipping_rules')
      .insert({
        name,
        description,
        rule_type: ruleType,
        threshold_amount: thresholdAmount,
        category_id: categoryId,
        product_id: productId,
        country_codes: countryCodes,
        is_active: isActive !== undefined ? isActive : true,
        start_date: startDate,
        end_date: endDate,
        priority: priority || 0
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating shipping rule:', error);
      return NextResponse.json(
        { error: 'Failed to create shipping rule' },
        { status: 500 }
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
 * Update a shipping rule (admin only)
 */
export async function PUT(req: Request) {
  try {
    // Get request body
    const body = await req.json();
    const {
      id,
      name,
      description,
      ruleType,
      thresholdAmount,
      categoryId,
      productId,
      countryCodes,
      isActive,
      startDate,
      endDate,
      priority
    } = body;
    
    // Validate required fields
    if (!id || !name || !ruleType) {
      return NextResponse.json(
        { error: 'ID, name, and rule type are required' },
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
    
    // Update the shipping rule
    const { data, error } = await supabase
      .from('shipping_rules')
      .update({
        name,
        description,
        rule_type: ruleType,
        threshold_amount: thresholdAmount,
        category_id: categoryId,
        product_id: productId,
        country_codes: countryCodes,
        is_active: isActive,
        start_date: startDate,
        end_date: endDate,
        priority: priority,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating shipping rule:', error);
      return NextResponse.json(
        { error: 'Failed to update shipping rule' },
        { status: 500 }
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
