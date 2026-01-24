// Firebase configuration for FCM
// VAPID key for web push

export const VAPID_PUBLIC_KEY = 'BJFQeo4L0HM-CT1jhJ2ieYXGC4pDqZXtcAIKLAL27P37-ExGawv39bTrtgE8c9RNJh-Z70rRVU74FZctKIxLOgc';

// Convert VAPID key to Uint8Array for subscription
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
