import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { UIUserStories } from "./types";

interface StoryRingProps {
  userStories: UIUserStories;
  onPress: () => void;
  size?: number;
  isCurrentUser?: boolean;
}

export const StoryRing: React.FC<StoryRingProps> = ({
  userStories,
  onPress,
  size = 70,
  isCurrentUser = false,
}) => {
  const { username, name, avatar, hasUnviewed, stories } = userStories;

  const renderStoryRing = () => {
    if (isCurrentUser) {
      // Always show gradient ring for current user (to add story)
      return (
        <LinearGradient
          colors={["#ff6b6b", "#4ecdc4", "#45b7d1"]}
          style={[styles.gradientRing, { width: size + 4, height: size + 4 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.innerRing, { width: size, height: size }]}>
            <Image
              source={{
                uri:
                  avatar ||
                  `https://ui-avatars.com/api/?name=${name}&background=ff6b6b&color=fff`,
              }}
              style={[styles.avatar, { width: size - 4, height: size - 4 }]}
            />
          </View>
        </LinearGradient>
      );
    }

    if (hasUnviewed) {
      // Gradient ring for unviewed stories
      return (
        <LinearGradient
          colors={["#ff6b6b", "#4ecdc4", "#45b7d1"]}
          style={[styles.gradientRing, { width: size + 4, height: size + 4 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.innerRing, { width: size, height: size }]}>
            <Image
              source={{
                uri:
                  avatar ||
                  `https://ui-avatars.com/api/?name=${name}&background=ff6b6b&color=fff`,
              }}
              style={[styles.avatar, { width: size - 4, height: size - 4 }]}
            />
          </View>
        </LinearGradient>
      );
    }

    // Gray ring for viewed stories
    return (
      <View
        style={[
          styles.viewedRing,
          { width: size + 4, height: size + 4, borderRadius: (size + 4) / 2 },
        ]}
      >
        <Image
          source={{
            uri:
              avatar ||
              `https://ui-avatars.com/api/?name=${name}&background=cccccc&color=666`,
          }}
          style={[
            styles.avatar,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
      </View>
    );
  };

  const displayName =
    username.length > 10 ? `${username.substring(0, 10)}...` : username;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {renderStoryRing()}
      <Text style={styles.username} numberOfLines={1}>
        {isCurrentUser ? "Seu story" : displayName}
      </Text>
      {stories.length > 0 && (
        <View style={styles.storyCount}>
          <Text style={styles.storyCountText}>{stories.length}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginHorizontal: 8,
    width: 80,
  },
  gradientRing: {
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  innerRing: {
    backgroundColor: "white",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  viewedRing: {
    borderWidth: 2,
    borderColor: "#e1e8ed",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    borderRadius: 50,
  },
  username: {
    marginTop: 4,
    fontSize: 12,
    color: "#1a1a1a",
    textAlign: "center",
    fontWeight: "500",
  },
  storyCount: {
    position: "absolute",
    top: -2,
    right: 12,
    backgroundColor: "#ff6b6b",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  storyCountText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});
