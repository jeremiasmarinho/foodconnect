import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ordersApi } from "../../services/ordersApi";
import { Order } from "../../types/orders";
import { LIGHT_THEME } from "../../constants/theme";

// Map theme colors
const Colors = {
  primary: LIGHT_THEME.primary,
  white: "#FFFFFF",
  dark: LIGHT_THEME.textPrimary,
  gray: LIGHT_THEME.textSecondary,
  lightGray: LIGHT_THEME.surfaceVariant,
  success: "#00BF63",
  warning: "#FFA500",
  error: "#FF4757",
};

type RouteParams = {
  orderId: string;
};

type NavigationProp = NativeStackNavigationProp<any>;

const OrderDetailsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { orderId } = route.params as RouteParams;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      const orderDetails = await ordersApi.getById(orderId);
      setOrder(orderDetails);
    } catch (error) {
      console.error("Error loading order details:", error);
      Alert.alert("Erro", "Não foi possível carregar os detalhes do pedido");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return Colors.warning;
      case "confirmed":
      case "preparing":
        return Colors.primary;
      case "ready":
      case "delivered":
        return Colors.success;
      case "cancelled":
        return Colors.error;
      default:
        return Colors.gray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "confirmed":
        return "Confirmado";
      case "preparing":
        return "Preparando";
      case "ready":
        return "Pronto para retirada";
      case "delivered":
        return "Entregue";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCancelOrder = () => {
    if (!order || order.status !== "pending") return;

    Alert.alert(
      "Cancelar Pedido",
      "Tem certeza que deseja cancelar este pedido?",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              const cancelledOrder = await ordersApi.cancel(order.id);
              setOrder(cancelledOrder);
              Alert.alert("Sucesso", "Pedido cancelado com sucesso");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível cancelar o pedido");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Pedido</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando detalhes...</Text>
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Pedido</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Pedido não encontrado</Text>
        </View>
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
        <Text style={styles.headerTitle}>Pedido #{order.id.slice(-6)}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Order Status */}
        <View style={styles.statusSection}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(order.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
          </View>
          {order.estimatedTime && (
            <Text style={styles.estimatedTime}>
              Tempo estimado: {order.estimatedTime}
            </Text>
          )}
          <Text style={styles.orderDate}>
            Pedido realizado em {formatDate(order.createdAt)}
          </Text>
        </View>

        {/* Restaurant Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurante</Text>
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{order.restaurant.name}</Text>
            <Text style={styles.restaurantAddress}>
              {order.restaurant.address}
            </Text>
            {order.restaurant.phone && (
              <Text style={styles.restaurantPhone}>
                {order.restaurant.phone}
              </Text>
            )}
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens do Pedido</Text>
          {order.orderItems.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {item.quantity}x {item.menuItem.name}
                </Text>
                {item.notes && (
                  <Text style={styles.itemNotes}>Obs: {item.notes}</Text>
                )}
              </View>
              <Text style={styles.itemPrice}>
                R$ {(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
            <Text style={styles.deliveryAddress}>{order.deliveryAddress}</Text>
          </View>
        )}

        {/* Order Notes */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.orderNotes}>{order.notes}</Text>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                R$ {order.subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxa de entrega</Text>
              <Text style={styles.summaryValue}>
                R$ {order.deliveryFee.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>R$ {order.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {order.status === "pending" && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelOrder}
            >
              <Text style={styles.cancelButtonText}>Cancelar Pedido</Text>
            </TouchableOpacity>
          </View>
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: Colors.gray,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
  },
  content: {
    flex: 1,
  },
  statusSection: {
    alignItems: "center",
    padding: 24,
    backgroundColor: Colors.lightGray,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  estimatedTime: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: "500",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: Colors.gray,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 12,
  },
  restaurantInfo: {
    backgroundColor: Colors.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 2,
  },
  restaurantPhone: {
    fontSize: 14,
    color: Colors.gray,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.dark,
  },
  itemNotes: {
    fontSize: 12,
    color: Colors.gray,
    fontStyle: "italic",
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.dark,
  },
  deliveryAddress: {
    fontSize: 14,
    color: Colors.dark,
    backgroundColor: Colors.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  orderNotes: {
    fontSize: 14,
    color: Colors.dark,
    backgroundColor: Colors.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  summary: {
    backgroundColor: Colors.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.gray,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.dark,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.white,
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.dark,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
  },
  actionsSection: {
    padding: 16,
  },
  cancelButton: {
    backgroundColor: Colors.error,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default OrderDetailsScreen;
