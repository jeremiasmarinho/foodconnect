import React, { useRef } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  Animated,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../providers";

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  style?: ViewStyle;
  textStyle?: TextStyle;
  haptic?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  style,
  textStyle,
  haptic = true,
}) => {
  const { theme } = useTheme();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 150,
      friction: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 4,
    }).start();
  };

  const handlePress = () => {
    if (disabled || loading) return;

    // Haptic feedback (seria implementado com expo-haptics)
    // if (haptic && Platform.OS === 'ios') {
    //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // }

    onPress();
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.layout.borderRadius.md,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    };

    const sizeStyles = {
      small: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: 44,
      },
      large: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        minHeight: 52,
      },
    };

    const variantStyles = {
      primary: {
        backgroundColor: disabled
          ? theme.colors.surfaceVariant
          : theme.colors.primary,
        ...theme.layout.shadow.small,
      },
      secondary: {
        backgroundColor: disabled
          ? theme.colors.surfaceVariant
          : theme.colors.secondary,
        ...theme.layout.shadow.small,
      },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: disabled
          ? theme.colors.surfaceVariant
          : theme.colors.primary,
      },
      ghost: {
        backgroundColor: "transparent",
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.6 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles = {
      small: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
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

    const variantStyles = {
      primary: {
        color: theme.colors.textOnPrimary,
      },
      secondary: {
        color: theme.colors.textOnPrimary,
      },
      outline: {
        color: disabled ? theme.colors.textTertiary : theme.colors.primary,
      },
      ghost: {
        color: disabled ? theme.colors.textTertiary : theme.colors.primary,
      },
    };

    return {
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const iconSize = size === "small" ? 16 : size === "medium" ? 20 : 24;
  const iconColor =
    variant === "primary" || variant === "secondary"
      ? theme.colors.textOnPrimary
      : disabled
      ? theme.colors.textTertiary
      : theme.colors.primary;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }] }, style]}>
      <TouchableOpacity
        style={[getButtonStyle()]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={iconColor}
            style={{ marginRight: title ? theme.spacing.sm : 0 }}
          />
        ) : icon && iconPosition === "left" ? (
          <Ionicons
            name={icon}
            size={iconSize}
            color={iconColor}
            style={{ marginRight: title ? theme.spacing.sm : 0 }}
          />
        ) : null}

        {title && <Text style={[getTextStyle(), textStyle]}>{title}</Text>}

        {!loading && icon && iconPosition === "right" && (
          <Ionicons
            name={icon}
            size={iconSize}
            color={iconColor}
            style={{ marginLeft: theme.spacing.sm }}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};
