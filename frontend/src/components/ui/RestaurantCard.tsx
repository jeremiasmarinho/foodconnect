import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../providers";
import { Restaurant } from "../../types";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2; // 2 cards per row with margins

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress?: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = React.memo(
  ({ restaurant, onPress }) => {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
      container: {
        width: CARD_WIDTH,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.layout.borderRadius.lg,
        marginBottom: theme.spacing.lg,
        shadowColor: theme.colors.shadow,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      imageContainer: {
        width: "100%",
        height: 120,
        borderTopLeftRadius: theme.layout.borderRadius.lg,
        borderTopRightRadius: theme.layout.borderRadius.lg,
        overflow: "hidden",
      },
      image: {
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.textPlaceholder,
      },
      imagePlaceholder: {
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.surfaceVariant,
        justifyContent: "center",
        alignItems: "center",
      },
      content: {
        padding: theme.spacing.lg,
      },
      header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: theme.spacing.xs,
      },
      name: {
        fontSize: 16,
        fontWeight: "600",
        color: theme.colors.textPrimary,
        flex: 1,
        marginRight: theme.spacing.xs,
      },
      statusContainer: {
        flexDirection: "row",
        alignItems: "center",
      },
      statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: theme.spacing.xs,
      },
      statusText: {
        fontSize: 12,
        fontWeight: "500",
      },
      cuisine: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
      },
      infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: theme.spacing.xs,
      },
      infoText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginLeft: theme.spacing.xs,
        flex: 1,
      },
      ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: theme.spacing.xs,
      },
      rating: {
        flexDirection: "row",
        alignItems: "center",
      },
      ratingText: {
        fontSize: 14,
        fontWeight: "600",
        color: theme.colors.textPrimary,
        marginLeft: theme.spacing.xs,
      },
      deliveryFee: {
        fontSize: 12,
        color: theme.colors.textSecondary,
      },
    });

    const isOpen = restaurant.isOpen ?? true;
    const rating = restaurant.rating ?? 0;
    const deliveryTime = restaurant.deliveryTime ?? "30-40 min";
    const deliveryFee = restaurant.deliveryFee ?? 0;
    const cuisine = restaurant.cuisine ?? "Comida";

    return (
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          {restaurant.imageUrl ? (
            <Image source={{ uri: restaurant.imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name="restaurant-outline"
                size={32}
                color={theme.colors.textSecondary}
              />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {restaurant.name}
            </Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isOpen
                      ? theme.colors.success
                      : theme.colors.error,
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color: isOpen ? theme.colors.success : theme.colors.error,
                  },
                ]}
              >
                {isOpen ? "Aberto" : "Fechado"}
              </Text>
            </View>
          </View>

          <Text style={styles.cuisine} numberOfLines={1}>
            {cuisine}
          </Text>

          <View style={styles.infoRow}>
            <Ionicons
              name="time-outline"
              size={14}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.infoText}>{deliveryTime}</Text>
          </View>

          <View style={styles.ratingContainer}>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color={theme.colors.warning} />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.deliveryFee}>
              {deliveryFee === 0 ? "Grátis" : `R$ ${deliveryFee.toFixed(2)}`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);
