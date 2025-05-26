import { createServiceRoleSupabaseClient } from '@/utils/clerk-supabase';
import { emailService } from './emailService';

export type NotificationType =
  | 'order_confirmation'
  | 'order_status_update'
  | 'payment_confirmation'
  | 'shipping_notification'
  | 'delivery_confirmation'
  | 'admin_new_order'
  | 'admin_low_stock'
  | 'admin_system_alert'
  | 'user_welcome'
  | 'cart_abandonment'
  | 'promotional'
  | 'system_maintenance';

export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  data?: Record<string, any>;
  expiresAt?: Date;
}

export interface CreateNotificationOptions {
  userId?: string;
  adminOnly?: boolean;
  sendEmail?: boolean;
  emailTemplate?: string;
  emailData?: Record<string, any>;
  priority?: number;
}

export interface NotificationPreferences {
  user_id: string;
  email_order_updates: boolean;
  email_shipping_updates: boolean;
  email_promotional: boolean;
  email_system_updates: boolean;
  in_app_order_updates: boolean;
  in_app_shipping_updates: boolean;
  in_app_promotional: boolean;
  in_app_system_updates: boolean;
  unsubscribed_all: boolean;
}

class NotificationService {
  private supabase = createServiceRoleSupabaseClient();

  /**
   * Create a new notification
   */
  async createNotification(
    notificationData: NotificationData,
    options: CreateNotificationOptions = {}
  ): Promise<{ success: boolean; notificationId?: string; error?: string }> {
    try {
      const supabase = this.supabase;

      // Create in-app notification
      const notification = {
        user_id: options.userId || null,
        admin_only: options.adminOnly || false,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        action_url: notificationData.actionUrl,
        data: notificationData.data,
        expires_at: notificationData.expiresAt?.toISOString(),
        is_read: false,
        is_archived: false
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select('id')
        .single();

      if (error) throw error;

      const notificationId = data.id;

      // Send email if requested and user has email preferences enabled
      if (options.sendEmail && options.emailTemplate && options.userId) {
        await this.sendEmailNotification(
          options.userId,
          notificationData.type,
          options.emailTemplate,
          options.emailData || {},
          options.priority
        );
      }

      return {
        success: true,
        notificationId
      };
    } catch (error: any) {
      console.error('Create notification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create notification'
      };
    }
  }

  /**
   * Send email notification based on user preferences
   */
  private async sendEmailNotification(
    userId: string,
    notificationType: NotificationType,
    templateKey: string,
    templateData: Record<string, any>,
    priority?: number
  ): Promise<void> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      if (!preferences || preferences.unsubscribed_all) {
        return; // User has unsubscribed from all emails
      }

      // Check if user wants this type of email
      const shouldSendEmail = this.shouldSendEmailForType(notificationType, preferences);
      if (!shouldSendEmail) {
        return;
      }

      // Get user email from Clerk (you'll need to implement this based on your Clerk setup)
      const userEmail = await this.getUserEmail(userId);
      if (!userEmail) {
        console.warn(`No email found for user ${userId}`);
        return;
      }

      // Send email
      await emailService.sendTemplateEmail(
        templateKey,
        userEmail,
        templateData,
        { priority }
      );
    } catch (error) {
      console.error('Send email notification error:', error);
    }
  }

  /**
   * Check if user should receive email for notification type
   */
  private shouldSendEmailForType(type: NotificationType, preferences: NotificationPreferences): boolean {
    switch (type) {
      case 'order_confirmation':
      case 'order_status_update':
      case 'payment_confirmation':
        return preferences.email_order_updates;

      case 'shipping_notification':
      case 'delivery_confirmation':
        return preferences.email_shipping_updates;

      case 'promotional':
      case 'cart_abandonment':
        return preferences.email_promotional;

      case 'system_maintenance':
      case 'user_welcome':
        return preferences.email_system_updates;

      default:
        return false;
    }
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const supabase = this.supabase;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Get user preferences error:', error);
      return null;
    }
  }

  /**
   * Create default notification preferences for new user
   */
  async createDefaultPreferences(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = this.supabase;

      const { error } = await supabase.rpc('create_user_notification_preferences', {
        user_uuid: userId
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Create default preferences error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create default preferences'
      };
    }
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<Omit<NotificationPreferences, 'user_id'>>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = this.supabase;

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Update user preferences error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update preferences'
      };
    }
  }

  /**
   * Get notifications for user
   */
  async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      includeArchived?: boolean;
    } = {}
  ): Promise<{
    notifications: any[];
    total: number;
    unreadCount: number;
  }> {
    try {
      const supabase = this.supabase;
      const { limit = 20, offset = 0, unreadOnly = false, includeArchived = false } = options;

      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      if (!includeArchived) {
        query = query.eq('is_archived', false);
      }

      // Check for expired notifications
      query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      const { data, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Get unread count
      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_read', false)
        .eq('is_archived', false)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      return {
        notifications: data || [],
        total: count || 0,
        unreadCount: unreadCount || 0
      };
    } catch (error) {
      console.error('Get user notifications error:', error);
      return {
        notifications: [],
        total: 0,
        unreadCount: 0
      };
    }
  }

  /**
   * Get admin notifications
   */
  async getAdminNotifications(
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    } = {}
  ): Promise<{
    notifications: any[];
    total: number;
    unreadCount: number;
  }> {
    try {
      const supabase = this.supabase;
      const { limit = 20, offset = 0, unreadOnly = false } = options;

      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('admin_only', true)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      // Check for expired notifications
      query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      const { data, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Get unread count
      const { count: unreadCount } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('admin_only', true)
        .eq('is_read', false)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      return {
        notifications: data || [],
        total: count || 0,
        unreadCount: unreadCount || 0
      };
    } catch (error) {
      console.error('Get admin notifications error:', error);
      return {
        notifications: [],
        total: 0,
        unreadCount: 0
      };
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = this.supabase;

      let query = supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { error } = await query;

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Mark as read error:', error);
      return {
        success: false,
        error: error.message || 'Failed to mark notification as read'
      };
    }
  }

  /**
   * Archive notification
   */
  async archiveNotification(notificationId: string, userId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = this.supabase;

      let query = supabase
        .from('notifications')
        .update({ is_archived: true })
        .eq('id', notificationId);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { error } = await query;

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Archive notification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to archive notification'
      };
    }
  }

  /**
   * Get user email from Clerk (implement based on your Clerk setup)
   */
  private async getUserEmail(userId: string): Promise<string | null> {
    try {
      // TODO: Implement Clerk user email retrieval
      // This will depend on how you're integrating with Clerk
      // You might need to call Clerk's API or use their SDK

      // For now, return null - you'll need to implement this
      // based on your Clerk integration
      return null;
    } catch (error) {
      console.error('Get user email error:', error);
      return null;
    }
  }
}

export const notificationService = new NotificationService();
