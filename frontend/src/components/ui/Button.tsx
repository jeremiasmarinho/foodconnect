import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTheme } from "../../providers";

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.layout.borderRadius.md,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      ...(fullWidth && { width: "100%" }),
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: 48,
      },
      large: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        minHeight: 56,
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: theme.colors.primary,
        ...theme.layout.shadow.medium,
      },
      secondary: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.layout.shadow.small,
      },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
      },
      ghost: {
        backgroundColor: "transparent",
      },
    };

    // Disabled style
    const disabledStyle: ViewStyle = {
      opacity: 0.5,
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(disabled || loading ? disabledStyle : {}),
    };
  };

  const getTextStyle = (): TextStyle => {
    // Size text styles
    const sizeTextStyles: Record<string, TextStyle> = {
      small: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.semibold,
      },
      medium: {
        fontSize: theme.typography.fontSize.md,
        fontWeight: theme.typography.fontWeight.semibold,
      },
      large: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.semibold,
      },
    };

    // Variant text styles
    const variantTextStyles: Record<string, TextStyle> = {
      primary: {
        color: theme.colors.textOnPrimary,
      },
      secondary: {
        color: theme.colors.textPrimary,
      },
      outline: {
        color: theme.colors.primary,
      },
      ghost: {
        color: theme.colors.primary,
      },
    };

    return {
      textAlign: "center",
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
    };
  };

  const getActivityIndicatorColor = (): string => {
    switch (variant) {
      case "primary":
        return theme.colors.textOnPrimary;
      case "secondary":
        return theme.colors.textPrimary;
      case "outline":
      case "ghost":
        return theme.colors.primary;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getActivityIndicatorColor()} size="small" />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
