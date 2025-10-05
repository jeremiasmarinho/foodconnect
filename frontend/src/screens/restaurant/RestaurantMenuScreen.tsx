import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCart } from "../../providers/CartProvider";
import { menuItemsApi } from "../../services/ordersApi";
import { MenuItem } from "../../types/orders";
import { LIGHT_THEME } from "../../constants/theme";

// Map theme colors to simplified names
const Colors = {
  primary: LIGHT_THEME.primary,
  white: "#FFFFFF",
  dark: LIGHT_THEME.textPrimary,
  gray: LIGHT_THEME.textSecondary,
  lightGray: LIGHT_THEME.surfaceVariant,
};

type RouteParams = {
  restaurantId: string;
  restaurantName: string;
};

type NavigationProp = NativeStackNavigationProp<any>;

const RestaurantMenuScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { restaurantId, restaurantName } = route.params as RouteParams;

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const cart = useCart();

  useEffect(() => {
    loadMenuItems();
  }, [restaurantId]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const items = await menuItemsApi.getByRestaurant(restaurantId);
      setMenuItems(items);
    } catch (error) {
      console.error("Error loading menu items:", error);
      Alert.alert("Erro", "Não foi possível carregar o menu");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { key: "all", label: "Todos" },
    { key: "appetizer", label: "Entradas" },
    { key: "main", label: "Principais" },
    { key: "dessert", label: "Sobremesas" },
    { key: "beverage", label: "Bebidas" },
  ];

  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const handleAddToCart = (item: MenuItem) => {
    if (!cart.isFromSameRestaurant(restaurantId)) {
      Alert.alert(
        "Restaurante diferente",
        "Você já tem itens de outro restaurante no carrinho. Deseja limpar o carrinho e adicionar este item?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Limpar carrinho",
            style: "destructive",
            onPress: () => {
              cart.clearCart();
              cart.setRestaurant(restaurantId, restaurantName);
              cart.addItem(item);
              Alert.alert("Sucesso", "Item adicionado ao carrinho!");
            },
          },
        ]
      );
    } else {
      cart.addItem(item);
      Alert.alert("Sucesso", "Item adicionado ao carrinho!");
    }
  };

  const renderMenuItem = (item: MenuItem) => (
    <View key={item.id} style={styles.menuItem}>
      <View style={styles.itemContent}>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        )}
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.itemDescription}>{item.description}</Text>
          )}
          <Text style={styles.itemPrice}>R$ {item.price.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.addButton, !item.isAvailable && styles.disabledButton]}
        onPress={() => handleAddToCart(item)}
        disabled={!item.isAvailable}
      >
        <Ionicons
          name="add"
          size={20}
          color={item.isAvailable ? Colors.white : Colors.gray}
        />
        <Text
          style={[
            styles.addButtonText,
            !item.isAvailable && styles.disabledButtonText,
          ]}
        >
          {item.isAvailable ? "Adicionar" : "Indisponível"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Carregando menu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{restaurantName}</Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate("Cart")}
        >
          <Ionicons name="cart" size={24} color={Colors.primary} />
          {cart.getItemCount() > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.getItemCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryButton,
              selectedCategory === category.key &&
                styles.selectedCategoryButton,
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category.key &&
                  styles.selectedCategoryButtonText,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer}>
        {filteredItems.length === 0 ? (
          <Text style={styles.emptyText}>
            Nenhum item encontrado nesta categoria
          </Text>
        ) : (
          filteredItems.map(renderMenuItem)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.dark,
  },
  cartButton: {
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 20,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.primary,
  },
  categoryButtonText: {
    color: Colors.dark,
    fontWeight: "500",
  },
  selectedCategoryButtonText: {
    color: Colors.white,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  menuItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContent: {
    flexDirection: "row",
    marginBottom: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  disabledButton: {
    backgroundColor: Colors.lightGray,
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: "bold",
    marginLeft: 4,
  },
  disabledButtonText: {
    color: Colors.gray,
  },
  emptyText: {
    textAlign: "center",
    color: Colors.gray,
    fontSize: 16,
    marginTop: 40,
  },
});

export default RestaurantMenuScreen;
