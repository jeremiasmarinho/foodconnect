import { useState, useEffect, useCallback } from "react";

interface PushNotificationOptions {
  vapidKey?: string;
  serviceWorkerPath?: string;
  onSubscriptionChange?: (subscription: PushSubscription | null) => void;
  onNotificationClick?: (data: any) => void;
}

interface NotificationPermissionState {
  permission: NotificationPermission;
  isSupported: boolean;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
}

export const usePushNotifications = (options: PushNotificationOptions = {}) => {
  const {
    vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY,
    serviceWorkerPath = "/sw.js",
    onSubscriptionChange,
    onNotificationClick,
  } = options;

  const [state, setState] = useState<NotificationPermissionState>({
    permission: "default",
    isSupported: false,
    isSubscribed: false,
    subscription: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if push notifications are supported
  const checkSupport = useCallback(() => {
    const isSupported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setState((prev) => ({
      ...prev,
      isSupported,
      permission: Notification.permission,
    }));

    return isSupported;
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service workers are not supported");
    }

    try {
      const registration = await navigator.serviceWorker.register(
        serviceWorkerPath,
        {
          scope: "/",
        }
      );

      console.log("✅ Service Worker registered:", registration);

      // Handle service worker updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New service worker is available
              console.log("🔄 New service worker available");

              // Optionally show update notification
              if (
                "Notification" in window &&
                Notification.permission === "granted"
              ) {
                new Notification("FoodConnect Updated", {
                  body: "A new version is available. Refresh to update.",
                  icon: "/icon-192x192.png",
                  tag: "app-update",
                });
              }
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error("❌ Service Worker registration failed:", error);
      throw error;
    }
  }, [serviceWorkerPath]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      throw new Error("Notifications are not supported");
    }

    setIsLoading(true);
    setError(null);

    try {
      const permission = await Notification.requestPermission();

      setState((prev) => ({
        ...prev,
        permission,
      }));

      console.log("🔔 Notification permission:", permission);
      return permission === "granted";
    } catch (error) {
      const errorMessage = "Failed to request notification permission";
      setError(errorMessage);
      console.error("❌", errorMessage, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    if (!vapidKey) {
      throw new Error("VAPID key is required for push notifications");
    }

    setIsLoading(true);
    setError(null);

    try {
      // Register service worker first
      const registration = await registerServiceWorker();

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Check if already subscribed
      const existingSubscription =
        await registration.pushManager.getSubscription();

      if (existingSubscription) {
        setState((prev) => ({
          ...prev,
          isSubscribed: true,
          subscription: existingSubscription,
        }));

        onSubscriptionChange?.(existingSubscription);
        return existingSubscription;
      }

      // Create new subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });

      setState((prev) => ({
        ...prev,
        isSubscribed: true,
        subscription,
      }));

      onSubscriptionChange?.(subscription);

      console.log("✅ Push subscription created:", subscription);
      return subscription;
    } catch (error) {
      const errorMessage = "Failed to subscribe to push notifications";
      setError(errorMessage);
      console.error("❌", errorMessage, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [vapidKey, registerServiceWorker, onSubscriptionChange]);

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async () => {
    if (!state.subscription) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await state.subscription.unsubscribe();

      setState((prev) => ({
        ...prev,
        isSubscribed: false,
        subscription: null,
      }));

      onSubscriptionChange?.(null);

      console.log("✅ Push subscription removed");
    } catch (error) {
      const errorMessage = "Failed to unsubscribe from push notifications";
      setError(errorMessage);
      console.error("❌", errorMessage, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [state.subscription, onSubscriptionChange]);

  // Send test notification
  const sendTestNotification = useCallback(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    new Notification("FoodConnect Test", {
      body: "Push notifications are working! 🎉",
      icon: "/icon-192x192.png",
      badge: "/icon-72x72.png",
      tag: "test-notification",
      requireInteraction: false,
    });
  }, []);

  // Initialize push notifications
  const initialize = useCallback(async () => {
    if (!checkSupport()) {
      setError("Push notifications are not supported in this browser");
      return false;
    }

    try {
      // Register service worker
      await registerServiceWorker();

      // Check current subscription status
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      setState((prev) => ({
        ...prev,
        isSubscribed: !!subscription,
        subscription,
        permission: Notification.permission,
      }));

      return true;
    } catch (error) {
      setError("Failed to initialize push notifications");
      console.error("❌ Push notifications initialization failed:", error);
      return false;
    }
  }, [checkSupport, registerServiceWorker]);

  // Listen for notification clicks
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "NOTIFICATION_CLICKED") {
        onNotificationClick?.(event.data);
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, [onNotificationClick]);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    // State
    ...state,
    isLoading,
    error,

    // Actions
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
    initialize,
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Default export for convenience
export default usePushNotifications;
