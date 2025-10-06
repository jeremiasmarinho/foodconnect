// Setup file for Jest tests
import "@testing-library/jest-dom";
import "@testing-library/jest-native/extend-expect";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Note: Avoid mocking 'react-native' to prevent native bridge errors in tests.

// Mock reanimated and native animated helper to avoid native bridge invariants
try {
  // Only mock if the module exists to avoid resolution errors in projects not using it
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require.resolve("react-native-reanimated");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  jest.mock("react-native-reanimated", () =>
    require("react-native-reanimated/mock")
  );
} catch {
  // no-op when not present
}
try {
  require.resolve("react-native/Libraries/Animated/NativeAnimatedHelper");
  jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");
} catch {}

// Mock expo modules
jest.mock("expo-constants", () => ({
  default: {
    manifest: {},
  },
}));

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

// Mock environment variables
process.env.NODE_ENV = "test";

// Global test configuration - only suppress logs in CI
if (process.env.CI) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}
