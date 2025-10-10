import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ViewStyle,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../providers";
import { Post, PostUser } from "../../types";
import { formatDate } from "../../utils";
import { useLikePost, useUnlikePost } from "../../hooks";

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  onUserPress?: (user: PostUser) => void;
  onRestaurantPress?: (restaurantId: string) => void;
  style?: ViewStyle;
}

export const PostCard: React.FC<PostCardProps> = React.memo(
  ({ post, onPress, onUserPress, onRestaurantPress, style }) => {
    const { theme } = useTheme();
    const [isLiked, setIsLiked] = useState(post.isLiked || false);
    const [likesCount, setLikesCount] = useState(post.likesCount || 0);

    const likePostMutation = useLikePost();
    const unlikePostMutation = useUnlikePost();

    const handleLike = async () => {
      try {
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

        if (newIsLiked) {
          await likePostMutation.mutateAsync(post.id);
        } else {
          await unlikePostMutation.mutateAsync(post.id);
        }
      } catch (error) {
        // Revert optimistic update
        setIsLiked(!isLiked);
        setLikesCount((prev) => (isLiked ? prev + 1 : prev - 1));
        Alert.alert("Erro", "Não foi possível curtir o post");
      }
    };

    const handleUserPress = () => {
      if (onUserPress && post.user) {
        onUserPress(post.user);
      }
    };

    const handleRestaurantPress = () => {
      if (onRestaurantPress && post.restaurant?.id) {
        onRestaurantPress(post.restaurant.id);
      }
    };

    return (
      <TouchableOpacity
        style={[
          {
            backgroundColor: theme.colors.surface,
            marginBottom: theme.spacing.md,
            borderRadius: theme.layout.borderRadius.lg,
            overflow: "hidden",
            ...theme.layout.shadow.small,
          },
          style,
        ]}
        onPress={onPress}
        activeOpacity={0.95}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: theme.spacing.lg,
            paddingBottom: theme.spacing.md,
          }}
        >
          <TouchableOpacity
            onPress={handleUserPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
            }}
            activeOpacity={0.7}
          >
            {post.user?.avatar ? (
              <Image
                source={{ uri: post.user.avatar }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: theme.spacing.md,
                }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: theme.spacing.md,
                }}
              >
                <Text
                  style={{
                    color: theme.colors.textOnPrimary,
                    fontSize: theme.typography.fontSize.md,
                    fontWeight: theme.typography.fontWeight.semibold,
                  }}
                >
                  {post.user?.name?.charAt(0).toUpperCase() || "?"}
                </Text>
              </View>
            )}

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: theme.typography.fontSize.md,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.textPrimary,
                }}
              >
                {post.user?.name || "Usuário"}
              </Text>
              <Text
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textSecondary,
                }}
              >
                {formatDate(post.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ padding: theme.spacing.sm }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        </View>

        {/* Restaurant Info */}
        {post.restaurant && (
          <TouchableOpacity
            onPress={handleRestaurantPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: theme.spacing.lg,
              paddingBottom: theme.spacing.md,
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="location"
              size={16}
              color={theme.colors.primary}
              style={{ marginRight: theme.spacing.sm }}
            />
            <Text
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.primary,
                fontWeight: theme.typography.fontWeight.medium,
              }}
            >
              {post.restaurant.name}
            </Text>
          </TouchableOpacity>
        )}

        {/* Content */}
        <View style={{ paddingHorizontal: theme.spacing.lg }}>
          <Text
            style={{
              fontSize: theme.typography.fontSize.md,
              color: theme.colors.textPrimary,
              lineHeight:
                theme.typography.lineHeight.relaxed *
                theme.typography.fontSize.md,
              marginBottom: post.imageUrl ? theme.spacing.md : theme.spacing.lg,
            }}
          >
            {post.content}
          </Text>
        </View>

        {/* Image */}
        {post.imageUrl && (
          <Image
            source={{ uri: post.imageUrl }}
            style={{
              width: "100%",
              height: 250,
              backgroundColor: theme.colors.surfaceVariant,
              marginBottom: theme.spacing.lg,
            }}
            resizeMode="cover"
          />
        )}

        {/* Actions */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: theme.spacing.lg,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={handleLike}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: theme.spacing.xl,
                padding: theme.spacing.sm,
                margin: -theme.spacing.sm,
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? theme.colors.error : theme.colors.textTertiary}
              />
              {likesCount > 0 && (
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textSecondary,
                    marginLeft: theme.spacing.xs,
                    fontWeight: theme.typography.fontWeight.medium,
                  }}
                >
                  {likesCount}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: theme.spacing.sm,
                margin: -theme.spacing.sm,
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chatbubble-outline"
                size={22}
                color={theme.colors.textTertiary}
              />
              {post.commentsCount && post.commentsCount > 0 && (
                <Text
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.textSecondary,
                    marginLeft: theme.spacing.xs,
                    fontWeight: theme.typography.fontWeight.medium,
                  }}
                >
                  {post.commentsCount}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{
              padding: theme.spacing.sm,
              margin: -theme.spacing.sm,
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="share-outline"
              size={22}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }
);
