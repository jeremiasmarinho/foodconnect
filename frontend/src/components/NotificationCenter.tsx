import React, { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import { useCurrentUser } from "../hooks/useAuth";

interface NotificationItemProps {
  notification: {
    type: string;
    message: string;
    timestamp: Date;
    data?: any;
  };
  onClose: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClose,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case "like":
        return "👍";
      case "comment":
        return "💬";
      case "order":
        return "📋";
      case "order-status":
        return "📦";
      case "new-post":
        return "📝";
      case "follow":
        return "👥";
      default:
        return "🔔";
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case "like":
        return "bg-red-100 border-red-200 text-red-800";
      case "comment":
        return "bg-blue-100 border-blue-200 text-blue-800";
      case "order":
        return "bg-green-100 border-green-200 text-green-800";
      case "order-status":
        return "bg-yellow-100 border-yellow-200 text-yellow-800";
      case "new-post":
        return "bg-purple-100 border-purple-200 text-purple-800";
      default:
        return "bg-gray-100 border-gray-200 text-gray-800";
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`
        ${getTypeColor()}
        border rounded-lg p-3 mb-2 shadow-sm
        animate-slide-in-right
        relative cursor-pointer
        hover:shadow-md transition-shadow duration-200
      `}
      onClick={onClose}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 text-sm"
      >
        ×
      </button>

      <div className="flex items-start space-x-2">
        <span className="text-lg flex-shrink-0 mt-0.5">{getIcon()}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{notification.message}</p>
          <p className="text-xs opacity-75 mt-1">
            {new Date(notification.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

interface NotificationCenterProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  position = "top-right",
}) => {
  const { user } = useCurrentUser();
  const {
    notifications,
    unreadCount,
    markAsRead,
    clearNotifications,
    requestNotificationPermission,
  } = useSocket({
    userId: user?.id,
    autoConnect: true,
  });

  const [displayedNotifications, setDisplayedNotifications] = useState<any[]>(
    []
  );

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // Update displayed notifications
  useEffect(() => {
    // Only show last 5 notifications for UI
    setDisplayedNotifications(notifications.slice(0, 5));
  }, [notifications]);

  const handleCloseNotification = (index: number) => {
    setDisplayedNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top-right":
        return "top-4 right-4";
      case "top-left":
        return "top-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      default:
        return "top-4 right-4";
    }
  };

  if (displayedNotifications.length === 0) {
    return null;
  }

  return (
    <div
      className={`
        fixed ${getPositionClasses()} z-50
        w-80 max-w-sm
        pointer-events-none
      `}
    >
      <div className="pointer-events-auto">
        {/* Clear all button */}
        {displayedNotifications.length > 1 && (
          <div className="text-right mb-2">
            <button
              onClick={() => {
                setDisplayedNotifications([]);
                clearNotifications();
              }}
              className="text-xs text-gray-500 hover:text-gray-700 bg-white px-2 py-1 rounded shadow"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Notifications list */}
        <div className="space-y-2">
          {displayedNotifications.map((notification, index) => (
            <NotificationItem
              key={`${notification.timestamp}-${index}`}
              notification={notification}
              onClose={() => handleCloseNotification(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Badge component for notification count
interface NotificationBadgeProps {
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  className = "",
}) => {
  const { user } = useCurrentUser();
  const { unreadCount } = useSocket({
    userId: user?.id,
    autoConnect: true,
  });

  if (unreadCount === 0) {
    return null;
  }

  return (
    <span
      className={`
        inline-flex items-center justify-center
        px-2 py-1 text-xs font-bold leading-none
        text-white bg-red-500 rounded-full
        animate-pulse
        ${className}
      `}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
};

// Hook for listening to real-time post updates
export const usePostUpdates = (postId?: string) => {
  const { socket, joinPost, leavePost } = useSocket();
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState(0);

  useEffect(() => {
    if (!postId || !socket) return;

    // Join post room
    joinPost(postId);

    // Listen for real-time updates
    const handlePostLiked = (data: any) => {
      if (data.postId === postId) {
        setLikes((prev) => prev + 1);
      }
    };

    const handlePostCommented = (data: any) => {
      if (data.postId === postId) {
        setComments((prev) => prev + 1);
      }
    };

    window.addEventListener("post-liked", handlePostLiked);
    window.addEventListener("post-commented", handlePostCommented);

    return () => {
      leavePost(postId);
      window.removeEventListener("post-liked", handlePostLiked);
      window.removeEventListener("post-commented", handlePostCommented);
    };
  }, [postId, socket, joinPost, leavePost]);

  return { likes, comments };
};
