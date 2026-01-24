import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const NotificationListener = () => {
  const lastNotificationId = useRef<string | null>(null);
  const notificationPermission = useRef<NotificationPermission>('default');

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      notificationPermission.current = Notification.permission;
    }

    // Subscribe to new notifications in realtime
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const notification = payload.new as {
            id: string;
            title: string;
            message: string;
            image_url?: string;
            status?: string;
          };

          // Avoid duplicate notifications
          if (notification.id === lastNotificationId.current) return;
          lastNotificationId.current = notification.id;

          // Only show if status is 'sent' or 'sending'
          if (notification.status !== 'sent' && notification.status !== 'sending') return;

          // Show browser notification
          showBrowserNotification(notification.title, notification.message, notification.image_url);

          // Also show in-app toast
          toast(notification.title, {
            description: notification.message,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const showBrowserNotification = (title: string, body: string, icon?: string) => {
    // Check if notifications are supported and permitted
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      // Create and show notification
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'alshbh-notification',
        requireInteraction: false,
        silent: false,
      });

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } else if (Notification.permission !== 'denied') {
      // Request permission
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          showBrowserNotification(title, body, icon);
        }
      });
    }
  };

  return null; // This component doesn't render anything
};
