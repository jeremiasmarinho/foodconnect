import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface NotificationData {
  type: "like" | "comment" | "order" | "order-status" | "new-post" | "follow";
  message: string;
  data?: any;
  timestamp: Date;
}

interface UseSocketOptions {
  userId?: string;
  autoConnect?: boolean;
  serverUrl?: string;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const {
    userId,
    autoConnect = true,
    serverUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001",
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize socket connection
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    socketRef.current = io(`${serverUrl}/notifications`, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setIsConnected(true);

      // Authenticate user if userId is provided
      if (userId) {
        socket.emit("authenticate", { userId });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("🚫 Socket connection error:", error);
      setIsConnected(false);
    });

    // Authentication response
    socket.on("authenticated", (data) => {
      console.log("🔐 Socket authenticated:", data);
    });

    // Notification event handlers
    socket.on("new-like", (data: NotificationData) => {
      console.log("👍 New like notification:", data);
      addNotification(data);
    });

    socket.on("new-comment", (data: NotificationData) => {
      console.log("💬 New comment notification:", data);
      addNotification(data);
    });

    socket.on("new-order", (data: NotificationData) => {
      console.log("📋 New order notification:", data);
      addNotification(data);
    });

    socket.on("order-status-update", (data: NotificationData) => {
      console.log("📦 Order status update:", data);
      addNotification(data);
    });

    socket.on("new-post", (data: NotificationData) => {
      console.log("📝 New post notification:", data);
      addNotification(data);
    });

    // Real-time post updates
    socket.on("post-liked", (data) => {
      console.log("👍 Post liked in real-time:", data);
      // You can emit custom events to update UI components
      window.dispatchEvent(new CustomEvent("post-liked", { detail: data }));
    });

    socket.on("post-commented", (data) => {
      console.log("💬 Post commented in real-time:", data);
      window.dispatchEvent(new CustomEvent("post-commented", { detail: data }));
    });

    // Connect the socket
    socket.connect();
  }, [userId, serverUrl]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Add notification to state
  const addNotification = useCallback((notification: NotificationData) => {
    setNotifications((prev) => [notification, ...prev.slice(0, 49)]); // Keep last 50
    setUnreadCount((prev) => prev + 1);

    // Show browser notification if permission granted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.message, {
        icon: "/icon-192x192.png",
        badge: "/icon-72x72.png",
      });
    }
  }, []);

  // Join restaurant room for notifications
  const joinRestaurant = useCallback((restaurantId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("join-restaurant", { restaurantId });
    }
  }, []);

  // Leave restaurant room
  const leaveRestaurant = useCallback((restaurantId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("leave-restaurant", { restaurantId });
    }
  }, []);

  // Join post room for real-time updates
  const joinPost = useCallback((postId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("join-post", { postId });
    }
  }, []);

  // Leave post room
  const leavePost = useCallback((postId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("leave-post", { postId });
    }
  }, []);

  // Mark notifications as read
  const markAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, userId, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    // Connection state
    isConnected,
    socket: socketRef.current,

    // Connection methods
    connect,
    disconnect,

    // Room management
    joinRestaurant,
    leaveRestaurant,
    joinPost,
    leavePost,

    // Notifications
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications,

    // Browser notifications
    requestNotificationPermission,
  };
};
