import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from "react-native";
import { colors } from "../../styles/colors";

interface FormButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const FormButton: React.FC<FormButtonProps> = React.memo(
  ({
    title,
    loading = false,
    variant = "primary",
    size = "medium",
    fullWidth = true,
    leftIcon,
    rightIcon,
    disabled,
    style,
    ...touchableProps
  }) => {
    const isDisabled = disabled || loading;

    const getBackgroundColor = () => {
      if (isDisabled) return colors.disabled;

      switch (variant) {
        case "primary":
          return colors.primary;
        case "secondary":
          return colors.secondary;
        case "danger":
          return colors.error;
        case "outline":
          return "transparent";
        default:
          return colors.primary;
      }
    };

    const getTextColor = () => {
      if (isDisabled) return "#FFFFFF";

      switch (variant) {
        case "outline":
          return colors.primary;
        default:
          return "#FFFFFF";
      }
    };

    const getBorderColor = () => {
      if (variant === "outline") {
        return isDisabled ? colors.disabled : colors.primary;
      }
      return "transparent";
    };

    const getButtonSize = () => {
      switch (size) {
        case "small":
          return { paddingVertical: 8, paddingHorizontal: 16 };
        case "large":
          return { paddingVertical: 16, paddingHorizontal: 24 };
        default:
          return { paddingVertical: 12, paddingHorizontal: 20 };
      }
    };

    const getFontSize = () => {
      switch (size) {
        case "small":
          return 14;
        case "large":
          return 18;
        default:
          return 16;
      }
    };

    return (
      <TouchableOpacity
        {...touchableProps}
        disabled={isDisabled}
        style={[
          styles.button,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            ...getButtonSize(),
          },
          fullWidth && styles.fullWidth,
          variant === "outline" && styles.outline,
          isDisabled && styles.disabled,
          style,
        ]}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={getTextColor()}
              style={styles.loader}
            />
          ) : (
            <>
              {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

              <Text
                style={[
                  styles.text,
                  {
                    color: getTextColor(),
                    fontSize: getFontSize(),
                  },
                ]}
              >
                {title}
              </Text>

              {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  fullWidth: {
    width: "100%",
  },
  outline: {
    borderWidth: 2,
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  loader: {
    marginRight: 8,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default FormButton;
