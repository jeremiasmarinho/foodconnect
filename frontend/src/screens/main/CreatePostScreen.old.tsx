import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
// TODO: Install expo-image-picker: npx expo install expo-image-picker
// import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../../providers";
import {
  Button,
  Card,
  SearchBar,
  RestaurantSearchModal,
} from "../../components";

const { width } = Dimensions.get("window");

export const CreatePostScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  // Form state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI state
  const [showRestaurantSearch, setShowRestaurantSearch] = useState(false);
  const [restaurantSearchQuery, setRestaurantSearchQuery] = useState("");

  const pickImage = async () => {
    // TODO: Implement image picker when expo-image-picker is installed
    Alert.alert(
      "Seletor de Imagem",
      "Funcionalidade será implementada quando expo-image-picker for instalado.",
      [{ text: "OK" }]
    );

    // Mock image selection for demo
    setSelectedImage(
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400"
    );
  };

  const handleRatingPress = (newRating: number) => {
    setRating(newRating);
  };

  const handleRestaurantSelect = (restaurant: any) => {
    setSelectedRestaurant(restaurant);
    setShowRestaurantSearch(false);
    setRestaurantSearchQuery("");
  };

  const validateForm = () => {
    if (!content.trim()) {
      Alert.alert(
        "Descrição obrigatória",
        "Escreva algo sobre sua experiência."
      );
      return false;
    }
    if (!selectedRestaurant) {
      Alert.alert(
        "Restaurante obrigatório",
        "Selecione o restaurante onde você comeu."
      );
      return false;
    }
    if (rating === 0) {
      Alert.alert("Avaliação obrigatória", "Dê uma nota de 1 a 5 estrelas.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // TODO: Implement API call to create post
      console.log("Creating post:", {
        image: selectedImage,
        content: content.trim(),
        restaurant: selectedRestaurant,
        rating,
      });

      Alert.alert(
        "Post criado!",
        "Seu post foi publicado com sucesso no feed.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível criar o post. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderImagePicker = () => (
    <Card style={styles.imagePickerCard}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
        Foto (opcional)
      </Text>
      {selectedImage ? (
        <View style={styles.selectedImageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          <TouchableOpacity
            style={[
              styles.changeImageButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={pickImage}
          >
            <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
            <Text style={styles.changeImageText}>Alterar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.imagePlaceholder,
            { borderColor: theme.colors.border },
          ]}
          onPress={pickImage}
        >
          <Ionicons
            name="camera-outline"
            size={48}
            color={theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.placeholderText,
              { color: theme.colors.textSecondary },
            ]}
          >
            Toque para adicionar uma foto
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  const renderContentInput = () => (
    <Card style={styles.contentCard}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
        Conte sua experiência *
      </Text>
      <TextInput
        style={[
          styles.contentInput,
          {
            borderColor: theme.colors.border,
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.surface,
          },
        ]}
        placeholder="Como foi a comida? O que você recomenda? Conte todos os detalhes..."
        placeholderTextColor={theme.colors.textSecondary}
        multiline
        numberOfLines={4}
        value={content}
        onChangeText={setContent}
        maxLength={500}
      />
      <Text
        style={[styles.characterCount, { color: theme.colors.textSecondary }]}
      >
        {content.length}/500
      </Text>
    </Card>
  );

  const renderRestaurantSelector = () => (
    <Card style={styles.restaurantCard}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
        Restaurante *
      </Text>
      {selectedRestaurant ? (
        <TouchableOpacity
          style={[
            styles.selectedRestaurant,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
          onPress={() => setShowRestaurantSearch(true)}
        >
          <View style={styles.restaurantInfo}>
            <Text
              style={[
                styles.restaurantName,
                { color: theme.colors.textPrimary },
              ]}
            >
              {selectedRestaurant.name}
            </Text>
            <Text
              style={[
                styles.restaurantAddress,
                { color: theme.colors.textSecondary },
              ]}
            >
              {selectedRestaurant.address}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.restaurantPlaceholder,
            { borderColor: theme.colors.border },
          ]}
          onPress={() => setShowRestaurantSearch(true)}
        >
          <Ionicons
            name="location-outline"
            size={24}
            color={theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.placeholderText,
              { color: theme.colors.textSecondary },
            ]}
          >
            Selecione o restaurante
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  const renderRatingSelector = () => (
    <Card style={styles.ratingCard}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
        Sua avaliação *
      </Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            style={styles.starButton}
            onPress={() => handleRatingPress(star)}
          >
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={32}
              color={star <= rating ? "#FFD700" : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
      {rating > 0 && (
        <Text
          style={[styles.ratingText, { color: theme.colors.textSecondary }]}
        >
          {rating === 1 && "Muito ruim"}
          {rating === 2 && "Ruim"}
          {rating === 3 && "Ok"}
          {rating === 4 && "Bom"}
          {rating === 5 && "Excelente"}
        </Text>
      )}
    </Card>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          Novo Post
        </Text>
        <TouchableOpacity
          style={[styles.headerButton, { opacity: validateForm() ? 1 : 0.5 }]}
          onPress={handleSubmit}
          disabled={isSubmitting || !validateForm()}
        >
          <Text style={[styles.publishText, { color: theme.colors.primary }]}>
            {isSubmitting ? "Publicando..." : "Publicar"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderImagePicker()}
        {renderContentInput()}
        {renderRestaurantSelector()}
        {renderRatingSelector()}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Restaurant Search Modal */}
      <RestaurantSearchModal
        visible={showRestaurantSearch}
        onClose={() => setShowRestaurantSearch(false)}
        onSelectRestaurant={handleRestaurantSelect}
        selectedRestaurantId={selectedRestaurant?.id}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  publishText: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  imagePickerCard: {
    marginBottom: 16,
  },
  selectedImageContainer: {
    position: "relative",
  },
  selectedImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  changeImageButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  changeImageText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  imagePlaceholder: {
    height: 150,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 14,
    marginTop: 8,
  },
  contentCard: {
    marginBottom: 16,
  },
  contentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
    fontSize: 16,
  },
  characterCount: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  restaurantCard: {
    marginBottom: 16,
  },
  selectedRestaurant: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  restaurantAddress: {
    fontSize: 14,
  },
  restaurantPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: "dashed",
  },
  ratingCard: {
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 4,
  },
  ratingText: {
    fontSize: 14,
    textAlign: "center",
  },
  bottomSpacing: {
    height: 32,
  },
});
