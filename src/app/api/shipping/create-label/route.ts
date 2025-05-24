// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/utils/clerk-supabase';
import { shippingService, ShippingAddress, PackageDetails } from '@/services/shippingService';

/**
 * Create a shipping label
 * 
 * Request body:
 * {
 *   orderId: string;
 *   address: ShippingAddress;
 *   packages: PackageDetails[];
 *   courierId: string;
 * }
 * 
 * Response:
 * {
 *   shipmentId: string;
 *   trackingNumber: string;
 *   labelUrl: string;
 *   status: string;
 * }
 */
export async function POST(req: Request) {
  try {
    // Get request body
    const body = await req.json();
    const { orderId, address, packages, courierId } = body;
    
    // Validate request
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    if (!address || !address.country) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }
    
    if (!courierId) {
      return NextResponse.json(
        { error: 'Courier ID is required' },
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
    
    // Check if order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Create shipment
    const shipment = await shippingService.createShipment(
      orderId,
      address,
      packages,
      courierId
    );
    
    // Update order with tracking information
    await supabase
      .from('orders')
      .update({
        tracking_number: shipment.trackingNumber,
        shipping_label_url: shipment.labelUrl,
        courier_id: courierId,
        status: 'shipped',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
    
    return NextResponse.json(shipment);
  } catch (error) {
    console.error('Error creating shipping label:', error);
    return NextResponse.json(
      { error: 'Failed to create shipping label' },
      { status: 500 }
    );
  }
}
