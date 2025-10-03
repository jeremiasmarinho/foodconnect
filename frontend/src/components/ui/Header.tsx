import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../providers";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
  style?: ViewStyle;
  variant?: "default" | "transparent";
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightAction,
  style,
  variant = "default",
}) => {
  const { theme } = useTheme();

  const getHeaderStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      minHeight: theme.layout.headerHeight,
      justifyContent: "center",
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        ...theme.layout.shadow.small,
      },
      transparent: {
        backgroundColor: "transparent",
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const getTitleStyle = (): TextStyle => ({
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: showBack ? "left" : "center",
  });

  const getSubtitleStyle = (): TextStyle => ({
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
    textAlign: showBack ? "left" : "center",
  });

  return (
    <SafeAreaView
      style={{
        backgroundColor:
          variant === "default" ? theme.colors.surface : "transparent",
      }}
    >
      <View style={[getHeaderStyle(), style]}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left Action */}
          <View style={{ width: 40, alignItems: "flex-start" }}>
            {showBack && (
              <TouchableOpacity
                onPress={onBackPress}
                style={{
                  padding: theme.spacing.sm,
                  margin: -theme.spacing.sm,
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={theme.colors.textPrimary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Title and Subtitle */}
          <View
            style={{ flex: 1, alignItems: showBack ? "flex-start" : "center" }}
          >
            {title && (
              <Text style={getTitleStyle()} numberOfLines={1}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={getSubtitleStyle()} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>

          {/* Right Action */}
          <View style={{ width: 40, alignItems: "flex-end" }}>
            {rightAction && (
              <TouchableOpacity
                onPress={rightAction.onPress}
                style={{
                  padding: theme.spacing.sm,
                  margin: -theme.spacing.sm,
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={rightAction.icon}
                  size={24}
                  color={theme.colors.textPrimary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
