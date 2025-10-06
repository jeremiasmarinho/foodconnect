import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  TextInput,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LIGHT_THEME } from "../constants/theme";
import { User, PostTag } from "../types";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface PhotoTaggingProps {
  imageUri: string;
  imageIndex: number;
  existingTags: PostTag[];
  onAddTag: (userId: string, x: number, y: number, imageIndex: number) => void;
  onRemoveTag: (tagId: string) => void;
  visible: boolean;
  onClose: () => void;
  friends: User[]; // List of user's friends to tag
}

export const PhotoTagging: React.FC<PhotoTaggingProps> = ({
  imageUri,
  imageIndex,
  existingTags,
  onAddTag,
  onRemoveTag,
  visible,
  onClose,
  friends,
}) => {
  const [isTagging, setIsTagging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [showFriendsList, setShowFriendsList] = useState(false);

  const filteredFriends = friends.filter(
    (friend) =>
      friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (friend.name &&
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleImagePress = (event: any) => {
    if (!isTagging) return;

    const { locationX, locationY } = event.nativeEvent;
    const { width, height } = event.nativeEvent.target.measure
      ? { width: screenWidth - 32, height: (screenWidth - 32) * 0.75 }
      : { width: screenWidth - 32, height: screenWidth - 32 };

    // Convert to relative coordinates (0-1)
    const relativeX = locationX / width;
    const relativeY = locationY / height;

    setSelectedPosition({ x: relativeX, y: relativeY });
    setShowFriendsList(true);
  };

  const handleSelectFriend = (friend: User) => {
    if (selectedPosition) {
      onAddTag(friend.id, selectedPosition.x, selectedPosition.y, imageIndex);
      setSelectedPosition(null);
      setShowFriendsList(false);
      setIsTagging(false);
      setSearchQuery("");
    }
  };

  const handleRemoveTag = (tag: PostTag) => {
    Alert.alert(
      "Remover marcação",
      `Deseja remover a marcação de @${tag.user.username}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: () => onRemoveTag(tag.id),
        },
      ]
    );
  };

  const renderTag = (tag: PostTag) => {
    const imageWidth = screenWidth - 32;
    const imageHeight = imageWidth * 0.75; // Assuming 4:3 aspect ratio

    return (
      <TouchableOpacity
        key={tag.id}
        style={[
          styles.tag,
          {
            left: (tag.x || 0) * imageWidth - 12,
            top: (tag.y || 0) * imageHeight - 12,
          },
        ]}
        onPress={() => handleRemoveTag(tag)}
      >
        <View style={styles.tagDot} />
        <View style={styles.tagLabel}>
          <Text style={styles.tagText}>@{tag.user.username}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFriendItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => handleSelectFriend(item)}
    >
      <Image
        source={{
          uri: item.avatar || "https://via.placeholder.com/40x40?text=👤",
        }}
        style={styles.friendAvatar}
      />
      <View style={styles.friendInfo}>
        <Text style={styles.friendUsername}>@{item.username}</Text>
        {item.name && <Text style={styles.friendName}>{item.name}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={LIGHT_THEME.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Marcar pessoas</Text>
          <TouchableOpacity
            onPress={() => setIsTagging(!isTagging)}
            style={[styles.headerButton, isTagging && styles.activeButton]}
          >
            <Ionicons
              name={isTagging ? "person-add" : "person-add-outline"}
              size={24}
              color={isTagging ? LIGHT_THEME.primary : LIGHT_THEME.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Image with tags */}
        <View style={styles.imageContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleImagePress}
            disabled={!isTagging}
          >
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
            {existingTags
              .filter((tag) => tag.imageIndex === imageIndex)
              .map(renderTag)}
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            {isTagging
              ? "Toque na foto para marcar um amigo"
              : "Toque no ícone + para começar a marcar pessoas"}
          </Text>
        </View>

        {/* Friends list modal */}
        <Modal
          visible={showFriendsList}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFriendsList(false)}
        >
          <View style={styles.friendsModal}>
            <View style={styles.friendsContainer}>
              <View style={styles.friendsHeader}>
                <Text style={styles.friendsTitle}>Marcar amigo</Text>
                <TouchableOpacity
                  onPress={() => setShowFriendsList(false)}
                  style={styles.closeFriendsButton}
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color={LIGHT_THEME.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.searchInput}
                placeholder="Buscar amigos..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={LIGHT_THEME.textSecondary}
              />

              <FlatList
                data={filteredFriends}
                renderItem={renderFriendItem}
                keyExtractor={(item) => item.id}
                style={styles.friendsList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_THEME.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.surfaceVariant,
  },
  headerButton: {
    padding: 8,
  },
  activeButton: {
    backgroundColor: LIGHT_THEME.primaryLight,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: LIGHT_THEME.textPrimary,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    position: "relative",
  },
  image: {
    width: screenWidth - 32,
    height: (screenWidth - 32) * 0.75,
    borderRadius: 8,
  },
  tag: {
    position: "absolute",
    alignItems: "center",
  },
  tagDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: LIGHT_THEME.primary,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  tagLabel: {
    backgroundColor: LIGHT_THEME.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  instructions: {
    padding: 16,
    alignItems: "center",
  },
  instructionText: {
    fontSize: 14,
    color: LIGHT_THEME.textSecondary,
    textAlign: "center",
  },
  friendsModal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  friendsContainer: {
    backgroundColor: LIGHT_THEME.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.7,
  },
  friendsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.surfaceVariant,
  },
  friendsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: LIGHT_THEME.textPrimary,
  },
  closeFriendsButton: {
    padding: 4,
  },
  searchInput: {
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: LIGHT_THEME.surfaceVariant,
    borderRadius: 8,
    fontSize: 16,
    color: LIGHT_THEME.textPrimary,
  },
  friendsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendUsername: {
    fontSize: 16,
    fontWeight: "600",
    color: LIGHT_THEME.textPrimary,
  },
  friendName: {
    fontSize: 14,
    color: LIGHT_THEME.textSecondary,
    marginTop: 2,
  },
});
