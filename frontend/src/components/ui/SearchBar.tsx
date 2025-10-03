import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../providers";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: ViewStyle;
  showFilter?: boolean;
  onFilterPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "O que você está procurando?",
  value,
  onChangeText,
  onSearch,
  onFocus,
  onBlur,
  style,
  showFilter = false,
  onFilterPress,
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleSearch = () => {
    if (onSearch && value) {
      onSearch(value);
    }
  };

  const getContainerStyle = (): ViewStyle => ({
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.layout.borderRadius.round,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1.5,
    borderColor: isFocused ? theme.colors.primary : theme.colors.border,
    minHeight: theme.layout.searchBarHeight,
    ...theme.layout.shadow.small,
    ...style,
  });

  const getInputStyle = (): TextStyle => ({
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.regular,
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  });

  return (
    <View style={getContainerStyle()}>
      <Ionicons
        name="search"
        size={20}
        color={isFocused ? theme.colors.primary : theme.colors.textTertiary}
      />

      <TextInput
        style={getInputStyle()}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textPlaceholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />

      {value && value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText?.("")}
          style={{ padding: 2 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="close-circle"
            size={18}
            color={theme.colors.textTertiary}
          />
        </TouchableOpacity>
      )}

      {showFilter && (
        <TouchableOpacity
          onPress={onFilterPress}
          style={{
            marginLeft: theme.spacing.sm,
            padding: 2,
          }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="options"
            size={20}
            color={theme.colors.textTertiary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};
