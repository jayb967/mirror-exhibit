import { createServerSupabaseClient } from '@/utils/clerk-supabase';
import { notificationService } from './notificationService';
import { emailService } from './emailService';

export interface TrackingEvent {
  event_type: string;
  event_description: string;
  event_location?: string;
  event_timestamp: string;
  source?: string;
  external_event_id?: string;
  metadata?: Record<string, any>;
}

export interface OrderStatusUpdate {
  orderId: string;
  newStatus: string;
  previousStatus?: string;
  changedBy?: string;
  changeReason?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  carrierName?: string;
  estimatedDelivery?: string;
  metadata?: Record<string, any>;
}

export interface FulfillmentData {
  orderId: string;
  assignedTo?: string;
  packageWeight?: number;
  packageDimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  shippingCarrierId?: string;
  shippingService?: string;
  packingNotes?: string;
  shippingNotes?: string;
  easyshipShipmentId?: string;
  easyshipRateId?: string;
}

class OrderTrackingService {
  private supabase = createServerSupabaseClient();

  /**
   * Update order status with notifications
   */
  async updateOrderStatus(update: OrderStatusUpdate): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const supabase = await this.supabase;

      // Get current order data
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', update.orderId)
        .single();

      if (orderError || !order) {
        throw new Error('Order not found');
      }

      const previousStatus = order.status;

      // Update order
      const updateData: any = {
        status: update.newStatus,
        updated_at: new Date().toISOString()
      };

      if (update.trackingNumber) {
        updateData.tracking_number = update.trackingNumber;
      }

      if (update.trackingUrl) {
        updateData.tracking_url = update.trackingUrl;
      }

      if (update.carrierName) {
        updateData.courier_name = update.carrierName;
      }

      if (update.estimatedDelivery) {
        updateData.estimated_delivery_date = update.estimatedDelivery;
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', update.orderId);

      if (updateError) throw updateError;

      // Record status change in history
      await this.recordStatusChange(
        update.orderId,
        previousStatus,
        update.newStatus,
        update.changedBy,
        update.changeReason,
        update.metadata
      );

      // Send notifications based on status
      await this.sendStatusNotifications(order, update.newStatus, {
        trackingNumber: update.trackingNumber,
        trackingUrl: update.trackingUrl,
        carrierName: update.carrierName,
        estimatedDelivery: update.estimatedDelivery
      });

      return { success: true };
    } catch (error: any) {
      console.error('Update order status error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update order status'
      };
    }
  }

  /**
   * Add tracking event
   */
  async addTrackingEvent(orderId: string, event: TrackingEvent): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const supabase = await this.supabase;

      await supabase
        .from('shipping_tracking_events')
        .insert({
          order_id: orderId,
          ...event
        });

      // Update order status based on tracking event if needed
      const statusMapping = this.getStatusFromTrackingEvent(event.event_type);
      if (statusMapping) {
        await this.updateOrderStatus({
          orderId,
          newStatus: statusMapping,
          changeReason: `Tracking event: ${event.event_type}`,
          metadata: { tracking_event: event }
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('Add tracking event error:', error);
      return {
        success: false,
        error: error.message || 'Failed to add tracking event'
      };
    }
  }

  /**
   * Get order tracking information
   */
  async getOrderTracking(orderId: string): Promise<{
    order: any;
    events: TrackingEvent[];
    statusHistory: any[];
    fulfillment?: any;
  } | null> {
    try {
      const supabase = await this.supabase;

      // Get order with basic tracking info
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return null;
      }

      // Get tracking events
      const { data: events } = await supabase
        .from('shipping_tracking_events')
        .select('*')
        .eq('order_id', orderId)
        .order('event_timestamp', { ascending: false });

      // Get status history
      const { data: statusHistory } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      // Get fulfillment info
      const { data: fulfillment } = await supabase
        .from('order_fulfillment')
        .select(`
          *,
          shipping_carrier:shipping_carriers(name, code, tracking_url_template)
        `)
        .eq('order_id', orderId)
        .single();

      return {
        order,
        events: events || [],
        statusHistory: statusHistory || [],
        fulfillment
      };
    } catch (error) {
      console.error('Get order tracking error:', error);
      return null;
    }
  }

  /**
   * Create or update fulfillment record
   */
  async updateFulfillment(fulfillmentData: FulfillmentData): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const supabase = await this.supabase;

      const data: any = {
        order_id: fulfillmentData.orderId,
        updated_at: new Date().toISOString()
      };

      if (fulfillmentData.assignedTo) {
        data.assigned_to = fulfillmentData.assignedTo;
        data.assigned_at = new Date().toISOString();
      }

      if (fulfillmentData.packageWeight) {
        data.package_weight = fulfillmentData.packageWeight;
      }

      if (fulfillmentData.packageDimensions) {
        data.package_length = fulfillmentData.packageDimensions.length;
        data.package_width = fulfillmentData.packageDimensions.width;
        data.package_height = fulfillmentData.packageDimensions.height;
        data.package_dimension_unit = fulfillmentData.packageDimensions.unit;
      }

      if (fulfillmentData.shippingCarrierId) {
        data.shipping_carrier_id = fulfillmentData.shippingCarrierId;
      }

      if (fulfillmentData.shippingService) {
        data.shipping_service = fulfillmentData.shippingService;
      }

      if (fulfillmentData.packingNotes) {
        data.packing_notes = fulfillmentData.packingNotes;
      }

      if (fulfillmentData.shippingNotes) {
        data.shipping_notes = fulfillmentData.shippingNotes;
      }

      if (fulfillmentData.easyshipShipmentId) {
        data.easyship_shipment_id = fulfillmentData.easyshipShipmentId;
      }

      if (fulfillmentData.easyshipRateId) {
        data.easyship_rate_id = fulfillmentData.easyshipRateId;
      }

      const { error } = await supabase
        .from('order_fulfillment')
        .upsert(data);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Update fulfillment error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update fulfillment'
      };
    }
  }

  /**
   * Add order note
   */
  async addOrderNote(
    orderId: string,
    noteContent: string,
    options: {
      noteType?: string;
      isCustomerVisible?: boolean;
      createdBy?: string;
    } = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await this.supabase;

      await supabase
        .from('order_notes')
        .insert({
          order_id: orderId,
          note_content: noteContent,
          note_type: options.noteType || 'internal',
          is_customer_visible: options.isCustomerVisible || false,
          created_by: options.createdBy
        });

      return { success: true };
    } catch (error: any) {
      console.error('Add order note error:', error);
      return {
        success: false,
        error: error.message || 'Failed to add order note'
      };
    }
  }

  /**
   * Get order notes
   */
  async getOrderNotes(orderId: string, customerVisible?: boolean): Promise<any[]> {
    try {
      const supabase = await this.supabase;

      let query = supabase
        .from('order_notes')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (customerVisible !== undefined) {
        query = query.eq('is_customer_visible', customerVisible);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Get order notes error:', error);
      return [];
    }
  }

  /**
   * Record status change in history
   */
  private async recordStatusChange(
    orderId: string,
    previousStatus: string,
    newStatus: string,
    changedBy?: string,
    changeReason?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const supabase = await this.supabase;

      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          previous_status: previousStatus,
          new_status: newStatus,
          changed_by: changedBy,
          change_reason: changeReason,
          metadata
        });
    } catch (error) {
      console.error('Record status change error:', error);
    }
  }

  /**
   * Send notifications based on status change
   */
  private async sendStatusNotifications(
    order: any,
    newStatus: string,
    trackingInfo: {
      trackingNumber?: string;
      trackingUrl?: string;
      carrierName?: string;
      estimatedDelivery?: string;
    }
  ): Promise<void> {
    try {
      const orderNumber = order.id.substring(0, 8);

      switch (newStatus) {
        case 'confirmed':
          if (order.user_id) {
            await notificationService.createNotification({
              type: 'order_confirmation',
              title: 'Order Confirmed',
              message: `Your order #${orderNumber} has been confirmed and is being prepared.`,
              actionUrl: `/dashboard/orders/${order.id}`
            }, {
              userId: order.user_id,
              sendEmail: true,
              emailTemplate: 'order_confirmation',
              emailData: {
                customer_name: order.shipping_address?.first_name || 'Customer',
                order_number: orderNumber,
                order_date: new Date(order.created_at).toLocaleDateString(),
                total_amount: order.total_amount
              }
            });
          }
          break;

        case 'shipped':
          if (order.user_id && trackingInfo.trackingNumber) {
            await notificationService.createNotification({
              type: 'shipping_notification',
              title: 'Order Shipped',
              message: `Your order #${orderNumber} has been shipped! Tracking: ${trackingInfo.trackingNumber}`,
              actionUrl: `/dashboard/orders/${order.id}`
            }, {
              userId: order.user_id,
              sendEmail: true,
              emailTemplate: 'order_shipped',
              emailData: {
                customer_name: order.shipping_address?.first_name || 'Customer',
                order_number: orderNumber,
                tracking_number: trackingInfo.trackingNumber,
                carrier_name: trackingInfo.carrierName || 'Carrier',
                estimated_delivery: trackingInfo.estimatedDelivery || 'TBD',
                tracking_url: trackingInfo.trackingUrl || '#'
              }
            });
          }
          break;

        case 'delivered':
          if (order.user_id) {
            await notificationService.createNotification({
              type: 'delivery_confirmation',
              title: 'Order Delivered',
              message: `Your order #${orderNumber} has been delivered!`,
              actionUrl: `/dashboard/orders/${order.id}`
            }, {
              userId: order.user_id,
              sendEmail: true,
              emailTemplate: 'order_delivered',
              emailData: {
                customer_name: order.shipping_address?.first_name || 'Customer',
                order_number: orderNumber,
                delivery_date: new Date().toLocaleDateString(),
                delivery_address: `${order.shipping_address?.address}, ${order.shipping_address?.city}, ${order.shipping_address?.state}`
              }
            });
          }
          break;

        default:
          // Send generic status update
          if (order.user_id) {
            await notificationService.createNotification({
              type: 'order_status_update',
              title: 'Order Status Update',
              message: `Your order #${orderNumber} status has been updated to: ${newStatus}`,
              actionUrl: `/dashboard/orders/${order.id}`
            }, {
              userId: order.user_id,
              sendEmail: true,
              emailTemplate: 'order_status_update',
              emailData: {
                customer_name: order.shipping_address?.first_name || 'Customer',
                order_number: orderNumber,
                new_status: newStatus,
                update_date: new Date().toLocaleDateString()
              }
            });
          }
          break;
      }
    } catch (error) {
      console.error('Send status notifications error:', error);
    }
  }

  /**
   * Map tracking event to order status
   */
  private getStatusFromTrackingEvent(eventType: string): string | null {
    const mapping: Record<string, string> = {
      'label_created': 'processing',
      'in_transit': 'shipped',
      'out_for_delivery': 'out_for_delivery',
      'delivered': 'delivered',
      'exception': 'shipped', // Keep as shipped but note the exception
      'failed_delivery': 'shipped'
    };

    return mapping[eventType.toLowerCase()] || null;
  }
}

export const orderTrackingService = new OrderTrackingService();
