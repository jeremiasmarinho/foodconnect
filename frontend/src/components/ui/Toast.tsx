import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../providers";

const { width } = Dimensions.get("window");

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onHide: (id: string) => void;
  actionLabel?: string;
  onAction?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 4000,
  onHide,
  actionLabel,
  onAction,
}) => {
  const { theme } = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide timer
    const timer = setTimeout(() => {
      hideToast();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const hideToast = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: -100,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide(id);
    });
  };

  const getToastConfig = () => {
    const configs = {
      success: {
        icon: "checkmark-circle" as keyof typeof Ionicons.glyphMap,
        backgroundColor: theme.colors.success,
        iconColor: "#FFFFFF",
        textColor: "#FFFFFF",
      },
      error: {
        icon: "close-circle" as keyof typeof Ionicons.glyphMap,
        backgroundColor: theme.colors.error,
        iconColor: "#FFFFFF",
        textColor: "#FFFFFF",
      },
      warning: {
        icon: "warning" as keyof typeof Ionicons.glyphMap,
        backgroundColor: theme.colors.warning,
        iconColor: "#FFFFFF",
        textColor: "#2D3436",
      },
      info: {
        icon: "information-circle" as keyof typeof Ionicons.glyphMap,
        backgroundColor: theme.colors.info,
        iconColor: "#FFFFFF",
        textColor: "#FFFFFF",
      },
    };

    return configs[type];
  };

  const config = getToastConfig();

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: Platform.OS === "ios" ? 50 : 20,
        left: theme.spacing.md,
        right: theme.spacing.md,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View
        style={{
          backgroundColor: config.backgroundColor,
          borderRadius: theme.layout.borderRadius.lg,
          padding: theme.spacing.md,
          flexDirection: "row",
          alignItems: "flex-start",
          minHeight: 60,
          ...theme.layout.shadow.medium,
        }}
      >
        <Ionicons
          name={config.icon}
          size={24}
          color={config.iconColor}
          style={{ marginRight: theme.spacing.md, marginTop: 2 }}
        />

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: config.textColor,
              fontSize: theme.typography.fontSize.md,
              fontWeight: theme.typography.fontWeight.semibold,
              marginBottom: message ? 4 : 0,
            }}
          >
            {title}
          </Text>
          
          {message && (
            <Text
              style={{
                color: config.textColor,
                fontSize: theme.typography.fontSize.sm,
                opacity: 0.9,
                lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
              }}
            >
              {message}
            </Text>
          )}

          {actionLabel && onAction && (
            <TouchableOpacity
              onPress={onAction}
              style={{
                marginTop: theme.spacing.sm,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  color: config.textColor,
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  textDecorationLine: "underline",
                }}
              >
                {actionLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={hideToast}
          style={{
            padding: 4,
            marginLeft: theme.spacing.sm,
          }}
        >
          <Ionicons
            name="close"
            size={20}
            color={config.iconColor}
            style={{ opacity: 0.8 }}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    actionLabel?: string;
    onAction?: () => void;
  }>;
  onHideToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onHideToast,
}) => {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onHide={onHideToast}
        />
      ))}
    </>
  );
};