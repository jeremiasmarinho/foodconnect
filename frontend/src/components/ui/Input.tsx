import React, { useState, useMemo } from "react";
import {
  TextInput,
  View,
  Text,
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  StyleSheet,
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

  // Memoize styles to prevent re-renders
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: theme.spacing.lg,
        },
        label: {
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.sm,
        },
        inputContainer: {
          flexDirection: "row",
          alignItems: "center",
          minHeight: 48,
        },
        inputContainerDefault: {
          borderBottomWidth: 1,
          borderBottomColor: isFocused
            ? theme.colors.primary
            : theme.colors.border,
          backgroundColor: "transparent",
        },
        inputContainerFilled: {
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: theme.layout.borderRadius.md,
          paddingHorizontal: theme.spacing.md,
          borderWidth: 1,
          borderColor: isFocused ? theme.colors.primary : "transparent",
        },
        inputContainerOutline: {
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
        input: {
          flex: 1,
          fontSize: theme.typography.fontSize.md,
          color: theme.colors.textPrimary,
          fontWeight: theme.typography.fontWeight.regular,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: leftIcon ? theme.spacing.sm : 0,
        },
        inputDefault: {
          paddingVertical: theme.spacing.sm,
        },
        leftIcon: {
          marginRight: theme.spacing.sm,
        },
        rightIconButton: {
          padding: theme.spacing.sm,
        },
        helperText: {
          fontSize: theme.typography.fontSize.sm,
          color: error ? theme.colors.error : theme.colors.textSecondary,
          marginTop: theme.spacing.xs,
          fontWeight: theme.typography.fontWeight.regular,
        },
      }),
    [theme, isFocused, error, leftIcon, variant]
  );

  const getIconColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.primary;
    return theme.colors.textTertiary;
  };

  const getInputContainerStyle = () => {
    const baseStyle = styles.inputContainer;
    const variantStyle =
      variant === "default"
        ? styles.inputContainerDefault
        : variant === "filled"
        ? styles.inputContainerFilled
        : styles.inputContainerOutline;

    return [baseStyle, variantStyle];
  };

  const getInputStyle = () => {
    const baseStyle = styles.input;
    const variantStyle = variant === "default" ? styles.inputDefault : {};

    return [baseStyle, variantStyle, inputStyle];
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <View style={getInputContainerStyle()}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={getIconColor()}
            style={[
              styles.leftIcon,
              variant === "default" && { marginLeft: 0 },
            ]}
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
            style={[
              styles.rightIconButton,
              variant === "default" && { paddingRight: 0 },
            ]}
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
        <Text style={styles.helperText}>{error || helperText}</Text>
      )}
    </View>
  );
};
