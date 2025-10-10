import apiClient from "./api/client";

/**
 * Notification Type
 * Matches backend types
 */
export type NotificationType =
  | "like"
  | "comment"
  | "follow"
  | "order"
  | "order-status"
  | "new-post";

/**
 * Notification Interface
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: any; // Additional notification data (parsed JSON)
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notifications List Response
 */
export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Notification Service
 * Handles all notification-related API calls
 */
class NotificationService {
  /**
   * Get user's notifications with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 20)
   */
  async getNotifications(
    page: number = 1,
    limit: number = 20
  ): Promise<NotificationsResponse> {
    const response = await apiClient.get<NotificationsResponse>(
      "/notifications",
      {
        params: { page, limit },
      }
    );

    // Parse dates
    const notifications = response.notifications.map(
      (notification: Notification) => ({
        ...notification,
        createdAt: new Date(notification.createdAt),
        updatedAt: new Date(notification.updatedAt),
        readAt: notification.readAt ? new Date(notification.readAt) : null,
      })
    );

    return {
      ...response,
      notifications,
    };
  }

  /**
   * Get unread notifications count
   * @returns Count of unread notifications
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(
      "/notifications/unread/count"
    );
    return response.count;
  }

  /**
   * Mark a specific notification as read
   * @param notificationId - Notification ID
   */
  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.post("/notifications/read-all");
  }

  /**
   * Get only unread notifications
   * Convenience method that filters on the client
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await this.getNotifications(1, 50);
    return response.notifications.filter((n) => !n.read);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
