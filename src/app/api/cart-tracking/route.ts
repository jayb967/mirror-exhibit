// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create service role client to bypass RLS policies
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'track':
        return await handleTrackCart(data);
      case 'update':
        return await handleUpdateCart(data);
      case 'convert_guest':
        return await handleConvertGuest(data);
      case 'increment_marketing_email':
        return await handleIncrementMarketingEmail(data);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Cart tracking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guestToken = searchParams.get('guest_token');
    const userId = searchParams.get('user_id');

    if (!guestToken && !userId) {
      return NextResponse.json(
        { error: 'Either guest_token or user_id is required' },
        { status: 400 }
      );
    }

    let query = supabaseServiceRole.from('cart_tracking').select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (guestToken) {
      query = query.eq('guest_token', guestToken);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching cart tracking:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cart tracking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || null });
  } catch (error) {
    console.error('Cart tracking GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleTrackCart(data: any) {
  try {
    const {
      user_id,
      guest_token,
      email,
      cart_items,
      subtotal,
      checkout_started = false,
      checkout_completed = false
    } = data;

    // Prepare tracking data
    const trackingData = {
      user_id: user_id || null,
      guest_token: !user_id ? guest_token : null,
      email: email || null,
      cart_items,
      subtotal,
      last_activity: new Date().toISOString(),
      checkout_started,
      checkout_completed,
      recovery_email_sent: false,
      is_anonymous: !user_id && !!guest_token,
      ...data.metadata // Include any additional metadata
    };

    // Check if record exists
    let existingRecord = null;
    if (user_id) {
      const { data } = await supabaseServiceRole
        .from('cart_tracking')
        .select('id')
        .eq('user_id', user_id)
        .single();
      existingRecord = data;
    } else if (guest_token) {
      const { data } = await supabaseServiceRole
        .from('cart_tracking')
        .select('id')
        .eq('guest_token', guest_token)
        .single();
      existingRecord = data;
    }

    if (existingRecord) {
      // Update existing record
      const { data, error } = await supabaseServiceRole
        .from('cart_tracking')
        .update({
          ...trackingData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecord.id)
        .select('id')
        .single();

      if (error) {
        console.error('Error updating cart tracking:', error);
        return NextResponse.json(
          { error: 'Failed to update cart tracking' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, id: data.id, action: 'updated' });
    } else {
      // Insert new record
      const { data, error } = await supabaseServiceRole
        .from('cart_tracking')
        .insert({
          ...trackingData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating cart tracking:', error);
        return NextResponse.json(
          { error: 'Failed to create cart tracking' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, id: data.id, action: 'created' });
    }
  } catch (error) {
    console.error('Error in handleTrackCart:', error);
    return NextResponse.json(
      { error: 'Failed to track cart' },
      { status: 500 }
    );
  }
}

async function handleUpdateCart(data: any) {
  try {
    const { id, guest_token, user_id, ...updateData } = data;

    // First, check if record exists
    let existingRecord = null;
    if (id) {
      const { data } = await supabaseServiceRole
        .from('cart_tracking')
        .select('id')
        .eq('id', id)
        .single();
      existingRecord = data;
    } else if (user_id) {
      const { data } = await supabaseServiceRole
        .from('cart_tracking')
        .select('id')
        .eq('user_id', user_id)
        .single();
      existingRecord = data;
    } else if (guest_token) {
      const { data } = await supabaseServiceRole
        .from('cart_tracking')
        .select('id')
        .eq('guest_token', guest_token)
        .single();
      existingRecord = data;
    } else {
      return NextResponse.json(
        { error: 'Either id, user_id, or guest_token is required' },
        { status: 400 }
      );
    }

    if (existingRecord) {
      // Update existing record
      let query = supabaseServiceRole.from('cart_tracking').update({
        ...updateData,
        updated_at: new Date().toISOString()
      });

      if (id) {
        query = query.eq('id', id);
      } else if (user_id) {
        query = query.eq('user_id', user_id);
      } else if (guest_token) {
        query = query.eq('guest_token', guest_token);
      }

      const { error } = await query;

      if (error) {
        console.error('Error updating cart tracking:', error);
        return NextResponse.json(
          { error: 'Failed to update cart tracking' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, action: 'updated' });
    } else {
      // Record doesn't exist, create it
      const insertData = {
        user_id: user_id || null,
        guest_token: guest_token || null,
        cart_items: [],
        subtotal: 0,
        last_activity: new Date().toISOString(),
        checkout_started: false,
        checkout_completed: false,
        recovery_email_sent: false,
        is_anonymous: !user_id && !!guest_token,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updateData
      };

      const { data, error } = await supabaseServiceRole
        .from('cart_tracking')
        .insert(insertData)
        .select('id')
        .single();

      if (error) {
        console.error('Error creating cart tracking record:', error);
        return NextResponse.json(
          { error: 'Failed to create cart tracking record' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, action: 'created', id: data.id });
    }
  } catch (error) {
    console.error('Error in handleUpdateCart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

async function handleConvertGuest(data: any) {
  try {
    const { guest_token, clerk_user_id } = data;

    if (!guest_token || !clerk_user_id) {
      return NextResponse.json(
        { error: 'Both guest_token and clerk_user_id are required' },
        { status: 400 }
      );
    }

    // Update cart_tracking record to convert guest to user
    const { error } = await supabaseServiceRole
      .from('cart_tracking')
      .update({
        user_id: clerk_user_id,
        guest_token: null,
        is_anonymous: false,
        updated_at: new Date().toISOString()
      })
      .eq('guest_token', guest_token);

    if (error) {
      console.error('Error converting guest cart:', error);
      return NextResponse.json(
        { error: 'Failed to convert guest cart' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in handleConvertGuest:', error);
    return NextResponse.json(
      { error: 'Failed to convert guest cart' },
      { status: 500 }
    );
  }
}

async function handleIncrementMarketingEmail(data: any) {
  try {
    const { user_id, guest_token, email } = data;

    if (!user_id && !guest_token && !email) {
      return NextResponse.json(
        { error: 'Either user_id, guest_token, or email is required' },
        { status: 400 }
      );
    }

    // Find the record to update
    let query = supabaseServiceRole.from('cart_tracking').select('marketing_emails_sent');

    if (user_id) {
      query = query.eq('user_id', user_id);
    } else if (guest_token) {
      query = query.eq('guest_token', guest_token);
    } else if (email) {
      query = query.eq('email', email);
    }

    const { data: existingRecord, error: fetchError } = await query.single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching cart tracking record:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch cart tracking record' },
        { status: 500 }
      );
    }

    const currentCount = existingRecord?.marketing_emails_sent || 0;
    const newCount = currentCount + 1;

    // Update the record
    let updateQuery = supabaseServiceRole.from('cart_tracking').update({
      marketing_emails_sent: newCount,
      last_marketing_email_sent: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (user_id) {
      updateQuery = updateQuery.eq('user_id', user_id);
    } else if (guest_token) {
      updateQuery = updateQuery.eq('guest_token', guest_token);
    } else if (email) {
      updateQuery = updateQuery.eq('email', email);
    }

    const { error: updateError } = await updateQuery;

    if (updateError) {
      console.error('Error incrementing marketing email count:', updateError);
      return NextResponse.json(
        { error: 'Failed to increment marketing email count' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      marketing_emails_sent: newCount
    });
  } catch (error) {
    console.error('Error in handleIncrementMarketingEmail:', error);
    return NextResponse.json(
      { error: 'Failed to increment marketing email count' },
      { status: 500 }
    );
  }
}
