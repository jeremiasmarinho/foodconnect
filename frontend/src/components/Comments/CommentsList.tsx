import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useComments } from "../../hooks/useComments";
import { Comment } from "../../services/comment";
import { CommentItem } from "./CommentItem";

interface CommentsListProps {
  postId: string;
  style?: any;
  maxHeight?: number;
}

export function CommentsList({
  postId,
  style,
  maxHeight = 400,
}: CommentsListProps) {
  const [newComment, setNewComment] = useState("");

  const {
    comments,
    loading,
    refreshing,
    hasMore,
    error,
    addingComment,
    loadMore,
    refresh,
    addComment,
    deleteComment,
    editComment,
    toggleCommentLike,
    reportComment,
    canModifyComment,
  } = useComments({ postId });

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const success = await addComment(newComment);
    if (success) {
      setNewComment("");
    }
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert(
      "Deletar comentário",
      "Tem certeza que deseja deletar este comentário?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: () => deleteComment(commentId),
        },
      ]
    );
  };

  const handleReportComment = (commentId: string) => {
    Alert.alert(
      "Reportar comentário",
      "Por que você está reportando este comentário?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Spam", onPress: () => reportComment(commentId, "spam") },
        {
          text: "Conteúdo ofensivo",
          onPress: () => reportComment(commentId, "offensive"),
        },
        {
          text: "Informação falsa",
          onPress: () => reportComment(commentId, "misinformation"),
        },
      ]
    );
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <CommentItem
      comment={item}
      onLike={() => toggleCommentLike(item.id)}
      onEdit={
        canModifyComment(item)
          ? (newContent: string) => editComment(item.id, newContent)
          : undefined
      }
      onDelete={
        canModifyComment(item) ? () => handleDeleteComment(item.id) : undefined
      }
      onReport={() => handleReportComment(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
      <Text style={styles.emptyText}>Nenhum comentário ainda</Text>
      <Text style={styles.emptySubtext}>Seja o primeiro a comentar!</Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color="#2D5A27" />
        <Text style={styles.loadingText}>Carregando mais comentários...</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Lista de comentários */}
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={["#2D5A27"]}
            tintColor="#2D5A27"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={true}
        style={[styles.commentsList, { maxHeight }]}
        nestedScrollEnabled={true}
      />

      {/* Loading inicial */}
      {loading && comments.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#2D5A27" />
          <Text style={styles.loadingText}>Carregando comentários...</Text>
        </View>
      )}

      {/* Error state */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input para novo comentário */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.commentInput}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Adicione um comentário..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!newComment.trim() || addingComment) && styles.sendButtonDisabled,
          ]}
          onPress={handleAddComment}
          disabled={!newComment.trim() || addingComment}
        >
          {addingComment ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  commentsList: {
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: "#e74c3c",
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#2D5A27",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  footerLoader: {
    alignItems: "center",
    paddingVertical: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
  },
  sendButton: {
    backgroundColor: "#2D5A27",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
});
