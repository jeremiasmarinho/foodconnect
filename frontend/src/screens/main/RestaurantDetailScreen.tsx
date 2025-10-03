import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useTheme } from "../../providers";
import { Button, Card } from "../../components";
import { useRestaurant } from "../../hooks";

const { width } = Dimensions.get("window");

interface RouteParams {
  restaurantId: string;
}

export const RestaurantDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { restaurantId } = route.params as RouteParams;
  const [activeTab, setActiveTab] = useState<"menu" | "info" | "reviews">(
    "menu"
  );

  const { data: restaurant, isLoading } = useRestaurant(restaurantId);

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            Carregando restaurante...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.errorContainer}>
          <Ionicons
            name="restaurant-outline"
            size={64}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.errorText, { color: theme.colors.textPrimary }]}>
            Restaurante não encontrado
          </Text>
          <Button
            title="Voltar"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Restaurant Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              restaurant.imageUrl ||
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
          }}
          style={styles.restaurantImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Ionicons
            name="heart-outline"
            size={24}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Restaurant Info */}
      <View
        style={[
          styles.infoContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.titleSection}>
          <Text
            style={[styles.restaurantName, { color: theme.colors.textPrimary }]}
          >
            {restaurant.name}
          </Text>
          {restaurant.rating && (
            <View
              style={[
                styles.ratingContainer,
                { backgroundColor: theme.colors.success },
              ]}
            >
              <Ionicons name="star" size={16} color="#FFFFFF" />
              <Text style={styles.ratingText}>
                {restaurant.rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        {restaurant.description && (
          <Text
            style={[styles.description, { color: theme.colors.textSecondary }]}
          >
            {restaurant.description}
          </Text>
        )}

        {/* Quick Info */}
        <View style={styles.quickInfo}>
          {restaurant.deliveryTime && (
            <View style={styles.infoItem}>
              <Ionicons
                name="time-outline"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[styles.infoText, { color: theme.colors.textSecondary }]}
              >
                {restaurant.deliveryTime}
              </Text>
            </View>
          )}
          {restaurant.deliveryFee !== undefined && (
            <View style={styles.infoItem}>
              <Ionicons
                name="bicycle-outline"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[styles.infoText, { color: theme.colors.textSecondary }]}
              >
                {restaurant.deliveryFee === 0
                  ? "Grátis"
                  : `R$ ${restaurant.deliveryFee.toFixed(2)}`}
              </Text>
            </View>
          )}
          {restaurant.minimumOrder && (
            <View style={styles.infoItem}>
              <Ionicons
                name="card-outline"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[styles.infoText, { color: theme.colors.textSecondary }]}
              >
                Mín. R$ {restaurant.minimumOrder.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Status */}
        <View
          style={[
            styles.statusContainer,
            {
              backgroundColor: restaurant.isOpen
                ? theme.colors.success
                : theme.colors.error,
            },
          ]}
        >
          <Text style={styles.statusText}>
            {restaurant.isOpen ? "Aberto agora" : "Fechado"}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View
      style={[styles.tabContainer, { backgroundColor: theme.colors.surface }]}
    >
      {["menu", "info", "reviews"].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            activeTab === tab && { borderBottomColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab(tab as typeof activeTab)}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === tab
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
              },
            ]}
          >
            {tab === "menu"
              ? "Cardápio"
              : tab === "info"
              ? "Informações"
              : "Avaliações"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "menu":
        return (
          <View style={styles.contentContainer}>
            <Card style={styles.menuCard}>
              <View style={styles.menuHeader}>
                <Ionicons
                  name="restaurant-outline"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text
                  style={[
                    styles.menuTitle,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Cardápio
                </Text>
              </View>
              <Text
                style={[
                  styles.menuDescription,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Em breve você poderá ver o cardápio completo deste restaurante
                com todos os pratos disponíveis, preços e ingredientes.
              </Text>
            </Card>
          </View>
        );

      case "info":
        return (
          <View style={styles.contentContainer}>
            <Card style={styles.infoCard}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Informações do Restaurante
              </Text>

              {restaurant.address && (
                <View style={styles.detailItem}>
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                  <View style={styles.detailContent}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Endereço
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {restaurant.address}
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {restaurant.city}, {restaurant.state} -{" "}
                      {restaurant.zipCode}
                    </Text>
                  </View>
                </View>
              )}

              {restaurant.phone && (
                <View style={styles.detailItem}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                  <View style={styles.detailContent}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Telefone
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {restaurant.phone}
                    </Text>
                  </View>
                </View>
              )}

              {restaurant.cuisine && (
                <View style={styles.detailItem}>
                  <Ionicons
                    name="restaurant-outline"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                  <View style={styles.detailContent}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Tipo de Cozinha
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {restaurant.cuisine}
                    </Text>
                  </View>
                </View>
              )}
            </Card>
          </View>
        );

      case "reviews":
        return (
          <View style={styles.contentContainer}>
            <Card style={styles.reviewsCard}>
              <View style={styles.reviewsHeader}>
                <Ionicons
                  name="star-outline"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text
                  style={[
                    styles.reviewsTitle,
                    { color: theme.colors.textPrimary },
                  ]}
                >
                  Avaliações
                </Text>
              </View>
              <Text
                style={[
                  styles.reviewsDescription,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Em breve você poderá ver as avaliações e comentários de outros
                usuários sobre este restaurante.
              </Text>
            </Card>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderTabs()}
        {renderContent()}
      </ScrollView>

      {/* Action Button */}
      <View
        style={[
          styles.actionContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Button
          title="Fazer Pedido"
          onPress={() => {
            // TODO: Navigate to order screen
            console.log(
              "Navigate to order screen for restaurant:",
              restaurant.id
            );
          }}
          style={styles.orderButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  header: {
    marginBottom: 0,
  },
  imageContainer: {
    position: "relative",
    height: 250,
  },
  restaurantImage: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 44,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteButton: {
    position: "absolute",
    top: 44,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContainer: {
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  titleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  restaurantName: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  quickInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 6,
  },
  statusContainer: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  contentContainer: {
    padding: 16,
  },
  menuCard: {
    marginBottom: 16,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  menuDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    lineHeight: 20,
  },
  reviewsCard: {
    marginBottom: 16,
  },
  reviewsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  reviewsDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  orderButton: {
    marginBottom: 0,
  },
});
