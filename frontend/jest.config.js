module.exports = {
  preset: "react-native",
  // Use the default environment from react-native preset (node)
  setupFiles: [],
  setupFilesAfterEnv: [
    "@testing-library/jest-native/extend-expect",
    "<rootDir>/src/test/setupTests.ts",
  ],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|svg)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@expo/vector-icons$":
      "<rootDir>/src/test/mocks/expo-vector-icons-mock.js",
    "^expo-font$": "<rootDir>/src/test/mocks/expo-font-mock.js",
    "^expo-navigation-bar$":
      "<rootDir>/src/test/mocks/expo-navigation-bar-mock.js",
    "^expo-status-bar$": "<rootDir>/src/test/mocks/expo-status-bar-mock.js",
    "^expo-linear-gradient$":
      "<rootDir>/src/test/mocks/expo-linear-gradient-mock.js",
    "^expo-image-picker$": "<rootDir>/src/test/mocks/expo-image-picker-mock.js",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|@expo|expo|expo-font|@expo/vector-icons|@testing-library/react-native|react-native-vector-icons|expo-splash-screen|react-native-gesture-handler|@react-navigation|react-native-screens)/)",
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}",
  ],
  roots: ["<rootDir>/src"],
  collectCoverageFrom: [
    // Focus coverage on areas with tests first; expand gradually
    "src/components/**/*.{js,jsx,ts,tsx}",
    "src/providers/**/*.{js,jsx,ts,tsx}",
    // Exclusions
    "!src/**/*.d.ts",
    "!src/test/**/*",
    "!src/**/__tests__/**",
    "!src/**/*.test.{js,jsx,ts,tsx}",
    "!src/**/*.spec.{js,jsx,ts,tsx}",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      statements: 15,
      branches: 5,
      functions: 10,
      lines: 15,
    },
  },
  testTimeout: 10000,
  globals: {
    __DEV__: true,
  },
};
