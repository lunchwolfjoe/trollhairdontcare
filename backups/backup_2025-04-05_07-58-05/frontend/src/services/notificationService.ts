import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

interface Notification {
  id: string;
  user_id: string;
  template_id: string;
  type: string;
  subject: string;
  body: string;
  read: boolean;
  sent_at: string;
}

interface NotificationSettings {
  id: string;
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  phone_number: string;
  alert_levels: string[];
  notification_types: string[];
}

interface NotificationTemplate {
  id: string;
  type: string;
  subject: string;
  body: string;
}

// Initialize Supabase client for real-time subscriptions
const supabaseRealtime = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!
);

export const notificationService = {
  async fetchNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async fetchNotificationSettings(): Promise<NotificationSettings | null> {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
    const { error } = await supabase
      .from('notification_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', settings.id);

    if (error) throw error;
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async markAllNotificationsAsRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);

    if (error) throw error;
  },

  subscribeToNotifications(callback: (notification: Notification) => void): () => void {
    const subscription = supabaseRealtime
      .channel('weather_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  // Email sending function (to be implemented with your email service)
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // Implement email sending logic here
    // Example: using SendGrid, AWS SES, or other email service
    console.log('Sending email:', { to, subject, body });
  },

  // SMS sending function (to be implemented with your SMS service)
  async sendSMS(to: string, message: string): Promise<void> {
    // Implement SMS sending logic here
    // Example: using Twilio, AWS SNS, or other SMS service
    console.log('Sending SMS:', { to, message });
  },

  // Function to handle notification sending
  async handleNotification(notification: Notification): Promise<void> {
    try {
      // Get user's notification settings
      const { data: settings, error: settingsError } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', notification.user_id)
        .single();

      if (settingsError) throw settingsError;

      // Get user's email and phone number
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('email, phone_number')
        .eq('id', notification.user_id)
        .single();

      if (userError) throw userError;

      // Send email if enabled
      if (settings.email_enabled && user.email) {
        await this.sendEmail(user.email, notification.subject, notification.body);
      }

      // Send SMS if enabled
      if (settings.sms_enabled && user.phone_number) {
        await this.sendSMS(user.phone_number, notification.body);
      }

      // Update notification as sent
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', notification.id);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error handling notification:', error);
      throw error;
    }
  },
}; 