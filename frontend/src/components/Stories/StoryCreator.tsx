import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const { width, height } = Dimensions.get("window");

interface StoryCreatorProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (storyData: {
    content?: string;
    mediaUrl: string;
    mediaType: string;
  }) => void;
}

export const StoryCreator: React.FC<StoryCreatorProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setContent("");
    setSelectedImage(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de permissão para acessar suas fotos."
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16], // Story aspect ratio
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem");
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de permissão para usar a câmera."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Erro", "Não foi possível tirar a foto");
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      Alert.alert("Erro", "Selecione uma imagem para o story");
      return;
    }

    setLoading(true);

    try {
      // In a real app, you would upload the image to a server first
      // For now, we'll use the local URI (this won't work in production)
      onSubmit({
        content: content.trim() || undefined,
        mediaUrl: selectedImage,
        mediaType: "image",
      });

      handleClose();
    } catch (error) {
      console.error("Error creating story:", error);
      Alert.alert("Erro", "Não foi possível criar o story");
    } finally {
      setLoading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert("Adicionar foto", "Escolha uma opção:", [
      { text: "Câmera", onPress: takePhoto },
      { text: "Galeria", onPress: pickImage },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar Story</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[
              styles.headerButton,
              styles.submitButton,
              { opacity: selectedImage ? 1 : 0.5 },
            ]}
            disabled={!selectedImage || loading}
          >
            <Text style={styles.submitText}>
              {loading ? "Enviando..." : "Compartilhar"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.selectedImage}
              />

              {/* Text overlay */}
              <View style={styles.textOverlay}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Adicione um texto ao seu story..."
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={content}
                  onChangeText={setContent}
                  multiline
                  maxLength={500}
                />
              </View>

              {/* Edit image button */}
              <TouchableOpacity
                style={styles.editImageButton}
                onPress={showImageOptions}
              >
                <Ionicons name="camera" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="camera-outline" size={80} color="#ccc" />
              <Text style={styles.emptyStateText}>
                Adicione uma foto para criar seu story
              </Text>
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={showImageOptions}
              >
                <Ionicons name="add" size={24} color="white" />
                <Text style={styles.addImageText}>Adicionar foto</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bottom actions */}
        {selectedImage && (
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
              <Text style={styles.actionText}>Remover foto</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed",
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  submitButton: {
    backgroundColor: "#ff6b6b",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  submitText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    position: "relative",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  textOverlay: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
  },
  textInput: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
    minHeight: 50,
  },
  editImageButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30,
    lineHeight: 24,
  },
  addImageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff6b6b",
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 12,
    elevation: 2,
  },
  addImageText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  bottomActions: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e1e8ed",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  actionText: {
    color: "#ff6b6b",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "500",
  },
});
