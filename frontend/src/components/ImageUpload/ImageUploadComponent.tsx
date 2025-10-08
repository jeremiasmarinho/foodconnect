import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useImageUpload } from "../../hooks/useImageUpload";
import { UploadResponse } from "../../services/upload";

interface ImageUploadComponentProps {
  onImagesChange?: (images: UploadResponse[]) => void;
  maxImages?: number;
  uploadType?: "avatar" | "post" | "restaurant";
  style?: any;
  showPreview?: boolean;
}

export function ImageUploadComponent({
  onImagesChange,
  maxImages = 5,
  uploadType = "post",
  style,
  showPreview = true,
}: ImageUploadComponentProps) {
  const {
    uploading,
    uploadProgress,
    uploadedImages,
    showImagePicker,
    removeImage,
    canAddMore,
    hasImages,
  } = useImageUpload({
    maxImages,
    uploadType,
    allowMultiple: uploadType !== "avatar",
  });

  // Notificar mudanças nas imagens
  React.useEffect(() => {
    onImagesChange?.(uploadedImages);
  }, [uploadedImages, onImagesChange]);

  const renderImagePreview = (image: UploadResponse, index: number) => (
    <View key={`${image.filename}-${index}`} style={styles.imageContainer}>
      <Image source={{ uri: image.url }} style={styles.previewImage} />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeImage(index)}
      >
        <Ionicons name="close-circle" size={20} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  const renderUploadButton = () => (
    <TouchableOpacity
      style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
      onPress={showImagePicker}
      disabled={uploading || !canAddMore}
    >
      {uploading ? (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator color="#2D5A27" size="small" />
          <Text style={styles.uploadingText}>
            Enviando... {Math.round(uploadProgress)}%
          </Text>
        </View>
      ) : (
        <View style={styles.uploadContent}>
          <Ionicons name="camera" size={24} color="#2D5A27" />
          <Text style={styles.uploadText}>
            {hasImages
              ? `Adicionar ${uploadType === "avatar" ? "nova" : "mais"}`
              : "Adicionar imagem"}
          </Text>
          {maxImages > 1 && (
            <Text style={styles.uploadSubtext}>
              {uploadedImages.length}/{maxImages}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      {showPreview && hasImages && (
        <ScrollView
          horizontal
          style={styles.previewContainer}
          showsHorizontalScrollIndicator={false}
        >
          {uploadedImages.map(renderImagePreview)}
        </ScrollView>
      )}

      {canAddMore && renderUploadButton()}

      {hasImages && (
        <Text style={styles.instructionText}>
          Toque no ✕ para remover uma imagem
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  previewContainer: {
    marginBottom: 12,
  },
  imageContainer: {
    marginRight: 12,
    position: "relative",
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: "#2D5A27",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadingContainer: {
    alignItems: "center",
  },
  uploadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  uploadContent: {
    alignItems: "center",
  },
  uploadText: {
    marginTop: 8,
    fontSize: 16,
    color: "#2D5A27",
    fontWeight: "500",
  },
  uploadSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: "#666",
  },
  instructionText: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
