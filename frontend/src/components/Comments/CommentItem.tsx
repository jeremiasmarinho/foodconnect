import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Comment } from "../../services/comment";

interface CommentItemProps {
  comment: Comment;
  onLike?: () => void;
  onEdit?: (newContent: string) => Promise<boolean>;
  onDelete?: () => void;
  onReport?: () => void;
}

export function CommentItem({
  comment,
  onLike,
  onEdit,
  onDelete,
  onReport,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = async () => {
    if (!editText.trim() || !onEdit) return;

    setIsSubmitting(true);
    try {
      const success = await onEdit(editText.trim());
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      Alert.alert("Erro", "Erro ao editar comentário");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(comment.content);
    setIsEditing(false);
  };

  const showOptions = () => {
    const options = [];

    if (onEdit) {
      options.push({
        text: "Editar",
        onPress: () => setIsEditing(true),
      });
    }

    if (onDelete) {
      options.push({
        text: "Deletar",
        style: "destructive" as const,
        onPress: onDelete,
      });
    }

    if (onReport) {
      options.push({
        text: "Reportar",
        onPress: onReport,
      });
    }

    options.push({ text: "Cancelar", style: "cancel" as const });

    Alert.alert("Opções", "", options);
  };

  const renderAvatar = () => (
    <View style={styles.avatarContainer}>
      {comment.user.avatar ? (
        <Image source={{ uri: comment.user.avatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.defaultAvatar]}>
          <Text style={styles.avatarText}>
            {comment.user.name?.charAt(0).toUpperCase() || "?"}
          </Text>
        </View>
      )}
    </View>
  );

  const renderContent = () => {
    if (isEditing) {
      return (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editText}
            onChangeText={setEditText}
            multiline
            autoFocus
            maxLength={500}
          />
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelEdit}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                isSubmitting && styles.saveButtonDisabled,
              ]}
              onPress={handleEdit}
              disabled={isSubmitting || !editText.trim()}
            >
              <Text style={styles.saveButtonText}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.username}>{comment.user.name}</Text>
          <Text style={styles.timeAgo}>{comment.timeAgo || "agora"}</Text>
          {(onEdit || onDelete || onReport) && (
            <TouchableOpacity
              style={styles.optionsButton}
              onPress={showOptions}
            >
              <Ionicons name="ellipsis-horizontal" size={16} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.commentContent}>{comment.content}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onLike}>
            <Ionicons
              name={(comment as any).isLiked ? "heart" : "heart-outline"}
              size={14}
              color={(comment as any).isLiked ? "#e74c3c" : "#666"}
            />
            <Text style={styles.actionText}>
              {(comment as any).likesCount || 0}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderAvatar()}
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  defaultAvatar: {
    backgroundColor: "#2D5A27",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  timeAgo: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  optionsButton: {
    padding: 4,
  },
  commentContent: {
    fontSize: 14,
    color: "#333",
    lineHeight: 18,
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  actionText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  editContainer: {
    flex: 1,
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: "top",
    marginBottom: 8,
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#666",
  },
  saveButton: {
    backgroundColor: "#2D5A27",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
});
