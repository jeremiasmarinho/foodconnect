import React, { lazy, Suspense } from "react";

// Loading component for Suspense fallback
const LazyLoadingComponent: React.FC = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
  </div>
);

// Lazy loaded screens
export const LazyHomeScreen = lazy(() => import("../screens/main/HomeScreen"));

export const LazyProfileScreen = lazy(
  () => import("../screens/main/ProfileScreen")
);

export const LazyOrderHistoryScreen = lazy(
  () => import("../screens/main/OrderHistoryScreen")
);

export const LazyOrderDetailsScreen = lazy(
  () => import("../screens/main/OrderDetailsScreen")
);

export const LazyRestaurantDetailsScreen = lazy(
  () => import("../screens/restaurant/RestaurantDetailsScreen")
);

export const LazyRestaurantMenuScreen = lazy(
  () => import("../screens/restaurant/RestaurantMenuScreen")
);

export const LazyCartScreen = lazy(() => import("../screens/main/CartScreen"));

export const LazySettingsScreen = lazy(
  () => import("../screens/main/SettingsScreen")
);

export const LazyNotificationsScreen = lazy(
  () => import("../screens/main/NotificationsScreen")
);

// HOC to wrap lazy components with Suspense
export const withLazySuspense = <P extends object>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>,
  fallback?: React.ReactNode
) => {
  return (props: P) => (
    <Suspense fallback={fallback || <LazyLoadingComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export { LazyLoadingComponent };
