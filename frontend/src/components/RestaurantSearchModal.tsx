import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../providers";
import { SearchBar } from "./ui";
import { useSearchRestaurants } from "../hooks";

interface RestaurantSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectRestaurant: (restaurant: any) => void;
  selectedRestaurantId?: string;
}

export const RestaurantSearchModal: React.FC<RestaurantSearchModalProps> = ({
  visible,
  onClose,
  onSelectRestaurant,
  selectedRestaurantId,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: restaurants,
    isLoading,
    error,
  } = useSearchRestaurants(debouncedQuery);

  const handleSelectRestaurant = (restaurant: any) => {
    onSelectRestaurant(restaurant);
    onClose();
  };

  const renderRestaurantItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.restaurantItem,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
        },
        selectedRestaurantId === item.id && {
          backgroundColor: theme.colors.primary + "10",
          borderLeftColor: theme.colors.primary,
          borderLeftWidth: 4,
        },
      ]}
      onPress={() => handleSelectRestaurant(item)}
    >
      <View style={styles.restaurantInfo}>
        <Text
          style={[styles.restaurantName, { color: theme.colors.textPrimary }]}
        >
          {item.name}
        </Text>
        <Text
          style={[
            styles.restaurantAddress,
            { color: theme.colors.textSecondary },
          ]}
        >
          {item.address}
        </Text>
        {item.cuisine && (
          <Text
            style={[
              styles.restaurantCuisine,
              { color: theme.colors.textTertiary },
            ]}
          >
            {item.cuisine}
          </Text>
        )}
      </View>
      <View style={styles.restaurantMeta}>
        {item.rating && (
          <View
            style={[
              styles.ratingContainer,
              { backgroundColor: theme.colors.success },
            ]}
          >
            <Ionicons name="star" size={12} color="#FFFFFF" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        )}
        {selectedRestaurantId === item.id && (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={theme.colors.primary}
            style={styles.selectedIcon}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="search-outline"
        size={48}
        color={theme.colors.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
        {searchQuery.length === 0
          ? "Busque por restaurantes"
          : "Nenhum restaurante encontrado"}
      </Text>
      <Text
        style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}
      >
        {searchQuery.length === 0
          ? "Digite o nome do restaurante que você visitou"
          : `Não encontramos restaurantes para "${searchQuery}"`}
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
        Buscando restaurantes...
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons
        name="alert-circle-outline"
        size={48}
        color={theme.colors.error}
      />
      <Text style={[styles.errorTitle, { color: theme.colors.textPrimary }]}>
        Erro na busca
      </Text>
      <Text
        style={[styles.errorSubtitle, { color: theme.colors.textSecondary }]}
      >
        Não foi possível buscar os restaurantes. Tente novamente.
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* Header */}
        <View
          style={[styles.header, { backgroundColor: theme.colors.surface }]}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text
            style={[styles.headerTitle, { color: theme.colors.textPrimary }]}
          >
            Selecionar Restaurante
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Buscar restaurantes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {isLoading ? (
            renderLoadingState()
          ) : error ? (
            renderErrorState()
          ) : restaurants && restaurants.length > 0 ? (
            <FlatList
              data={restaurants}
              renderItem={renderRestaurantItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            renderEmptyState()
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  restaurantItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    marginBottom: 2,
  },
  restaurantCuisine: {
    fontSize: 12,
  },
  restaurantMeta: {
    alignItems: "flex-end",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  ratingText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 2,
  },
  selectedIcon: {
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
