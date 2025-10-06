import React, { useMemo, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { StoryRing } from "./StoryRing";
import { StoryViewer } from "./StoryViewer";
import { StoryCreator } from "./StoryCreator";
import { useStoriesController } from "../../hooks/useStoriesController";
import { storiesService } from "../../services/stories.service";
import { Story as ApiStory } from "../../types/stories.types";
import { UIStory, UIUserStories } from "./types";
import { mapStoriesToUIUserGroups } from "./mapStories";

// Using shared UI types

interface StoriesListProps {
  currentUserId: string;
  onStoryView?: (storyId: string) => void;
  onStoryCreate?: (storyData: any) => void;
  onRefresh?: () => void;
}

export const StoriesList: React.FC<StoriesListProps> = ({
  currentUserId,
  onStoryView,
  onStoryCreate,
  onRefresh,
}) => {
  const { stories, loading, refreshStories, markAsViewed } =
    useStoriesController(currentUserId);
  const [userStories, setUserStories] = useState<UIUserStories[]>([]);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [creatorVisible, setCreatorVisible] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

  // Map flat stories -> grouped by user for UI components that expect rings per user
  const groupedStories: UIUserStories[] = useMemo(
    () => mapStoriesToUIUserGroups(currentUserId, stories as ApiStory[]),
    [stories, currentUserId]
  );

  // Keep local state in sync for viewer controls
  React.useEffect(() => {
    setUserStories(groupedStories);
  }, [groupedStories]);

  const handleStoryPress = (userIndex: number, storyIndex: number = 0) => {
    setSelectedUserIndex(userIndex);
    setSelectedStoryIndex(storyIndex);
    setViewerVisible(true);
  };

  const handleCreateStoryPress = () => {
    setCreatorVisible(true);
  };

  const handleStoryView = async (storyId: string) => {
    try {
      await markAsViewed(storyId);
      onStoryView?.(storyId);
    } catch (error) {
      console.error("Error marking story as viewed:", error);
    }
  };

  const handleStoryCreate = async (storyData: any) => {
    try {
      // Align with service typing: only send imageUrl for now
      const created = await storiesService.createStory({
        imageUrl: storyData.mediaUrl,
      });

      // Optimistic update for UI grouping
      setUserStories((prev) => {
        const currentUserIndex = prev.findIndex(
          (u) => u.userId === currentUserId
        );
        const mapped: any = {
          id: created.id,
          userId: created.userId,
          mediaUrl: created.imageUrl,
          mediaType: "image",
          createdAt: created.createdAt,
          expiresAt: created.expiresAt,
          user: {
            id: created.userId,
            username: created.username,
            name: created.username,
            avatar: created.userAvatar,
          },
          viewCount: 0,
          hasViewed: false,
        };

        if (currentUserIndex >= 0) {
          const updated = [...prev];
          updated[currentUserIndex] = {
            ...updated[currentUserIndex],
            stories: [...updated[currentUserIndex].stories, mapped],
            hasUnviewed: true,
          };
          return updated;
        }
        return [
          {
            userId: currentUserId,
            username: created.username ?? "Você",
            name: created.username ?? "Seu nome",
            avatar: created.userAvatar,
            stories: [mapped],
            hasUnviewed: true,
          },
          ...prev,
        ];
      });

      onStoryCreate?.(created);
      Alert.alert("Sucesso", "Story criado com sucesso!");
    } catch (error) {
      console.error("Error creating story:", error);
      Alert.alert("Erro", "Erro ao criar story");
    }
  };

  const handleRefresh = () => {
    refreshStories();
    onRefresh?.();
  };

  // Find current user stories or create placeholder
  const currentUserStories = userStories.find(
    (u) => u.userId === currentUserId
  ) || {
    userId: currentUserId,
    username: "Você",
    name: "Seu nome",
    avatar: undefined,
    stories: [],
    hasUnviewed: false,
  };

  // Other users' stories
  const otherUsersStories = userStories.filter(
    (u) => u.userId !== currentUserId
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        {/* Current user story (always first) */}
        <StoryRing
          userStories={currentUserStories}
          onPress={
            currentUserStories.stories.length > 0
              ? () => handleStoryPress(0, 0)
              : handleCreateStoryPress
          }
          isCurrentUser={true}
        />

        {/* Other users' stories */}
        {otherUsersStories.map((userStory, index) => (
          <StoryRing
            key={userStory.userId}
            userStories={userStory}
            onPress={() => handleStoryPress(index + 1, 0)}
          />
        ))}
      </ScrollView>

      {/* Story Viewer Modal */}
      <StoryViewer
        visible={viewerVisible}
        userStories={[currentUserStories, ...otherUsersStories]}
        initialUserIndex={selectedUserIndex}
        initialStoryIndex={selectedStoryIndex}
        onClose={() => setViewerVisible(false)}
        onStoryView={handleStoryView}
      />

      {/* Story Creator Modal */}
      <StoryCreator
        visible={creatorVisible}
        onClose={() => setCreatorVisible(false)}
        onSubmit={handleStoryCreate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
});
