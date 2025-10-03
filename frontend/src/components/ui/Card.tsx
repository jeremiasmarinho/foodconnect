import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Image,
} from "react-native";
import { useTheme } from "../../providers";

interface CardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: "default" | "elevated" | "outlined";
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = "default",
}) => {
  const { theme } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.layout.borderRadius.lg,
      padding: theme.spacing.lg,
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: theme.colors.surface,
      },
      elevated: {
        backgroundColor: theme.colors.surface,
        ...theme.layout.shadow.medium,
      },
      outlined: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
};

// Restaurant Card Component (iFood-inspired)
interface RestaurantCardProps {
  id: string;
  name: string;
  description?: string;
  image?: string;
  rating?: number;
  deliveryTime?: string;
  deliveryFee?: string;
  cuisine?: string;
  onPress: () => void;
  style?: ViewStyle;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  name,
  description,
  image,
  rating,
  deliveryTime,
  deliveryFee,
  cuisine,
  onPress,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.layout.borderRadius.lg,
          marginBottom: theme.spacing.md,
          overflow: "hidden",
          ...theme.layout.shadow.small,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {image && (
        <Image
          source={{ uri: image }}
          style={{
            width: "100%",
            height: 160,
            backgroundColor: theme.colors.surfaceVariant,
          }}
          resizeMode="cover"
        />
      )}

      <View style={{ padding: theme.spacing.lg }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: theme.spacing.sm,
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.textPrimary,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {name}
          </Text>

          {rating && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.colors.primary,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: 2,
                borderRadius: theme.layout.borderRadius.sm,
                marginLeft: theme.spacing.sm,
              }}
            >
              <Text
                style={{
                  color: theme.colors.textOnPrimary,
                  fontSize: theme.typography.fontSize.xs,
                  fontWeight: theme.typography.fontWeight.semibold,
                }}
              >
                ★ {rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        {description && (
          <Text
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.textSecondary,
              marginBottom: theme.spacing.sm,
            }}
            numberOfLines={2}
          >
            {description}
          </Text>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {cuisine && (
            <Text
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.textTertiary,
                backgroundColor: theme.colors.surfaceVariant,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: 2,
                borderRadius: theme.layout.borderRadius.sm,
              }}
            >
              {cuisine}
            </Text>
          )}

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {deliveryTime && (
              <Text
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textSecondary,
                  marginRight: theme.spacing.md,
                }}
              >
                🕐 {deliveryTime}
              </Text>
            )}

            {deliveryFee && (
              <Text
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color:
                    deliveryFee === "Grátis"
                      ? theme.colors.success
                      : theme.colors.textSecondary,
                  fontWeight:
                    deliveryFee === "Grátis"
                      ? theme.typography.fontWeight.semibold
                      : theme.typography.fontWeight.regular,
                }}
              >
                {deliveryFee}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
