import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LIGHT_THEME } from "../constants/theme";

const { width } = Dimensions.get("window");
const STORY_SIZE = 64;
const STORY_MARGIN = 12;

interface Story {
  id: string;
  user: {
    id: string;
    username: string;
    avatar: string;
  };
  hasNewStory: boolean;
  isMyStory?: boolean;
}

interface StoriesProps {
  stories?: Story[];
  onStoryPress?: (story: Story) => void;
  onAddStoryPress?: () => void;
}

export const Stories: React.FC<StoriesProps> = ({
  stories = [],
  onStoryPress,
  onAddStoryPress,
}) => {
  // Mock stories data
  const mockStories: Story[] = [
    {
      id: "my-story",
      user: {
        id: "current-user",
        username: "Seu story",
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
      },
      hasNewStory: false,
      isMyStory: true,
    },
    {
      id: "1",
      user: {
        id: "user1",
        username: "chef_marco",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      },
      hasNewStory: true,
    },
    {
      id: "2",
      user: {
        id: "user2",
        username: "maria_gourmet",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b9cbb4e4?w=150&h=150&fit=crop&crop=face",
      },
      hasNewStory: true,
    },
    {
      id: "3",
      user: {
        id: "user3",
        username: "sushimaster_ken",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      },
      hasNewStory: false,
    },
    {
      id: "4",
      user: {
        id: "user4",
        username: "doceria_bella",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      },
      hasNewStory: true,
    },
    {
      id: "5",
      user: {
        id: "user5",
        username: "burguer_station",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      },
      hasNewStory: true,
    },
  ];

  const allStories = stories.length > 0 ? stories : mockStories;

  const handleStoryPress = (story: Story) => {
    if (story.isMyStory && onAddStoryPress) {
      onAddStoryPress();
    } else if (onStoryPress) {
      onStoryPress(story);
    }
  };

  const renderStory = (story: Story) => (
    <TouchableOpacity
      key={story.id}
      style={styles.storyContainer}
      onPress={() => handleStoryPress(story)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.storyImageContainer,
          story.hasNewStory && !story.isMyStory && styles.newStoryBorder,
          story.isMyStory && styles.myStoryBorder,
        ]}
      >
        <Image source={{ uri: story.user.avatar }} style={styles.storyImage} />
        {story.isMyStory && (
          <View style={styles.addStoryButton}>
            <Ionicons name="add" size={16} color="white" />
          </View>
        )}
      </View>
      <Text style={styles.storyUsername} numberOfLines={1}>
        {story.user.username}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {allStories.map(renderStory)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: LIGHT_THEME.surface,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.surfaceVariant,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  storyContainer: {
    alignItems: "center",
    marginRight: STORY_MARGIN,
    width: STORY_SIZE + 8,
  },
  storyImageContainer: {
    width: STORY_SIZE,
    height: STORY_SIZE,
    borderRadius: STORY_SIZE / 2,
    padding: 2,
    position: "relative",
  },
  newStoryBorder: {
    borderWidth: 2,
    borderColor: LIGHT_THEME.primary,
  },
  myStoryBorder: {
    borderWidth: 2,
    borderColor: LIGHT_THEME.textSecondary,
  },
  storyImage: {
    width: "100%",
    height: "100%",
    borderRadius: (STORY_SIZE - 4) / 2,
  },
  addStoryButton: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: LIGHT_THEME.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: LIGHT_THEME.surface,
  },
  storyUsername: {
    fontSize: 12,
    color: LIGHT_THEME.textPrimary,
    marginTop: 8,
    textAlign: "center",
    maxWidth: STORY_SIZE + 8,
  },
});
