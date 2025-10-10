import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
} from "react-native";
import { useStories } from "../../hooks/useStories";
import { UserStories, Story } from "../../services/story";
import { StoryViewer } from "./StoryViewer";
import { UIUserStories } from "./types";

interface StoriesContainerProps {
  currentUserId: string;
}

/**
 * Converter function to transform domain types to UI types
 * Converts Date objects to ISO strings for UI components
 */
const mapToUIUserStories = (userStories: UserStories[]): UIUserStories[] => {
  return userStories.map((userStory) => ({
    userId: userStory.userId,
    username: userStory.username,
    name: userStory.name,
    avatar: userStory.avatar,
    hasUnviewed: userStory.hasUnviewed,
    stories: userStory.stories.map((story: Story) => ({
      id: story.id,
      userId: story.userId,
      content: story.content,
      mediaUrl: story.mediaUrl,
      mediaType: story.mediaType || "image",
      createdAt: story.createdAt.toISOString(),
      expiresAt: story.expiresAt.toISOString(),
      user: {
        id: story.user.id,
        username: story.user.username,
        name: story.user.name,
        avatar: story.user.avatar,
      },
      viewCount: story.viewCount,
      hasViewed: story.hasViewed,
    })),
  }));
};

/**
 * Container principal do sistema de Stories
 * Integrado com hook useStories para gerenciamento completo
 */
export const StoriesContainer: React.FC<StoriesContainerProps> = ({
  currentUserId,
}) => {
  const {
    userStories,
    loading,
    error,
    currentStory,
    goToUserStories,
    closeStoryViewer,
    nextStory,
    previousStory,
  } = useStories();

  // Estado local para controlar o viewer
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleOpenStory = (userIndex: number) => {
    goToUserStories(userIndex);
    setIsViewerOpen(true);
  };

  const handleCloseStory = () => {
    setIsViewerOpen(false);
    closeStoryViewer();
  };

  if (loading && userStories.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#E91E63" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
      </View>
    );
  }

  if (userStories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>📸 Nenhum story disponível</Text>
        <Text style={styles.emptySubtext}>
          Siga pessoas ou crie seu primeiro story
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Lista horizontal de Stories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        {userStories.map((userStory, index) => {
          const isCurrentUser = userStory.userId === currentUserId;
          const hasUnviewed = userStory.hasUnviewed;

          return (
            <TouchableOpacity
              key={userStory.userId}
              style={styles.storyItem}
              onPress={() => handleOpenStory(index)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.avatarContainer,
                  hasUnviewed && styles.unviewedRing,
                  !hasUnviewed && styles.viewedRing,
                ]}
              >
                {userStory.avatar ? (
                  <Image
                    source={{ uri: userStory.avatar }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarPlaceholderText}>
                      {userStory.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}

                {/* Badge de contagem de stories */}
                {userStory.stories.length > 1 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>
                      {userStory.stories.length}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.username} numberOfLines={1}>
                {isCurrentUser ? "Seu story" : userStory.username}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Story Viewer Modal */}
      {isViewerOpen && currentStory && (
        <StoryViewer
          visible={isViewerOpen}
          userStories={mapToUIUserStories(userStories)}
          onClose={handleCloseStory}
          onStoryView={(storyId) => {
            // A visualização já é marcada automaticamente pelo hook
            console.log("Story viewed:", storyId);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  errorText: {
    color: "#E91E63",
    fontSize: 14,
    textAlign: "center",
  },
  emptyContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
  },
  emptySubtext: {
    color: "#999",
    fontSize: 12,
    textAlign: "center",
  },
  scrollContainer: {
    backgroundColor: "#fff",
    paddingVertical: 12,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  storyItem: {
    alignItems: "center",
    marginRight: 12,
    width: 70,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
    marginBottom: 4,
    position: "relative",
  },
  unviewedRing: {
    borderWidth: 2,
    borderColor: "#E91E63",
  },
  viewedRing: {
    borderWidth: 2,
    borderColor: "#ddd",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 29,
    backgroundColor: "#f0f0f0",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 29,
    backgroundColor: "#E91E63",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  countBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#E91E63",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  countBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 4,
  },
  username: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
    maxWidth: 70,
  },
  loading: {
    height: 100,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    margin: 16,
  },
});
