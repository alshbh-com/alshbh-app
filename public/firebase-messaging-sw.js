// Firebase Cloud Messaging Service Worker
// This handles push notifications when the app is in background

// Listen for push events
self.addEventListener('push', function(event) {
  console.log('[SW] Push received:', event);
  
  let notificationData = {
    title: 'الشبح للتوصيل',
    body: 'لديك إشعار جديد',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'alshbh-notification',
    requireInteraction: false,
    data: {}
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('[SW] Push payload:', payload);
      
      // Handle FCM payload structure
      if (payload.notification) {
        notificationData.title = payload.notification.title || notificationData.title;
        notificationData.body = payload.notification.body || notificationData.body;
        notificationData.icon = payload.notification.icon || notificationData.icon;
        notificationData.image = payload.notification.image;
      }
      
      // Handle data payload
      if (payload.data) {
        notificationData.data = payload.data;
      }
    } catch (e) {
      console.log('[SW] Push data is not JSON, using text:', event.data.text());
      notificationData.body = event.data.text();
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      image: notificationData.image,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'open', title: 'فتح التطبيق' },
        { action: 'close', title: 'إغلاق' }
      ]
    }
  );

  event.waitUntil(promiseChain);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }

  // Open the app when notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // If app is already open, focus it
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if ('focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('[SW] Push subscription changed');
  // Re-subscribe logic would go here
});

console.log('[SW] Firebase messaging service worker loaded');
