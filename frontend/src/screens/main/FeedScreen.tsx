import React from "react";
import { SimpleStoriesContainer } from "../../components/Stories";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../providers";
import { Loading, EmptyState } from "../../components/ui";
import { Post } from "../../components/Post";
import { CreatePostButton } from "../../components/CreatePostButton";
import { usePost } from "../../hooks/usePost";
import { LIGHT_THEME } from "../../constants/theme";

export const FeedScreen: React.FC = () => {
  const { user } = useAuth();
  const {
    posts,
    loading,
    refreshing,
    refreshPosts,
    toggleLike,
    toggleSave,
    openComments,
    sharePost,
    openUserProfile,
  } = usePost();

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.logo}>FeedConnect</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons
            name="heart-outline"
            size={24}
            color={LIGHT_THEME.textPrimary}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={24}
            color={LIGHT_THEME.textPrimary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleCreatePostPress = () => {
    console.log("Create post pressed");
  };

  const renderPost = ({ item }: { item: any }) => (
    <Post
      post={item}
      onLike={toggleLike}
      onComment={openComments}
      onSave={toggleSave}
      onShare={sharePost}
      onUserPress={openUserProfile}
    />
  );

  const renderEmpty = () => (
    <EmptyState
      title="Nenhum post ainda"
      description="Seja o primeiro a compartilhar algo!"
      icon="restaurant-outline"
    />
  );

  if (loading && posts.length === 0) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={LIGHT_THEME.surface}
      />
      {renderHeader()}

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshPosts}
            colors={[LIGHT_THEME.primary]}
            tintColor={LIGHT_THEME.primary}
          />
        }
        ListHeaderComponent={() => (
          <View>
            {/* Stories Section */}
            <SimpleStoriesContainer currentUserId={user?.id || "temp-user"} />

            {/* Create Post Button */}
            <CreatePostButton
              userAvatar={user?.avatar}
              onPress={handleCreatePostPress}
            />
          </View>
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          posts.length === 0 ? styles.emptyContainer : undefined
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_THEME.surface,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: LIGHT_THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.border,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: LIGHT_THEME.primary,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 16,
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  separator: {
    height: 1,
    backgroundColor: LIGHT_THEME.border,
  },
});
