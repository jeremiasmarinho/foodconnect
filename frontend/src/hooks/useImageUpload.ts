import { useState, useCallback } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { UploadService, UploadResponse } from "../services/upload";

interface UseImageUploadConfig {
  maxImages?: number;
  allowMultiple?: boolean;
  uploadType?: "avatar" | "post" | "restaurant";
}

export function useImageUpload(config: UseImageUploadConfig = {}) {
  const { maxImages = 5, allowMultiple = true, uploadType = "post" } = config;

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<UploadResponse[]>([]);

  // Solicitar permissões
  const requestPermissions = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de permissão para acessar suas fotos."
      );
      return false;
    }
    return true;
  }, []);

  // Selecionar imagem da galeria
  const pickFromGallery = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: allowMultiple,
        allowsEditing: !allowMultiple,
        aspect: uploadType === "avatar" ? [1, 1] : [4, 3],
        quality: 0.8,
        selectionLimit: maxImages,
      });

      if (!result.canceled) {
        return result.assets;
      }
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
      Alert.alert("Erro", "Erro ao selecionar imagem");
    }
    return null;
  }, [allowMultiple, maxImages, uploadType, requestPermissions]);

  // Tirar foto
  const takePhoto = useCallback(async () => {
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: uploadType === "avatar" ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        return result.assets;
      }
    } catch (error) {
      console.error("Erro ao tirar foto:", error);
      Alert.alert("Erro", "Erro ao tirar foto");
    }
    return null;
  }, [uploadType]);

  // Upload de imagens
  const uploadImages = useCallback(
    async (imageAssets: ImagePicker.ImagePickerAsset[]) => {
      if (!imageAssets.length) return;

      setUploading(true);
      setUploadProgress(0);

      try {
        if (imageAssets.length === 1) {
          // Upload único
          const response = await UploadService.uploadImage(
            imageAssets[0].uri,
            uploadType === "restaurant"
              ? "post"
              : (uploadType as "avatar" | "post")
          );

          if (response.success && response.data) {
            setUploadedImages((prev) => [...prev, response.data!]);
            setUploadProgress(100);
            return [response.data];
          } else {
            Alert.alert("Erro", response.error || "Erro no upload");
          }
        } else {
          // Upload múltiplo
          const imageUris = imageAssets.map((asset) => asset.uri);
          const response = await UploadService.uploadMultipleImages(imageUris);

          if (response.success && response.data) {
            setUploadedImages((prev) => [...prev, ...response.data!]);
            setUploadProgress(100);
            return response.data;
          } else {
            Alert.alert("Erro", response.error || "Erro no upload");
          }
        }
      } catch (error) {
        console.error("Erro no upload:", error);
        Alert.alert("Erro", "Erro inesperado no upload");
      } finally {
        setUploading(false);
      }

      return null;
    },
    [uploadType]
  );

  // Selecionar e fazer upload
  const pickAndUpload = useCallback(async () => {
    const assets = await pickFromGallery();
    if (assets) {
      return await uploadImages(assets);
    }
    return null;
  }, [pickFromGallery, uploadImages]);

  // Tirar foto e fazer upload
  const takePhotoAndUpload = useCallback(async () => {
    const assets = await takePhoto();
    if (assets) {
      return await uploadImages(assets);
    }
    return null;
  }, [takePhoto, uploadImages]);

  // Mostrar opções de seleção
  const showImagePicker = useCallback(() => {
    Alert.alert("Selecionar Imagem", "Escolha uma opção:", [
      { text: "Cancelar", style: "cancel" },
      { text: "Câmera", onPress: takePhotoAndUpload },
      { text: "Galeria", onPress: pickAndUpload },
    ]);
  }, [takePhotoAndUpload, pickAndUpload]);

  // Remover imagem
  const removeImage = useCallback((index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Limpar todas as imagens
  const clearImages = useCallback(() => {
    setUploadedImages([]);
    setUploadProgress(0);
  }, []);

  return {
    // State
    uploading,
    uploadProgress,
    uploadedImages,

    // Actions
    pickFromGallery,
    takePhoto,
    uploadImages,
    pickAndUpload,
    takePhotoAndUpload,
    showImagePicker,
    removeImage,
    clearImages,

    // Utils
    canAddMore: uploadedImages.length < maxImages,
    hasImages: uploadedImages.length > 0,
  };
}
