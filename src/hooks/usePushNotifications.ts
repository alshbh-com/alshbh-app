import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Generate a unique device ID
const getDeviceId = () => {
  let deviceId = localStorage.getItem('alshbh_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('alshbh_device_id', deviceId);
  }
  return deviceId;
};

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Check if already subscribed
      const subscribed = localStorage.getItem('alshbh_push_subscribed');
      setIsSubscribed(subscribed === 'true');
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error('المتصفح لا يدعم الإشعارات');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        await subscribeToNotifications();
        return true;
      } else {
        toast.error('تم رفض إذن الإشعارات');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('حدث خطأ في طلب إذن الإشعارات');
      return false;
    }
  };

  const subscribeToNotifications = async () => {
    try {
      const deviceId = getDeviceId();
      
      // For web, we'll use a simulated FCM token (in production, you'd use Firebase SDK)
      // This is a placeholder - real implementation requires Firebase setup
      const fcmToken = `web_${deviceId}_${Date.now()}`;

      const { error } = await supabase.from('user_devices').upsert(
        {
          user_id: deviceId,
          fcm_token: fcmToken,
          device_type: 'web',
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
          },
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'fcm_token' }
      );

      if (error) throw error;

      localStorage.setItem('alshbh_push_subscribed', 'true');
      setIsSubscribed(true);
      toast.success('تم تفعيل الإشعارات بنجاح');
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      toast.error('حدث خطأ في تفعيل الإشعارات');
    }
  };

  const unsubscribe = async () => {
    try {
      const deviceId = getDeviceId();
      
      await supabase
        .from('user_devices')
        .update({ is_active: false })
        .eq('user_id', deviceId);

      localStorage.removeItem('alshbh_push_subscribed');
      setIsSubscribed(false);
      toast.success('تم إلغاء تفعيل الإشعارات');
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };

  return {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    unsubscribe,
  };
};
