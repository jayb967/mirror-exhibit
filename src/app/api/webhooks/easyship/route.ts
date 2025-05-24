import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * Webhook handler for Easyship shipping updates
 * 
 * This endpoint receives webhook notifications from Easyship when a shipment status changes.
 * It updates the order status in the database based on the shipping status.
 * 
 * Webhook payload example:
 * {
 *   "event": "shipment.status_updated",
 *   "data": {
 *     "shipment_id": "shp_123456",
 *     "tracking_number": "1Z999AA10123456789",
 *     "status": "in_transit",
 *     "previous_status": "label_created",
 *     "estimated_delivery_date": "2023-06-15T00:00:00Z",
 *     "tracking_events": [
 *       {
 *         "date": "2023-06-10T14:30:00Z",
 *         "location": "New York, NY",
 *         "message": "Package picked up",
 *         "status": "in_transit"
 *       }
 *     ],
 *     "metadata": {
 *       "order_id": "123456"
 *     }
 *   }
 * }
 */
export async function POST(req: Request) {
  try {
    // Verify webhook signature (in a production environment)
    // This would involve checking the signature in the request headers
    // against a signature generated using the webhook payload and a shared secret
    
    // Get request body
    const body = await req.json();
    
    // Validate webhook payload
    if (!body.event || !body.data) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }
    
    // Only process shipment status updates
    if (body.event !== 'shipment.status_updated') {
      return NextResponse.json({ success: true });
    }
    
    const {
      shipment_id,
      tracking_number,
      status,
      previous_status,
      estimated_delivery_date,
      tracking_events,
      metadata
    } = body.data;
    
    // Get order ID from metadata
    const orderId = metadata?.order_id;
    
    if (!orderId) {
      // If no order ID in metadata, try to find order by tracking number
      const supabase = createRouteHandlerClient({ cookies });
      
      const { data: order, error } = await supabase
        .from('orders')
        .select('id')
        .eq('tracking_number', tracking_number)
        .single();
      
      if (error || !order) {
        console.error('Order not found for tracking number:', tracking_number);
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      
      // Update order status based on shipping status
      await updateOrderStatus(order.id, status, tracking_events);
    } else {
      // Update order status based on shipping status
      await updateOrderStatus(orderId, status, tracking_events);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Easyship webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Update order status based on shipping status
 * @param orderId Order ID
 * @param shippingStatus Shipping status from Easyship
 * @param trackingEvents Tracking events from Easyship
 */
async function updateOrderStatus(
  orderId: string,
  shippingStatus: string,
  trackingEvents: any[]
) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Map shipping status to order status
  let orderStatus = 'processing';
  
  switch (shippingStatus.toLowerCase()) {
    case 'label_created':
      orderStatus = 'processing';
      break;
    case 'in_transit':
      orderStatus = 'shipped';
      break;
    case 'out_for_delivery':
      orderStatus = 'out_for_delivery';
      break;
    case 'delivered':
      orderStatus = 'delivered';
      break;
    case 'exception':
    case 'failed_delivery':
      orderStatus = 'delivery_failed';
      break;
    case 'returned':
      orderStatus = 'returned';
      break;
    default:
      orderStatus = 'processing';
  }
  
  // Update order status
  const { error } = await supabase
    .from('orders')
    .update({
      status: orderStatus,
      shipping_status: shippingStatus,
      shipping_events: trackingEvents,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);
  
  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
  
  // If delivered, update order completion date
  if (shippingStatus.toLowerCase() === 'delivered') {
    await supabase
      .from('orders')
      .update({
        completed_at: new Date().toISOString()
      })
      .eq('id', orderId);
  }
  
  // Send notification to customer (in a real implementation)
  // This would involve sending an email or push notification
  // to the customer about the status update
}
