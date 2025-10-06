import React, { lazy, Suspense } from "react";

// Loading component for Suspense fallback
const LazyLoadingComponent: React.FC = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
  </div>
);

// Lazy loaded screens – map to existing files/exports
// Feed acts as Home
export const LazyHomeScreen = lazy(() =>
  import("../screens/main/FeedScreen").then((m) => ({ default: m.FeedScreen }))
);

export const LazyProfileScreen = lazy(() =>
  import("../screens/main/ProfileScreen").then((m) => ({
    default: m.ProfileScreen,
  }))
);

export const LazyOrderHistoryScreen = lazy(
  () => import("../screens/main/OrderHistoryScreen")
);

export const LazyOrderDetailsScreen = lazy(
  () => import("../screens/main/OrderDetailsScreen")
);

export const LazyRestaurantDetailsScreen = lazy(() =>
  import("../screens/main/RestaurantDetailScreen").then((m) => ({
    default: m.RestaurantDetailScreen,
  }))
);

export const LazyRestaurantMenuScreen = lazy(
  () => import("../screens/restaurant/RestaurantMenuScreen")
);

export const LazyCartScreen = lazy(() => import("../screens/main/CartScreen"));

// Removed Settings and Notifications placeholders (files don't exist)

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
