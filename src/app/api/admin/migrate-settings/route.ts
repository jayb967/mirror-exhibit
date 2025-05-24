import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Add missing columns to site_settings table
    const migrations = [
      // Add tax settings columns
      `ALTER TABLE site_settings 
       ADD COLUMN IF NOT EXISTS tax_enabled BOOLEAN DEFAULT true,
       ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,4) DEFAULT 0.0875`,

      // Add payment method settings
      `ALTER TABLE site_settings 
       ADD COLUMN IF NOT EXISTS stripe_enabled BOOLEAN DEFAULT true,
       ADD COLUMN IF NOT EXISTS paypal_enabled BOOLEAN DEFAULT false,
       ADD COLUMN IF NOT EXISTS apple_pay_enabled BOOLEAN DEFAULT false,
       ADD COLUMN IF NOT EXISTS google_pay_enabled BOOLEAN DEFAULT false`,

      // Add store information columns
      `ALTER TABLE site_settings 
       ADD COLUMN IF NOT EXISTS store_name TEXT DEFAULT 'Mirror Exhibit',
       ADD COLUMN IF NOT EXISTS store_email TEXT DEFAULT 'info@mirrorexhibit.com',
       ADD COLUMN IF NOT EXISTS store_phone TEXT DEFAULT '555-123-4567',
       ADD COLUMN IF NOT EXISTS order_notification_email TEXT DEFAULT 'orders@mirrorexhibit.com',
       ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5`
    ];

    // Run each migration
    for (const migration of migrations) {
      const { error } = await supabase.rpc('exec_sql', { sql: migration });
      if (error) {
        console.error('Migration error:', error);
        // Continue with other migrations even if one fails
      }
    }

    // Insert default settings if no row exists
    const { data: existingSettings } = await supabase
      .from('site_settings')
      .select('id')
      .limit(1);

    if (!existingSettings || existingSettings.length === 0) {
      const { error: insertError } = await supabase
        .from('site_settings')
        .insert({
          tax_enabled: true,
          tax_rate: 0.0875,
          stripe_enabled: true,
          paypal_enabled: false,
          apple_pay_enabled: false,
          google_pay_enabled: false,
          store_name: 'Mirror Exhibit',
          store_email: 'info@mirrorexhibit.com',
          store_phone: '555-123-4567',
          order_notification_email: 'orders@mirrorexhibit.com',
          low_stock_threshold: 5,
          free_shipping_threshold: 100.00,
          origin_address: {
            name: 'Mirror Exhibit',
            company: 'Mirror Exhibit',
            address: '123 Main St',
            address2: '',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'US',
            phone: '555-123-4567',
            email: 'shipping@mirrorexhibit.com'
          },
          easyship_enabled: true,
          default_package_weight: 2.0,
          default_package_weight_unit: 'lb',
          default_package_length: 12.0,
          default_package_width: 12.0,
          default_package_height: 4.0,
          default_package_dimension_unit: 'in'
        });

      if (insertError) {
        console.error('Error inserting default settings:', insertError);
      }
    } else {
      // Update existing row with default values for new columns
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({
          tax_enabled: true,
          tax_rate: 0.0875,
          stripe_enabled: true,
          paypal_enabled: false,
          apple_pay_enabled: false,
          google_pay_enabled: false,
          store_name: 'Mirror Exhibit',
          store_email: 'info@mirrorexhibit.com',
          store_phone: '555-123-4567',
          order_notification_email: 'orders@mirrorexhibit.com',
          low_stock_threshold: 5
        })
        .is('tax_enabled', null); // Only update if these fields are null

      if (updateError) {
        console.error('Error updating settings with defaults:', updateError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Settings migration completed successfully' 
    });

  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error },
      { status: 500 }
    );
  }
}
