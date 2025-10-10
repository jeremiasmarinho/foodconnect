import React, { useState } from "react";
import { SimpleStoriesContainer } from "../../components/Stories";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import { useAuth } from "../../providers";
import { Post } from "../../components/Post";
import { CreatePostButton } from "../../components/CreatePostButton";
import { AppHeader } from "../../components/AppHeader";
import { useRealPosts } from "../../hooks/useRealPosts";
import { PostType, PostData } from "../../types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const FeedScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const {
    posts,
    loading,
    refreshing,
    hasMore,
    error,
    loadMore,
    refresh,
    applyFilter,
    toggleLike,
    currentFilter,
  } = useRealPosts();

  const [selectedFilter, setSelectedFilter] = useState<PostType | "ALL">("ALL");

  // Aplicar filtro
  const handleFilterPress = (filter: PostType | "ALL") => {
    setSelectedFilter(filter);
    applyFilter(filter);
  };

  // Renderizar filtros
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {[
        { key: "ALL", label: "Tudo" },
        { key: "FOOD", label: "Comida" },
        { key: "DRINKS", label: "Bebidas" },
        { key: "SOCIAL", label: "Social" },
      ].map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            selectedFilter === filter.key && styles.filterButtonActive,
          ]}
          onPress={() => handleFilterPress(filter.key as PostType | "ALL")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === filter.key && styles.filterTextActive,
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Renderizar post
  const renderPost = ({ item }: { item: PostData }) => (
    <Post
      post={item}
      onLike={() => toggleLike(item.id)}
      onComment={() => navigation.navigate("Comments", { postId: item.id })}
      onSave={() => Alert.alert("Salvar", "Em desenvolvimento")}
      onShare={() => Alert.alert("Compartilhar", "Em desenvolvimento")}
      onUserPress={() =>
        Alert.alert("Perfil", `Abrir perfil de ${item.user.name}`)
      }
    />
  );

  // Loading inicial
  if (loading && posts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2D5A27" />
        <Text style={styles.loadingText}>Carregando posts...</Text>
      </View>
    );
  }

  // Error state
  if (error && posts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Erro ao carregar posts</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader
        title="FoodConnect"
        showSearch={true}
        showNotifications={true}
      />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={["#2D5A27"]}
            tintColor="#2D5A27"
          />
        }
        ListHeaderComponent={
          <View>
            <SimpleStoriesContainer currentUserId={user?.id || ""} />
            {renderFilters()}
            <CreatePostButton />
          </View>
        }
        ListFooterComponent={
          hasMore && posts.length > 0 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color="#2D5A27" />
            </View>
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          posts.length === 0 ? styles.emptyContainer : undefined
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nenhum post encontrado</Text>
              <Text style={styles.emptyStateSubtext}>
                Siga mais pessoas para ver posts no seu feed
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#e74c3c",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#2D5A27",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  filterButtonActive: {
    backgroundColor: "#2D5A27",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
