import sgMail from '@sendgrid/mail';
import { createServerSupabaseClient } from '@/utils/clerk-supabase';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailTemplate {
  id: string;
  template_key: string;
  name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  variables: string[];
  sendgrid_template_id?: string;
}

export interface EmailData {
  to: string;
  toName?: string;
  from?: string;
  fromName?: string;
  subject: string;
  html?: string;
  text?: string;
  templateKey?: string;
  templateData?: Record<string, any>;
  priority?: number;
}

export interface EmailQueueItem {
  id: string;
  to_email: string;
  to_name?: string;
  from_email?: string;
  from_name?: string;
  subject: string;
  html_content?: string;
  text_content?: string;
  template_id?: string;
  template_data?: Record<string, any>;
  priority: number;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  attempt_count: number;
  max_attempts: number;
  scheduled_at: string;
  error_message?: string;
  sendgrid_message_id?: string;
}

class EmailService {
  private supabase = createServerSupabaseClient();
  private defaultFrom = process.env.SENDGRID_FROM_EMAIL || 'noreply@mirrorexhibit.com';
  private defaultFromName = process.env.SENDGRID_FROM_NAME || 'Mirror Exhibit';

  /**
   * Send email immediately using SendGrid
   */
  async sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SendGrid API key not configured');
      }

      const msg = {
        to: {
          email: emailData.to,
          name: emailData.toName
        },
        from: {
          email: emailData.from || this.defaultFrom,
          name: emailData.fromName || this.defaultFromName
        },
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      };

      const [response] = await sgMail.send(msg);

      return {
        success: true,
        messageId: response.headers['x-message-id'] as string
      };
    } catch (error: any) {
      console.error('SendGrid email error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }
  }

  /**
   * Send email using template
   */
  async sendTemplateEmail(
    templateKey: string,
    to: string,
    templateData: Record<string, any>,
    options?: { toName?: string; priority?: number }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Get template from database
      const template = await this.getTemplate(templateKey);
      if (!template) {
        throw new Error(`Template not found: ${templateKey}`);
      }

      // Replace variables in template
      const processedHtml = this.processTemplate(template.html_content, templateData);
      const processedText = template.text_content ? this.processTemplate(template.text_content, templateData) : undefined;
      const processedSubject = this.processTemplate(template.subject, templateData);

      // Send email
      return await this.sendEmail({
        to,
        toName: options?.toName,
        subject: processedSubject,
        html: processedHtml,
        text: processedText,
        templateKey,
        templateData,
        priority: options?.priority
      });
    } catch (error: any) {
      console.error('Template email error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send template email'
      };
    }
  }

  /**
   * Queue email for later delivery
   */
  async queueEmail(emailData: EmailData): Promise<{ success: boolean; queueId?: string; error?: string }> {
    try {
      const supabase = await this.supabase;

      const queueItem = {
        to_email: emailData.to,
        to_name: emailData.toName,
        from_email: emailData.from || this.defaultFrom,
        from_name: emailData.fromName || this.defaultFromName,
        subject: emailData.subject,
        html_content: emailData.html,
        text_content: emailData.text,
        template_data: emailData.templateData,
        priority: emailData.priority || 5,
        status: 'pending' as const,
        attempt_count: 0,
        max_attempts: 3,
        scheduled_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('email_queue')
        .insert(queueItem)
        .select('id')
        .single();

      if (error) throw error;

      return {
        success: true,
        queueId: data.id
      };
    } catch (error: any) {
      console.error('Queue email error:', error);
      return {
        success: false,
        error: error.message || 'Failed to queue email'
      };
    }
  }

  /**
   * Process email queue (call this from a cron job or background worker)
   */
  async processEmailQueue(limit: number = 10): Promise<{ processed: number; errors: string[] }> {
    try {
      const supabase = await this.supabase;

      // Get pending emails
      const { data: queueItems, error } = await supabase
        .from('email_queue')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_at', new Date().toISOString())
        .order('priority', { ascending: true })
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      const errors: string[] = [];
      let processed = 0;

      for (const item of queueItems || []) {
        try {
          // Mark as processing
          await supabase
            .from('email_queue')
            .update({ status: 'processing' })
            .eq('id', item.id);

          // Send email
          const result = await this.sendEmail({
            to: item.to_email,
            toName: item.to_name,
            from: item.from_email,
            fromName: item.from_name,
            subject: item.subject,
            html: item.html_content,
            text: item.text_content
          });

          if (result.success) {
            // Mark as sent
            await supabase
              .from('email_queue')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
                sendgrid_message_id: result.messageId
              })
              .eq('id', item.id);
            processed++;
          } else {
            // Handle failure
            const newAttemptCount = item.attempt_count + 1;
            const shouldRetry = newAttemptCount < item.max_attempts;

            await supabase
              .from('email_queue')
              .update({
                status: shouldRetry ? 'pending' : 'failed',
                attempt_count: newAttemptCount,
                error_message: result.error,
                failed_at: shouldRetry ? null : new Date().toISOString(),
                scheduled_at: shouldRetry ? new Date(Date.now() + (newAttemptCount * 60000)).toISOString() : item.scheduled_at
              })
              .eq('id', item.id);

            if (!shouldRetry) {
              errors.push(`Failed to send email ${item.id}: ${result.error}`);
            }
          }
        } catch (itemError: any) {
          errors.push(`Error processing email ${item.id}: ${itemError.message}`);
        }
      }

      return { processed, errors };
    } catch (error: any) {
      console.error('Process email queue error:', error);
      return { processed: 0, errors: [error.message] };
    }
  }

  /**
   * Get email template from database
   */
  private async getTemplate(templateKey: string): Promise<EmailTemplate | null> {
    try {
      const supabase = await this.supabase;

      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('template_key', templateKey)
        .eq('is_active', true)
        .single();

      if (error || !data) return null;

      return {
        ...data,
        variables: Array.isArray(data.variables) ? data.variables : JSON.parse(data.variables || '[]')
      };
    } catch (error) {
      console.error('Get template error:', error);
      return null;
    }
  }

  /**
   * Process template with variable substitution
   */
  private processTemplate(template: string, data: Record<string, any>): string {
    let processed = template;

    // Replace {{variable}} patterns
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processed = processed.replace(regex, String(data[key] || ''));
    });

    // Handle conditional blocks {{#variable}}...{{/variable}}
    processed = processed.replace(/{{#(\w+)}}(.*?){{\/\1}}/gs, (match, variable, content) => {
      return data[variable] ? content : '';
    });

    return processed;
  }

  /**
   * Get email queue status
   */
  async getQueueStatus(): Promise<{
    pending: number;
    processing: number;
    failed: number;
    sent_today: number;
  }> {
    try {
      const supabase = await this.supabase;
      const today = new Date().toISOString().split('T')[0];

      const [pending, processing, failed, sentToday] = await Promise.all([
        supabase.from('email_queue').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('email_queue').select('id', { count: 'exact' }).eq('status', 'processing'),
        supabase.from('email_queue').select('id', { count: 'exact' }).eq('status', 'failed'),
        supabase.from('email_queue').select('id', { count: 'exact' }).eq('status', 'sent').gte('sent_at', today)
      ]);

      return {
        pending: pending.count || 0,
        processing: processing.count || 0,
        failed: failed.count || 0,
        sent_today: sentToday.count || 0
      };
    } catch (error) {
      console.error('Get queue status error:', error);
      return { pending: 0, processing: 0, failed: 0, sent_today: 0 };
    }
  }
}

export const emailService = new EmailService();
