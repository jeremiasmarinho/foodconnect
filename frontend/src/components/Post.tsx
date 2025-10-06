import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LIGHT_THEME } from "../constants/theme";
import { LikeAnimation } from "./LikeAnimation";
import { PhotoTagging } from "./PhotoTagging";
import { PostData, PostTag, User } from "../types";

const { width } = Dimensions.get("window");

// Using PostData from types/index.ts

interface PostProps {
  post: PostData;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onUserPress?: (userId: string) => void;
  onTagFriend?: (
    postId: string,
    userId: string,
    x: number,
    y: number,
    imageIndex: number
  ) => void;
  onRemoveTag?: (tagId: string) => void;
  friends?: User[]; // List of user's friends for tagging
}

export const Post: React.FC<PostProps> = ({
  post,
  onLike,
  onComment,
  onSave,
  onShare,
  onUserPress,
  onTagFriend,
  onRemoveTag,
  friends = [],
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showTagging, setShowTagging] = useState(false);
  const lastTap = useRef<number | null>(null);

  const handleLike = () => {
    onLike?.(post.id);
  };

  const handleComment = () => {
    onComment?.(post.id);
  };

  const handleSave = () => {
    onSave?.(post.id);
  };

  const handleShare = () => {
    onShare?.(post.id);
  };

  const handleUserPress = () => {
    onUserPress?.(post.user.id);
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTap.current && now - lastTap.current < DOUBLE_PRESS_DELAY) {
      // Double tap detected
      setShowLikeAnimation(true);
      handleLike();
      setTimeout(() => setShowLikeAnimation(false), 1000);
    }
    lastTap.current = now;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m`;
    }
    if (hours < 24) {
      return `${hours}h`;
    }
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days}d`;
    }
    return date.toLocaleDateString();
  };

  const formatLikes = (likes: number) => {
    if (likes < 1000) return likes.toString();
    if (likes < 1000000) return `${(likes / 1000).toFixed(1)}k`;
    return `${(likes / 1000000).toFixed(1)}M`;
  };

  const truncateCaption = (caption: string, maxLength: number = 100) => {
    if (caption.length <= maxLength) return caption;
    return caption.substring(0, maxLength) + "...";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={handleUserPress}
          activeOpacity={0.7}
        >
          <Image
            source={{
              uri:
                post.user.avatar || "https://via.placeholder.com/40x40?text=👤",
            }}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <View style={styles.usernameContainer}>
              <Text style={styles.username}>{post.user.username}</Text>
              {post.user.isVerified && (
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={LIGHT_THEME.primary}
                  style={styles.verifiedIcon}
                />
              )}
            </View>
            {post.location && (
              <Text style={styles.location}>{post.location}</Text>
            )}
            {post.establishment && (
              <Text style={styles.establishment}>
                {post.establishment.type === "RESTAURANT" ? "🍽️" : "🍺"}{" "}
                {post.establishment.name}
              </Text>
            )}
            {post.restaurant && (
              <Text style={styles.restaurant}>📍 {post.restaurant.name}</Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowTagging(true)}
          >
            <Ionicons
              name="person-add-outline"
              size={20}
              color={LIGHT_THEME.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={LIGHT_THEME.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Image Gallery */}
      <View style={styles.imageContainer}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleDoubleTap}
          style={styles.imageWrapper}
        >
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.floor(
                event.nativeEvent.contentOffset.x / width
              );
              setCurrentImageIndex(index);
            }}
          >
            {post.images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.postImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          {showLikeAnimation && <LikeAnimation isVisible={showLikeAnimation} />}
        </TouchableOpacity>

        {/* Image Indicators */}
        {post.images.length > 1 && (
          <View style={styles.imageIndicators}>
            {post.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentImageIndex && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        )}

        {/* Double tap heart animation area */}
        <TouchableOpacity
          style={styles.doubleTapArea}
          activeOpacity={1}
          onPress={handleLike}
        />
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <Ionicons
              name={post.isLiked ? "heart" : "heart-outline"}
              size={24}
              color={
                post.isLiked ? LIGHT_THEME.primary : LIGHT_THEME.textPrimary
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleComment}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color={LIGHT_THEME.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons
              name="paper-plane-outline"
              size={24}
              color={LIGHT_THEME.textPrimary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Ionicons
            name={post.isSaved ? "bookmark" : "bookmark-outline"}
            size={24}
            color={LIGHT_THEME.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Likes Count */}
      <View style={styles.likesContainer}>
        <Text style={styles.likesText}>
          {formatLikes(post.likesCount)}{" "}
          {post.likesCount === 1 ? "curtida" : "curtidas"}
        </Text>
      </View>

      {/* Caption */}
      <View style={styles.captionContainer}>
        <TouchableOpacity onPress={handleUserPress}>
          <Text style={styles.captionUsername}>{post.user.username}</Text>
        </TouchableOpacity>
        <Text style={styles.captionText}>
          {showFullCaption ? post.content : truncateCaption(post.content)}
          {post.content.length > 100 && !showFullCaption && (
            <TouchableOpacity onPress={() => setShowFullCaption(true)}>
              <Text style={styles.moreText}> mais</Text>
            </TouchableOpacity>
          )}
        </Text>
      </View>

      {/* Comments Preview */}
      {(post.commentsCount || 0) > 0 && (
        <TouchableOpacity
          style={styles.commentsContainer}
          onPress={handleComment}
        >
          <Text style={styles.commentsText}>
            Ver todos os {post.commentsCount} comentários
          </Text>
        </TouchableOpacity>
      )}

      {/* Time */}
      <Text style={styles.timeText}>{formatTime(post.createdAt)}</Text>

      {/* Photo Tagging Modal */}
      {showTagging && (
        <PhotoTagging
          imageUri={post.images[currentImageIndex]}
          imageIndex={currentImageIndex}
          existingTags={post.taggedUsers || []}
          onAddTag={(userId, x, y, imageIndex) => {
            onTagFriend?.(post.id, userId, x, y, imageIndex);
            setShowTagging(false);
          }}
          onRemoveTag={(tagId) => {
            onRemoveTag?.(tagId);
          }}
          visible={showTagging}
          onClose={() => setShowTagging(false)}
          friends={friends}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: LIGHT_THEME.surface,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontSize: 14,
    fontWeight: "600",
    color: LIGHT_THEME.textPrimary,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  location: {
    fontSize: 12,
    color: LIGHT_THEME.textSecondary,
    marginTop: 2,
  },
  restaurant: {
    fontSize: 12,
    color: LIGHT_THEME.primary,
    marginTop: 2,
    fontWeight: "500",
  },
  moreButton: {
    padding: 8,
  },
  imageContainer: {
    position: "relative",
  },
  postImage: {
    width: width,
    height: width,
  },
  imageIndicators: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    flexDirection: "row",
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 2,
  },
  activeIndicator: {
    backgroundColor: "white",
  },
  doubleTapArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginRight: 16,
    padding: 4,
  },
  saveButton: {
    padding: 4,
  },
  likesContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  likesText: {
    fontSize: 14,
    fontWeight: "600",
    color: LIGHT_THEME.textPrimary,
  },
  captionContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  captionUsername: {
    fontSize: 14,
    fontWeight: "600",
    color: LIGHT_THEME.textPrimary,
    marginRight: 8,
  },
  captionText: {
    fontSize: 14,
    color: LIGHT_THEME.textPrimary,
    lineHeight: 18,
    flex: 1,
  },
  moreText: {
    color: LIGHT_THEME.textSecondary,
    fontSize: 14,
  },
  commentsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  commentsText: {
    fontSize: 14,
    color: LIGHT_THEME.textSecondary,
  },
  timeText: {
    fontSize: 12,
    color: LIGHT_THEME.textSecondary,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  imageWrapper: {
    position: "relative",
  },
  establishment: {
    fontSize: 12,
    color: LIGHT_THEME.textSecondary,
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 4,
    marginRight: 8,
  },
});
