import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../providers";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  variant?: "default" | "filled" | "outline";
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  variant = "outline",
  secureTextEntry,
  ...textInputProps
}) => {
  const { theme } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = secureTextEntry;
  const actualSecureTextEntry = isPassword && !isPasswordVisible;

  const handleRightIconPress = () => {
    if (isPassword) {
      setIsPasswordVisible(!isPasswordVisible);
    } else if (onRightIconPress) {
      onRightIconPress();
    }
  };

  const actualRightIcon = isPassword
    ? isPasswordVisible
      ? "eye-off"
      : "eye"
    : rightIcon;

  const getContainerStyle = (): ViewStyle => {
    return {
      marginBottom: theme.spacing.lg,
      ...containerStyle,
    };
  };

  const getLabelStyle = (): TextStyle => {
    return {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
      ...labelStyle,
    };
  };

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 48,
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        borderBottomWidth: 1,
        borderBottomColor: isFocused
          ? theme.colors.primary
          : theme.colors.border,
        backgroundColor: "transparent",
      },
      filled: {
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: theme.layout.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        borderWidth: 1,
        borderColor: isFocused ? theme.colors.primary : "transparent",
      },
      outline: {
        borderWidth: 1.5,
        borderColor: error
          ? theme.colors.error
          : isFocused
          ? theme.colors.primary
          : theme.colors.border,
        borderRadius: theme.layout.borderRadius.md,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.spacing.md,
        ...(!error && isFocused ? theme.layout.shadow.small : {}),
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const getInputStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.textPrimary,
      fontWeight: theme.typography.fontWeight.regular,
    };

    const variantStyles: Record<string, TextStyle> = {
      default: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: leftIcon ? theme.spacing.sm : 0,
      },
      filled: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: leftIcon ? theme.spacing.sm : 0,
      },
      outline: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: leftIcon ? theme.spacing.sm : 0,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...inputStyle,
    };
  };

  const getIconColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.primary;
    return theme.colors.textTertiary;
  };

  const getHelperTextStyle = (): TextStyle => {
    return {
      fontSize: theme.typography.fontSize.sm,
      color: error ? theme.colors.error : theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
      fontWeight: theme.typography.fontWeight.regular,
    };
  };

  return (
    <View style={getContainerStyle()}>
      {label && <Text style={getLabelStyle()}>{label}</Text>}

      <View style={getInputContainerStyle()}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={getIconColor()}
            style={{
              marginRight: theme.spacing.sm,
              ...(variant === "default" && { marginLeft: 0 }),
            }}
          />
        )}

        <TextInput
          style={getInputStyle()}
          secureTextEntry={actualSecureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={theme.colors.textPlaceholder}
          {...textInputProps}
        />

        {(actualRightIcon || isPassword) && (
          <TouchableOpacity
            onPress={handleRightIconPress}
            style={{
              padding: theme.spacing.sm,
              ...(variant === "default" && { paddingRight: 0 }),
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={actualRightIcon as any}
              size={20}
              color={getIconColor()}
            />
          </TouchableOpacity>
        )}
      </View>

      {(error || helperText) && (
        <Text style={getHelperTextStyle()}>{error || helperText}</Text>
      )}
    </View>
  );
};
