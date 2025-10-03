import React from "react";
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
} from "react-native";

interface LoadingProps {
  size?: "small" | "large";
  color?: string;
  text?: string;
  style?: ViewStyle;
}

export const Loading: React.FC<LoadingProps> = ({
  size = "large",
  color = "#007AFF",
  text,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
  },
});
