module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/test/setupTests.ts"],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|svg)$": "identity-obj-proxy",
    "react-native": "react-native-web",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|@expo|expo|@testing-library/react-native|react-native-vector-icons)/)",
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  testMatch: [
    "<rootDir>/../src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/../src/**/*.(test|spec).{js,jsx,ts,tsx}",
  ],
  roots: ["<rootDir>/../src"],
  collectCoverageFrom: [
    "../src/**/*.{js,jsx,ts,tsx}",
    "!../src/**/*.d.ts",
    "!../src/test/**/*",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};
