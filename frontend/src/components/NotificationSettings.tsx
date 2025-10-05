import React, { useState } from "react";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { useCurrentUser } from "../hooks/useAuth";

interface NotificationSettingsProps {
  onSubscriptionChange?: (subscription: PushSubscription | null) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  onSubscriptionChange,
}) => {
  const { user } = useCurrentUser();
  const [preferences, setPreferences] = useState({
    likes: true,
    comments: true,
    orders: true,
    newPosts: true,
    promotions: false,
  });

  const {
    permission,
    isSupported,
    isSubscribed,
    isLoading,
    error,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
  } = usePushNotifications({
    onSubscriptionChange,
    onNotificationClick: (data) => {
      console.log("Notification clicked:", data);
      // Handle notification click navigation
    },
  });

  const handleEnableNotifications = async () => {
    try {
      const granted = await requestPermission();
      if (granted) {
        await subscribeToPush();
      }
    } catch (error) {
      console.error("Failed to enable notifications:", error);
    }
  };

  const handleDisableNotifications = async () => {
    try {
      await unsubscribeFromPush();
    } catch (error) {
      console.error("Failed to disable notifications:", error);
    }
  };

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getPermissionIcon = () => {
    switch (permission) {
      case "granted":
        return "✅";
      case "denied":
        return "❌";
      default:
        return "❔";
    }
  };

  const getPermissionColor = () => {
    switch (permission) {
      case "granted":
        return "text-green-600";
      case "denied":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-600">⚠️</span>
          <p className="text-yellow-800">
            Push notifications are not supported in this browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Notification Settings
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage how you receive notifications from FoodConnect
        </p>
      </div>

      {/* Permission Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{getPermissionIcon()}</span>
            <div>
              <p className="font-medium text-gray-900">Browser Notifications</p>
              <p className={`text-sm ${getPermissionColor()}`}>
                Status:{" "}
                {permission.charAt(0).toUpperCase() + permission.slice(1)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isSubscribed && permission !== "denied" && (
              <button
                onClick={handleEnableNotifications}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {isLoading ? "Enabling..." : "Enable"}
              </button>
            )}

            {isSubscribed && (
              <>
                <button
                  onClick={sendTestNotification}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                >
                  Test
                </button>
                <button
                  onClick={handleDisableNotifications}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isLoading ? "Disabling..." : "Disable"}
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">
          What would you like to be notified about?
        </h4>

        <div className="space-y-3">
          {/* Likes */}
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.likes}
              onChange={() => handlePreferenceChange("likes")}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              disabled={!isSubscribed}
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span>👍</span>
                <span className="font-medium text-gray-900">Likes</span>
              </div>
              <p className="text-sm text-gray-600">
                When someone likes your posts
              </p>
            </div>
          </label>

          {/* Comments */}
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.comments}
              onChange={() => handlePreferenceChange("comments")}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              disabled={!isSubscribed}
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span>💬</span>
                <span className="font-medium text-gray-900">Comments</span>
              </div>
              <p className="text-sm text-gray-600">
                When someone comments on your posts
              </p>
            </div>
          </label>

          {/* Orders */}
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.orders}
              onChange={() => handlePreferenceChange("orders")}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              disabled={!isSubscribed}
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span>📦</span>
                <span className="font-medium text-gray-900">Order Updates</span>
              </div>
              <p className="text-sm text-gray-600">
                Status updates for your orders
              </p>
            </div>
          </label>

          {/* New Posts */}
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.newPosts}
              onChange={() => handlePreferenceChange("newPosts")}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              disabled={!isSubscribed}
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span>📝</span>
                <span className="font-medium text-gray-900">New Posts</span>
              </div>
              <p className="text-sm text-gray-600">
                New posts from restaurants you follow
              </p>
            </div>
          </label>

          {/* Promotions */}
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.promotions}
              onChange={() => handlePreferenceChange("promotions")}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              disabled={!isSubscribed}
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span>🎯</span>
                <span className="font-medium text-gray-900">Promotions</span>
              </div>
              <p className="text-sm text-gray-600">
                Special offers and promotions
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <span className="text-blue-600 mt-0.5">💡</span>
          <div>
            <p className="text-sm text-blue-800 font-medium">
              How do push notifications work?
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Push notifications allow FoodConnect to send you updates even when
              the app is closed. You can enable or disable them at any time in
              your browser settings or here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
