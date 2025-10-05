import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../providers";
import { SearchBar, RestaurantCard, Header } from "../../components";
import { useRestaurants } from "../../hooks";
import {
  mockRestaurants,
  restaurantCategories,
  popularSearches,
} from "../../data/mockData";

// Categories are now imported from mockData

export const DiscoverScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Using mock data for now - replace with real API call when backend is connected
  const isLoading = false;

  // Filter restaurants based on category and search query
  const filteredRestaurants = mockRestaurants.filter((restaurant) => {
    const matchesCategory =
      selectedCategory === "all" || restaurant.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const allRestaurants = filteredRestaurants;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const loadMore = () => {
    // TODO: Implement pagination when backend supports it
    console.log("Load more restaurants");
  };

  const renderCategory = ({
    item,
  }: {
    item: (typeof restaurantCategories)[0];
  }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        {
          backgroundColor:
            selectedCategory === item.id
              ? theme.colors.primary
              : theme.colors.card,
          borderColor:
            selectedCategory === item.id
              ? theme.colors.primary
              : theme.colors.border,
        },
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons
        name={item.icon as any}
        size={20}
        color={
          selectedCategory === item.id
            ? theme.colors.textOnPrimary
            : theme.colors.textPrimary
        }
      />
      <Text
        style={[
          styles.categoryText,
          {
            color:
              selectedCategory === item.id
                ? theme.colors.textOnPrimary
                : theme.colors.textPrimary,
          },
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderRestaurant = ({ item }: { item: any }) => (
    <RestaurantCard
      restaurant={item}
      onPress={() => {
        // @ts-ignore - Navigation will be properly typed when integrated
        navigation.navigate("RestaurantDetail", { restaurantId: item.id });
      }}
    />
  );

  const renderFooter = () => {
    return null; // TODO: Add loading footer when pagination is implemented
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="restaurant-outline"
        size={64}
        color={theme.colors.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
        Nenhum restaurante encontrado
      </Text>
      <Text
        style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}
      >
        {searchQuery
          ? `Não encontramos restaurantes para "${searchQuery}"`
          : "Tente alterar os filtros ou buscar por outro termo"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header title="Descobrir" subtitle="Encontre novos sabores" />

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Buscar restaurantes, pratos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            Categorias
          </Text>
          <FlatList
            data={restaurantCategories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Restaurants List */}
        <View style={styles.restaurantsContainer}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            {selectedCategory === "all"
              ? "Todos os Restaurantes"
              : restaurantCategories.find((c) => c.id === selectedCategory)
                  ?.name}
            {allRestaurants.length > 0 && (
              <Text
                style={[
                  styles.resultsCount,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {" "}
                ({allRestaurants.length}{" "}
                {allRestaurants.length === 1 ? "resultado" : "resultados"})
              </Text>
            )}
          </Text>

          <FlatList
            data={allRestaurants}
            renderItem={renderRestaurant}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
            ListEmptyComponent={!isLoading ? renderEmpty : null}
            ListFooterComponent={renderFooter}
            contentContainerStyle={
              allRestaurants.length === 0 && !isLoading
                ? styles.emptyListContainer
                : styles.restaurantsList
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    marginBottom: 20,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: "400",
  },
  categoriesList: {
    paddingRight: 16,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  restaurantsContainer: {
    flex: 1,
  },
  restaurantsList: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
  },
});
