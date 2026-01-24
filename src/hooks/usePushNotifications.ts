import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from '@/lib/firebase-config';

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Check if already subscribed
      const subscribed = localStorage.getItem('alshbh_push_subscribed');
      setIsSubscribed(subscribed === 'true');

      // Register service worker on load
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  };

  const getSubscription = async (): Promise<PushSubscription | null> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check for existing subscription
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
      // Create new subscription with VAPID key
        const vapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey.buffer as ArrayBuffer,
        });
        console.log('New push subscription created:', subscription);
      }
      
      return subscription;
    } catch (error) {
      console.error('Error getting push subscription:', error);
      return null;
    }
  };

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error('المتصفح لا يدعم الإشعارات');
      return false;
    }

    setIsLoading(true);

    try {
      // Request notification permission
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        // Register service worker if not already
        await registerServiceWorker();
        
        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        
        // Subscribe to push notifications
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
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const subscribeToNotifications = async () => {
    try {
      const deviceId = getDeviceId();
      
      // Get push subscription
      const subscription = await getSubscription();
      
      if (!subscription) {
        throw new Error('Failed to get push subscription');
      }

      // Extract the endpoint which contains the FCM token
      const endpoint = subscription.endpoint;
      // FCM token is the last part of the endpoint URL
      const fcmToken = endpoint.split('/').pop() || endpoint;
      
      console.log('FCM Token:', fcmToken);

      // Get subscription keys for server-side sending
      const p256dh = subscription.getKey('p256dh');
      const auth = subscription.getKey('auth');

      const { error } = await supabase.from('user_devices').upsert(
        {
          user_id: deviceId,
          fcm_token: fcmToken,
          device_type: 'web',
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            endpoint: endpoint,
            keys: {
              p256dh: p256dh ? btoa(String.fromCharCode(...new Uint8Array(p256dh))) : null,
              auth: auth ? btoa(String.fromCharCode(...new Uint8Array(auth))) : null,
            },
          },
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'fcm_token' }
      );

      if (error) throw error;

      localStorage.setItem('alshbh_push_subscribed', 'true');
      setIsSubscribed(true);
      toast.success('تم تفعيل الإشعارات بنجاح! 🔔');
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      toast.error('حدث خطأ في تفعيل الإشعارات');
      throw error;
    }
  };

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      const deviceId = getDeviceId();
      
      // Unsubscribe from push manager
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }
      
      // Update database
      await supabase
        .from('user_devices')
        .update({ is_active: false })
        .eq('user_id', deviceId);

      localStorage.removeItem('alshbh_push_subscribed');
      setIsSubscribed(false);
      toast.success('تم إلغاء تفعيل الإشعارات');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('حدث خطأ في إلغاء الإشعارات');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    requestPermission,
    unsubscribe,
  };
};
