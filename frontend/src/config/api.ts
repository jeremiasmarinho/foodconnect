/**
 * Unified API Configuration
 * Single source of truth for all API endpoints
 */

// Get current machine IP
const getCurrentIP = (): string => {
  // For web environment, use localhost
  if (typeof window !== "undefined") {
    return "localhost";
  }

  // For mobile/native, we need the actual IP
  // This should be set as environment variable or hardcoded for your network
  return process.env.EXPO_PUBLIC_API_HOST || "192.168.0.161";
};

// API Configuration
export const API_CONFIG = {
  // Development URLs
  WEB_URL: "http://localhost:3002",
  MOBILE_URL: `http://${getCurrentIP()}:3002`,

  // Get appropriate URL based on platform
  BASE_URL: (() => {
    // Web environment
    if (typeof window !== "undefined") {
      return "http://localhost:3002";
    }

    // React Native environment
    if (
      typeof navigator !== "undefined" &&
      navigator.product === "ReactNative"
    ) {
      return `http://${getCurrentIP()}:3002`;
    }

    // Default fallback
    return "http://localhost:3002";
  })(),

  TIMEOUT: 10000,

  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      PROFILE: "/auth/profile",
      LOGOUT: "/auth/logout",
      REFRESH: "/auth/refresh",
      HEALTH: "/auth/health",
    },
    USERS: {
      ME: "/users/me",
      BY_ID: (id: string) => `/users/${id}`,
      SEARCH: "/users/search",
    },
    POSTS: {
      FEED: "/posts/feed/timeline",
      CREATE: "/posts",
      BY_ID: (id: string) => `/posts/${id}`,
    },
    RESTAURANTS: {
      LIST: "/restaurants",
      BY_ID: (id: string) => `/restaurants/${id}`,
      SEARCH: "/restaurants/search/query",
    },
  },
} as const;

// Validation
export const validateApiConfig = () => {
  const errors: string[] = [];

  if (!API_CONFIG.BASE_URL) {
    errors.push("BASE_URL is not defined");
  }

  if (!API_CONFIG.BASE_URL.includes("3002")) {
    errors.push("BASE_URL should use port 3002");
  }

  if (API_CONFIG.TIMEOUT < 1000) {
    errors.push("TIMEOUT should be at least 1000ms");
  }

  return {
    isValid: errors.length === 0,
    errors,
    config: API_CONFIG,
  };
};

// Debug helper
export const debugApiConfig = () => {
  console.log("🔍 API Configuration Debug:");
  console.log("  BASE_URL:", API_CONFIG.BASE_URL);
  console.log("  WEB_URL:", API_CONFIG.WEB_URL);
  console.log("  MOBILE_URL:", API_CONFIG.MOBILE_URL);
  console.log("  TIMEOUT:", API_CONFIG.TIMEOUT);
  console.log("  Current IP:", getCurrentIP());
  console.log(
    "  Environment:",
    typeof window !== "undefined" ? "Web" : "Native"
  );

  const validation = validateApiConfig();
  if (validation.isValid) {
    console.log("  ✅ Configuration is valid");
  } else {
    console.log("  ❌ Configuration errors:", validation.errors);
  }
};

export default API_CONFIG;
