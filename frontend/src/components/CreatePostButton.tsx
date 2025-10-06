import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LIGHT_THEME } from "../constants/theme";

interface CreatePostButtonProps {
  userAvatar?: string;
  onPress?: () => void;
}

export const CreatePostButton: React.FC<CreatePostButtonProps> = ({
  userAvatar = "https://via.placeholder.com/40x40?text=👤",
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Image source={{ uri: userAvatar }} style={styles.avatar} />
        <Text style={styles.placeholder}>O que você está comendo hoje?</Text>
        <View style={styles.rightActions}>
          <Ionicons
            name="camera-outline"
            size={24}
            color={LIGHT_THEME.textSecondary}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: LIGHT_THEME.surface,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.surfaceVariant,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  placeholder: {
    flex: 1,
    fontSize: 16,
    color: LIGHT_THEME.textSecondary,
  },
  rightActions: {
    marginLeft: 12,
  },
});
