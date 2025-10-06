// Import unified API configuration
export { API_CONFIG } from "../config/api";

// iFood-inspired Theme Colors
export const LIGHT_THEME = {
  // Primary (iFood red)
  primary: "#EA1D2C",
  primaryDark: "#CC1A27",
  primaryLight: "#FF4757",

  // Secondary (orange accent)
  secondary: "#FF6B35",
  secondaryLight: "#FF8A50",

  // Background
  background: "#F8F9FA",
  surface: "#FFFFFF",
  surfaceVariant: "#F5F5F5",
  card: "#FFFFFF",

  // Text
  textPrimary: "#2D3436",
  textSecondary: "#636E72",
  textTertiary: "#A0A0A0",
  textPlaceholder: "#B2BEC3",
  textOnPrimary: "#FFFFFF",

  // Status
  success: "#00B894",
  warning: "#FDCB6E",
  error: "#E17055",
  info: "#74B9FF",

  // Border & Dividers
  border: "#E1E8ED",
  divider: "#F1F3F4",
  shadow: "rgba(0, 0, 0, 0.1)",

  // Interactive
  ripple: "rgba(234, 29, 44, 0.12)",
  overlay: "rgba(0, 0, 0, 0.5)",

  // Restaurant categories
  category1: "#FF6B6B",
  category2: "#4ECDC4",
  category3: "#45B7D1",
  category4: "#96CEB4",
  category5: "#FFEAA7",
} as const;

export const DARK_THEME = {
  // Primary (iFood red)
  primary: "#EA1D2C",
  primaryDark: "#CC1A27",
  primaryLight: "#FF4757",

  // Secondary (orange accent)
  secondary: "#FF6B35",
  secondaryLight: "#FF8A50",

  // Background
  background: "#121212",
  surface: "#1E1E1E",
  surfaceVariant: "#2C2C2C",
  card: "#1E1E1E",

  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "#B3B3B3",
  textTertiary: "#8E8E8E",
  textPlaceholder: "#666666",
  textOnPrimary: "#FFFFFF",

  // Status
  success: "#00B894",
  warning: "#FDCB6E",
  error: "#E17055",
  info: "#74B9FF",

  // Border & Dividers
  border: "#333333",
  divider: "#2C2C2C",
  shadow: "rgba(0, 0, 0, 0.3)",

  // Interactive
  ripple: "rgba(234, 29, 44, 0.12)",
  overlay: "rgba(0, 0, 0, 0.7)",

  // Restaurant categories
  category1: "#FF6B6B",
  category2: "#4ECDC4",
  category3: "#45B7D1",
  category4: "#96CEB4",
  category5: "#FFEAA7",
} as const;

export type ThemeColors = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryLight: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textPlaceholder: string;
  textOnPrimary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  border: string;
  divider: string;
  shadow: string;
  ripple: string;
  overlay: string;
  category1: string;
  category2: string;
  category3: string;
  category4: string;
  category5: string;
};

// Spacing (iFood-inspired)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
} as const;

// Typography (iFood-inspired)
export const TYPOGRAPHY = {
  fontSize: {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    xxxxl: 28,
    xxxxxl: 32,
  },
  fontWeight: {
    light: "300" as const,
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    black: "800" as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

// Layout (iFood-inspired)
export const LAYOUT = {
  headerHeight: 56,
  tabBarHeight: 60,
  searchBarHeight: 48,
  cardHeight: 280,
  borderRadius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    round: 50,
  },
  shadow: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  },
} as const;

// Theme type
export type Theme = {
  colors: ThemeColors;
  spacing: typeof SPACING;
  typography: typeof TYPOGRAPHY;
  layout: typeof LAYOUT;
};

export const createTheme = (colors: ThemeColors): Theme => ({
  colors,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  layout: LAYOUT,
});
