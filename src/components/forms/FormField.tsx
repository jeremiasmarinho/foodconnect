import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { useField } from "formik";
import { colors } from "../../styles/colors";
import { getFieldError, hasFieldError } from "../../utils/validation/schemas";

interface FormFieldProps
  extends Omit<TextInputProps, "value" | "onChangeText" | "onBlur"> {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: TextInputProps["keyboardType"];
  secureTextEntry?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  mask?: (value: string) => string;
  helperText?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = "default",
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  mask,
  helperText,
  style,
  ...textInputProps
}) => {
  const [field, meta, helpers] = useField(name);
  const { value } = field;
  const { error, touched } = meta;
  const { setValue, setTouched } = helpers;

  const hasError = touched && error;
  const displayValue = mask && value ? mask(value) : value || "";

  const handleChangeText = (text: string) => {
    // Remove mask for storage
    let cleanText = text;
    if (mask) {
      // Simple cleanup - remove common mask characters
      cleanText = text.replace(/[^\w\s@.-]/g, "");
    }
    setValue(cleanText);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      </View>

      <View
        style={[
          styles.inputContainer,
          hasError && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
          style,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          {...textInputProps}
          value={displayValue}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          placeholder={placeholder || label}
          placeholderTextColor={colors.textLight}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          style={[
            styles.input,
            multiline ? styles.inputMultiline : null,
            leftIcon ? styles.inputWithLeftIcon : null,
            rightIcon ? styles.inputWithRightIcon : null,
          ].filter(Boolean)}
        />

        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {hasError && <Text style={styles.errorText}>{error}</Text>}

      {helperText && !hasError && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  required: {
    color: colors.error,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputContainerError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  inputContainerDisabled: {
    backgroundColor: "#F5F5F5",
    borderColor: colors.disabled,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 12,
  },
  inputMultiline: {
    paddingVertical: 12,
    textAlignVertical: "top",
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
    padding: 4,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: 4,
  },
  helperText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

export default FormField;
