import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ImageUploadComponent } from "../../components/ImageUpload";
import { PostService } from "../../services/post";
import { UploadResponse } from "../../services/upload";
import { PostType } from "../../types";

export function CreatePostScreen() {
  const navigation = useNavigation();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>("FOOD");
  const [uploadedImages, setUploadedImages] = useState<UploadResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert("Erro", "Por favor, escreva algo sobre sua experiência");
      return;
    }

    if (uploadedImages.length === 0) {
      Alert.alert("Erro", "Adicione pelo menos uma imagem ao seu post");
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar dados do post
      const imageUrls = uploadedImages.map((img) => img.url);

      const postData = {
        content: content.trim(),
        images: imageUrls,
        type: postType,
      };

      const response = await PostService.createPost(postData);

      if (response.success) {
        Alert.alert("Sucesso!", "Seu post foi publicado com sucesso!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert("Erro", response.error || "Erro ao publicar post");
      }
    } catch (error) {
      console.error("Erro ao criar post:", error);
      Alert.alert("Erro", "Erro inesperado ao publicar post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTypeSelector = () => (
    <View style={styles.typeSelectorContainer}>
      <Text style={styles.sectionTitle}>Tipo do Post</Text>
      <View style={styles.typeButtons}>
        {[
          { key: "FOOD", label: "Comida", icon: "restaurant" },
          { key: "DRINKS", label: "Bebidas", icon: "wine" },
          { key: "SOCIAL", label: "Social", icon: "people" },
        ].map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.typeButton,
              postType === type.key && styles.typeButtonActive,
            ]}
            onPress={() => setPostType(type.key as PostType)}
          >
            <Ionicons
              name={type.icon as any}
              size={20}
              color={postType === type.key ? "#fff" : "#2D5A27"}
            />
            <Text
              style={[
                styles.typeButtonText,
                postType === type.key && styles.typeButtonTextActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo Post</Text>
          <TouchableOpacity
            style={[
              styles.headerButton,
              styles.publishButton,
              (!content.trim() ||
                uploadedImages.length === 0 ||
                isSubmitting) &&
                styles.publishButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={
              !content.trim() || uploadedImages.length === 0 || isSubmitting
            }
          >
            <Text
              style={[
                styles.publishButtonText,
                (!content.trim() ||
                  uploadedImages.length === 0 ||
                  isSubmitting) &&
                  styles.publishButtonTextDisabled,
              ]}
            >
              {isSubmitting ? "Publicando..." : "Publicar"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Tipo do Post */}
          {renderTypeSelector()}

          {/* Upload de Imagens */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotos</Text>
            <ImageUploadComponent
              onImagesChange={setUploadedImages}
              maxImages={5}
              uploadType="post"
            />
          </View>

          {/* Conteúdo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conte sua experiência</Text>
            <TextInput
              style={styles.textInput}
              value={content}
              onChangeText={setContent}
              placeholder="Como foi sua experiência? Compartilhe os detalhes..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={2000}
            />
            <Text style={styles.characterCount}>{content.length}/2000</Text>
          </View>

          {/* Dicas */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Dicas para um bom post:</Text>
            <Text style={styles.tipText}>
              • Adicione fotos atrativas da comida/bebida
            </Text>
            <Text style={styles.tipText}>• Descreva sabores e texturas</Text>
            <Text style={styles.tipText}>
              • Mencione o ambiente e atendimento
            </Text>
            <Text style={styles.tipText}>
              • Use emojis para tornar mais divertido
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  publishButton: {
    backgroundColor: "#2D5A27",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  publishButtonDisabled: {
    backgroundColor: "#ccc",
  },
  publishButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  publishButtonTextDisabled: {
    color: "#999",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  typeSelectorContainer: {
    marginVertical: 16,
  },
  typeButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#2D5A27",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  typeButtonActive: {
    backgroundColor: "#2D5A27",
  },
  typeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#2D5A27",
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: "#f9f9f9",
  },
  characterCount: {
    textAlign: "right",
    marginTop: 8,
    fontSize: 12,
    color: "#666",
  },
  tipsContainer: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: "#666",
    marginVertical: 2,
  },
});
