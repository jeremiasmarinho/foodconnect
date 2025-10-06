import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  StatusBar,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { UIUserStories } from "./types";

const { width, height } = Dimensions.get("window");

interface StoryViewerProps {
  visible: boolean;
  userStories: UIUserStories[];
  initialUserIndex?: number;
  initialStoryIndex?: number;
  onClose: () => void;
  onStoryView: (storyId: string) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  visible,
  userStories,
  initialUserIndex = 0,
  initialStoryIndex = 0,
  onClose,
  onStoryView,
}) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const currentUser = userStories[currentUserIndex];
  const currentStory = currentUser?.stories[currentStoryIndex];

  useEffect(() => {
    if (!visible || !currentStory || paused) return;

    // Mark story as viewed
    if (!currentStory.hasViewed) {
      onStoryView(currentStory.id);
    }

    let interval: NodeJS.Timeout;
    const duration = 5000; // 5 seconds per story
    const increment = 100 / (duration / 50); // Update every 50ms

    interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + increment;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [visible, currentUserIndex, currentStoryIndex, paused]);

  const nextStory = () => {
    if (!currentUser) return;

    if (currentStoryIndex < currentUser.stories.length - 1) {
      // Next story from same user
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else {
      // Next user
      if (currentUserIndex < userStories.length - 1) {
        setCurrentUserIndex(currentUserIndex + 1);
        setCurrentStoryIndex(0);
        setProgress(0);
      } else {
        // End of stories
        onClose();
      }
    }
  };

  const previousStory = () => {
    if (currentStoryIndex > 0) {
      // Previous story from same user
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    } else {
      // Previous user
      if (currentUserIndex > 0) {
        const prevUserIndex = currentUserIndex - 1;
        const prevUser = userStories[prevUserIndex];
        setCurrentUserIndex(prevUserIndex);
        setCurrentStoryIndex(prevUser.stories.length - 1);
        setProgress(0);
      }
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const storyDate = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - storyDate.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "agora";
    if (diffInHours === 1) return "1h";
    return `${diffInHours}h`;
  };

  if (!visible || !currentUser || !currentStory) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <View style={styles.container}>
        {/* Story Image */}
        <Image
          source={{ uri: currentStory.mediaUrl }}
          style={styles.storyImage}
          resizeMode="cover"
        />

        {/* Dark overlay for better text visibility */}
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.3)"]}
          style={styles.overlay}
        />

        {/* Progress bars */}
        <View style={styles.progressContainer}>
          {currentUser.stories.map((_, index) => (
            <View key={index} style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width:
                      index === currentStoryIndex
                        ? `${progress}%`
                        : index < currentStoryIndex
                        ? "100%"
                        : "0%",
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{
                uri:
                  currentUser.avatar ||
                  `https://ui-avatars.com/api/?name=${currentUser.name}&background=ff6b6b&color=fff`,
              }}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text style={styles.username}>{currentUser.username}</Text>
              <Text style={styles.timeAgo}>
                {formatTimeAgo(currentStory.createdAt)}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Story content */}
        {currentStory.content && (
          <View style={styles.contentContainer}>
            <Text style={styles.content}>{currentStory.content}</Text>
          </View>
        )}

        {/* Navigation areas */}
        <TouchableOpacity
          style={styles.leftTouchArea}
          onPress={previousStory}
          activeOpacity={1}
        />
        <TouchableOpacity
          style={styles.rightTouchArea}
          onPress={nextStory}
          activeOpacity={1}
        />

        {/* Pause/Play on long press */}
        <TouchableOpacity
          style={styles.pauseArea}
          onLongPress={() => setPaused(true)}
          onPressOut={() => setPaused(false)}
          activeOpacity={1}
        />

        {/* View count (for own stories) */}
        {currentStory.userId === "current-user-id" && (
          <View style={styles.viewCount}>
            <Ionicons name="eye" size={16} color="white" />
            <Text style={styles.viewCountText}>{currentStory.viewCount}</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  storyImage: {
    width,
    height,
    position: "absolute",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  progressContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingTop: StatusBar.currentHeight || 44,
    gap: 4,
  },
  progressBarContainer: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  timeAgo: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  closeButton: {
    padding: 8,
  },
  contentContainer: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
  },
  content: {
    color: "white",
    fontSize: 16,
    lineHeight: 24,
  },
  leftTouchArea: {
    position: "absolute",
    left: 0,
    top: 0,
    width: width * 0.3,
    height: height,
  },
  rightTouchArea: {
    position: "absolute",
    right: 0,
    top: 0,
    width: width * 0.3,
    height: height,
  },
  pauseArea: {
    position: "absolute",
    left: width * 0.3,
    top: 0,
    width: width * 0.4,
    height: height,
  },
  viewCount: {
    position: "absolute",
    bottom: 50,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewCountText: {
    color: "white",
    fontSize: 12,
    marginLeft: 4,
  },
});
