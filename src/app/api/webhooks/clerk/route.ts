import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(req: NextRequest) {
  try {
    // Get the headers
    const headerPayload = req.headers;
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
    }

    // Get the body
    const payload = await req.text();
    const body = JSON.parse(payload);

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

    let evt;

    // Verify the payload with the headers
    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the webhook
    const { type, data } = evt;

    console.log(`Clerk webhook received: ${type}`);

    switch (type) {
      case 'user.created': {
        // Create a profile for the new user
        const userId = data.id;
        const email = data.email_addresses?.[0]?.email_address;
        const firstName = data.first_name;
        const lastName = data.last_name;

        console.log('Creating profile for new user:', { userId, email, firstName, lastName });

        // Insert into profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            role: 'customer',
            first_name: firstName,
            last_name: lastName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't return error - we want to continue processing other webhooks
        } else {
          console.log('Profile created successfully for user:', userId);
        }

        // Create notification preferences for the user
        try {
          const { error: notificationError } = await supabase
            .rpc('create_user_notification_preferences', { user_uuid: userId });

          if (notificationError) {
            console.error('Error creating notification preferences:', notificationError);
          } else {
            console.log('Notification preferences created for user:', userId);
          }
        } catch (error) {
          console.error('Error calling notification preferences function:', error);
        }

        break;
      }

      case 'user.updated': {
        // Update the user's profile
        const userId = data.id;
        const email = data.email_addresses?.[0]?.email_address;
        const firstName = data.first_name;
        const lastName = data.last_name;

        console.log('Updating profile for user:', { userId, email, firstName, lastName });

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            email: email,
            first_name: firstName,
            last_name: lastName,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating profile:', updateError);
        } else {
          console.log('Profile updated successfully for user:', userId);
        }

        break;
      }

      case 'user.deleted': {
        // Delete the user's profile (cascade will handle related data)
        const userId = data.id;

        console.log('Deleting profile for user:', userId);

        const { error: deleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (deleteError) {
          console.error('Error deleting profile:', deleteError);
        } else {
          console.log('Profile deleted successfully for user:', userId);
        }

        break;
      }

      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return NextResponse.json({ message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Error processing Clerk webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
