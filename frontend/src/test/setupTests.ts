import "@testing-library/jest-native/extend-expect";

// Simple global mocks for testing
global.fetch = jest.fn();

// Mock console to avoid test noise
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
