import "@testing-library/react-native/extend-expect";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock react-native-vector-icons
jest.mock("react-native-vector-icons/Ionicons", () => "Icon");

// Mock Expo components
jest.mock("expo-constants", () => ({
  statusBarHeight: 20,
}));

jest.mock("expo-status-bar", () => ({
  StatusBar: "StatusBar",
}));

// Mock navigation
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

// Mock theme provider
jest.mock("../contexts/ThemeContext", () => ({
  useTheme: () => ({
    colors: {
      primary: "#FF6347",
      background: "#FFFFFF",
      text: "#000000",
      textSecondary: "#666666",
      border: "#E0E0E0",
      surface: "#F5F5F5",
      success: "#4CAF50",
      warning: "#FF9800",
      error: "#F44336",
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    typography: {
      h1: { fontSize: 32, fontWeight: "bold" },
      h2: { fontSize: 24, fontWeight: "bold" },
      h3: { fontSize: 20, fontWeight: "600" },
      body: { fontSize: 16 },
      caption: { fontSize: 14 },
    },
  }),
}));
