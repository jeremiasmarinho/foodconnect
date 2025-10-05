const CACHE_NAME = "foodconnect-v1";
const urlsToCache = [
  "/",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/manifest.json",
];

// Install service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("✅ Service Worker: Cache opened");
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log("📦 Service Worker: All files cached");
        return self.skipWaiting(); // Force activation
      })
  );
});

// Activate service worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("🗑️ Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("✅ Service Worker: Activated");
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    })
  );
});

// Push notification event
self.addEventListener("push", (event) => {
  console.log("📬 Push notification received:", event);

  let notificationData = {
    title: "FoodConnect",
    body: "You have a new notification",
    icon: "/icon-192x192.png",
    badge: "/icon-72x72.png",
    data: {},
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.message || data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        data: data.data || data,
      };
    } catch (error) {
      console.error("❌ Error parsing push data:", error);
      notificationData.body = event.data.text();
    }
  }

  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    data: notificationData.data,
    requireInteraction: true,
    actions: [
      {
        action: "view",
        title: "View",
        icon: "/icon-72x72.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/icon-72x72.png",
      },
    ],
    tag: notificationData.data.type || "general",
    renotify: true,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title,
      notificationOptions
    )
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("🔔 Notification clicked:", event.notification);

  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const notificationData = event.notification.data;
  let targetUrl = "/";

  // Determine target URL based on notification type
  if (notificationData) {
    switch (notificationData.type) {
      case "like":
      case "comment":
        if (notificationData.postId) {
          targetUrl = `/posts/${notificationData.postId}`;
        }
        break;
      case "order":
        if (notificationData.orderId) {
          targetUrl = `/orders/${notificationData.orderId}`;
        }
        break;
      case "order-status":
        targetUrl = "/orders";
        break;
      case "new-post":
        if (notificationData.restaurantId) {
          targetUrl = `/restaurants/${notificationData.restaurantId}`;
        }
        break;
      case "follow":
        if (notificationData.userId) {
          targetUrl = `/users/${notificationData.userId}`;
        }
        break;
      default:
        targetUrl = "/notifications";
    }
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.postMessage({
              type: "NOTIFICATION_CLICKED",
              data: notificationData,
              targetUrl,
            });
            return client.focus();
          }
        }

        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("🔄 Background sync:", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync offline actions when connection is restored
    const cache = await caches.open(CACHE_NAME + "-offline-actions");
    const requests = await cache.keys();

    for (const request of requests) {
      try {
        await fetch(request);
        await cache.delete(request);
        console.log("✅ Synced offline action:", request.url);
      } catch (error) {
        console.error("❌ Failed to sync:", request.url, error);
      }
    }
  } catch (error) {
    console.error("❌ Background sync failed:", error);
  }
}

// Message handling from main thread
self.addEventListener("message", (event) => {
  console.log("📨 Service Worker received message:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

console.log("🚀 Service Worker loaded and ready");
