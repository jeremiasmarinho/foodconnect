import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import notificationService, {
  Notification,
  NotificationsResponse,
} from "../services/notification";
import { API_CONFIG } from "../config/api";

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  connected: boolean;

  // Actions
  loadNotifications: (page?: number) => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for managing notifications with real-time updates via WebSocket
 */
export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const limitPerPage = 20;

  /**
   * Load notifications from API
   */
  const loadNotifications = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response: NotificationsResponse =
        await notificationService.getNotifications(page, limitPerPage);

      if (page === 1) {
        setNotifications(response.notifications);
      } else {
        setNotifications((prev) => [...prev, ...response.notifications]);
      }

      setCurrentPage(page);
      setHasMore(response.hasMore);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load more notifications (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadNotifications(currentPage + 1);
  }, [hasMore, loading, currentPage, loadNotifications]);

  /**
   * Refresh unread count
   */
  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to refresh unread count:", err);
    }
  }, []);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n
        )
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark notification as read"
      );
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read: true,
          readAt: n.read ? n.readAt : new Date(),
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark all notifications as read"
      );
    }
  }, []);

  /**
   * Setup WebSocket connection for real-time notifications
   */
  useEffect(() => {
    const setupWebSocket = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) return;

        const wsUrl = __DEV__
          ? `http://localhost:3000/notifications`
          : `${API_CONFIG.BASE_URL}/notifications`;

        const socket = io(wsUrl, {
          auth: { token },
          transports: ["websocket", "polling"],
        });

        socket.on("connect", () => {
          console.log("✅ WebSocket connected");
          setConnected(true);

          // Authenticate the socket connection
          socket.emit("authenticate", { token });
        });

        socket.on("disconnect", () => {
          console.log("❌ WebSocket disconnected");
          setConnected(false);
        });

        // Listen for new notifications
        socket.on("notification", (notification: Notification) => {
          console.log("🔔 New notification received:", notification);

          // Add to the beginning of the list
          setNotifications((prev) => [notification, ...prev]);

          // Increment unread count if notification is unread
          if (!notification.read) {
            setUnreadCount((prev) => prev + 1);
          }
        });

        // Listen for notification read events (from other devices)
        socket.on("notification:read", (data: { notificationId: string }) => {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === data.notificationId
                ? { ...n, read: true, readAt: new Date() }
                : n
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        });

        socketRef.current = socket;
      } catch (err) {
        console.error("Failed to setup WebSocket:", err);
      }
    };

    setupWebSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  /**
   * Load initial data
   */
  useEffect(() => {
    loadNotifications(1);
    refreshUnreadCount();
  }, [loadNotifications, refreshUnreadCount]);

  // Função refresh como alias para loadNotifications
  const refresh = useCallback(async () => {
    await loadNotifications(1);
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    connected,
    loadNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    refreshUnreadCount,
    refresh,
  };
}

export default useNotifications;
