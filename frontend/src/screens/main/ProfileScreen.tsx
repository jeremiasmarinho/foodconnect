import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../providers";
import { Button, Card, Header } from "../../components";
import { useCurrentUser, useLogout } from "../../hooks";

const { width } = Dimensions.get("window");
const imageSize = (width - 48) / 3; // 3 columns with 16px margins

export const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useCurrentUser();
  const logoutMutation = useLogout();
  const [activeTab, setActiveTab] = useState<"posts" | "liked">("posts");

  // Mock data - replace with real data from API
  const mockUser = {
    id: "1",
    name: user?.name || "João Silva",
    username: user?.username || "@joaosilva",
    email: user?.email || "joao@example.com",
    bio: "Apaixonado por gastronomia 🍕 | Sempre em busca dos melhores sabores | São Paulo, SP",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    postsCount: 24,
    followersCount: 156,
    followingCount: 89,
    joinedDate: "2024-01-15",
  };

  const mockPosts = [
    {
      id: "1",
      imageUrl:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
      likesCount: 12,
      commentsCount: 3,
    },
    {
      id: "2",
      imageUrl:
        "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400",
      likesCount: 8,
      commentsCount: 1,
    },
    {
      id: "3",
      imageUrl:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
      likesCount: 15,
      commentsCount: 5,
    },
    {
      id: "4",
      imageUrl:
        "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400",
      likesCount: 20,
      commentsCount: 7,
    },
    {
      id: "5",
      imageUrl:
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
      likesCount: 6,
      commentsCount: 2,
    },
    {
      id: "6",
      imageUrl:
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400",
      likesCount: 11,
      commentsCount: 4,
    },
  ];

  const handleEditProfile = () => {
    // @ts-ignore - Navigation will be properly typed when integrated
    navigation.navigate("EditProfile");
  };

  const handleSettings = () => {
    // TODO: Navigate to settings screen
    console.log("Navigate to settings");
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // Navigation will be handled by auth state change
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const renderProfileHeader = () => (
    <View
      style={[styles.profileHeader, { backgroundColor: theme.colors.surface }]}
    >
      {/* Avatar and Info */}
      <View style={styles.profileInfo}>
        <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
            {mockUser.name}
          </Text>
          <Text
            style={[styles.userHandle, { color: theme.colors.textSecondary }]}
          >
            {mockUser.username}
          </Text>
          {mockUser.bio && (
            <Text style={[styles.userBio, { color: theme.colors.textPrimary }]}>
              {mockUser.bio}
            </Text>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text
            style={[styles.statNumber, { color: theme.colors.textPrimary }]}
          >
            {mockUser.postsCount}
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            Posts
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text
            style={[styles.statNumber, { color: theme.colors.textPrimary }]}
          >
            {mockUser.followersCount}
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            Seguidores
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text
            style={[styles.statNumber, { color: theme.colors.textPrimary }]}
          >
            {mockUser.followingCount}
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            Seguindo
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          title="Editar Perfil"
          onPress={handleEditProfile}
          variant="outline"
          style={styles.editButton}
        />
        <TouchableOpacity
          style={[
            styles.settingsButton,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
          onPress={handleSettings}
        >
          <Ionicons
            name="settings-outline"
            size={20}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View
      style={[styles.tabContainer, { backgroundColor: theme.colors.surface }]}
    >
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "posts" && { borderBottomColor: theme.colors.primary },
        ]}
        onPress={() => setActiveTab("posts")}
      >
        <Ionicons
          name="grid-outline"
          size={20}
          color={
            activeTab === "posts"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === "posts"
                  ? theme.colors.primary
                  : theme.colors.textSecondary,
            },
          ]}
        >
          Posts
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "liked" && { borderBottomColor: theme.colors.primary },
        ]}
        onPress={() => setActiveTab("liked")}
      >
        <Ionicons
          name="heart-outline"
          size={20}
          color={
            activeTab === "liked"
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === "liked"
                  ? theme.colors.primary
                  : theme.colors.textSecondary,
            },
          ]}
        >
          Curtidas
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPostItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={[
        styles.postItem,
        {
          marginRight: (index + 1) % 3 === 0 ? 0 : 8,
        },
      ]}
      onPress={() => {
        // TODO: Navigate to post detail
        console.log("Navigate to post:", item.id);
      }}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
      <View style={styles.postOverlay}>
        <View style={styles.postStats}>
          <View style={styles.postStat}>
            <Ionicons name="heart" size={16} color="#FFFFFF" />
            <Text style={styles.postStatText}>{item.likesCount}</Text>
          </View>
          <View style={styles.postStat}>
            <Ionicons name="chatbubble" size={14} color="#FFFFFF" />
            <Text style={styles.postStatText}>{item.commentsCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyPosts = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="camera-outline"
        size={64}
        color={theme.colors.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
        {activeTab === "posts" ? "Nenhum post ainda" : "Nenhuma curtida ainda"}
      </Text>
      <Text
        style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}
      >
        {activeTab === "posts"
          ? "Compartilhe suas experiências gastronômicas!"
          : "Posts que você curtiu aparecerão aqui"}
      </Text>
      {activeTab === "posts" && (
        <Button
          title="Criar primeiro post"
          onPress={() => {
            // TODO: Navigate to create post
            console.log("Navigate to create post");
          }}
          style={styles.createPostButton}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          Perfil
        </Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons
            name="log-out-outline"
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}
        {renderTabs()}

        <View style={styles.contentContainer}>
          {activeTab === "posts" &&
            (mockPosts.length > 0 ? (
              <FlatList
                data={mockPosts}
                renderItem={renderPostItem}
                keyExtractor={(item) => item.id}
                numColumns={3}
                scrollEnabled={false}
                contentContainerStyle={styles.postsGrid}
              />
            ) : (
              renderEmptyPosts()
            ))}

          {activeTab === "liked" && renderEmptyPosts()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    padding: 16,
    marginBottom: 8,
  },
  profileInfo: {
    flexDirection: "row",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    marginBottom: 8,
  },
  userBio: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    paddingVertical: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    flex: 1,
    marginRight: 12,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  contentContainer: {
    padding: 16,
  },
  postsGrid: {
    paddingBottom: 20,
  },
  postItem: {
    width: imageSize,
    height: imageSize,
    marginBottom: 8,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  postOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 8,
  },
  postStats: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  postStat: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  postStatText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  createPostButton: {
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  logoutButton: {
    padding: 8,
  },
});
