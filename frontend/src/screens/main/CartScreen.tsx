import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCart } from "../../providers/CartProvider";
import { ordersApi } from "../../services/ordersApi";
import { LIGHT_THEME } from "../../constants/theme";

// Map theme colors
const Colors = {
  primary: LIGHT_THEME.primary,
  white: "#FFFFFF",
  dark: LIGHT_THEME.textPrimary,
  gray: LIGHT_THEME.textSecondary,
  lightGray: LIGHT_THEME.surfaceVariant,
  success: "#00BF63",
  error: "#FF4757",
};

type NavigationProp = NativeStackNavigationProp<any>;

const CartScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const cart = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const deliveryFee = 5.99;
  const subtotal = cart.getSubtotal();
  const total = subtotal + deliveryFee;

  const handleUpdateQuantity = (menuItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      cart.removeItem(menuItemId);
    } else {
      cart.updateQuantity(menuItemId, newQuantity);
    }
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      Alert.alert("Erro", "Por favor, informe o endereço de entrega");
      return;
    }

    if (cart.state.items.length === 0) {
      Alert.alert("Erro", "Seu carrinho está vazio");
      return;
    }

    try {
      setIsPlacingOrder(true);

      const orderData = {
        restaurantId: cart.state.restaurantId!,
        subtotal,
        deliveryFee,
        total,
        deliveryAddress: deliveryAddress.trim(),
        notes: orderNotes.trim() || undefined,
        orderItems: cart.state.items.map((item) => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          price: item.menuItem.price,
          notes: item.notes || undefined,
        })),
      };

      const order = await ordersApi.create(orderData);

      // Clear cart after successful order
      cart.clearCart();

      Alert.alert(
        "Pedido Realizado!",
        `Seu pedido #${order.id.slice(
          -6
        )} foi confirmado e está sendo preparado.`,
        [
          {
            text: "Ver Pedido",
            onPress: () =>
              navigation.navigate("OrderDetails", { orderId: order.id }),
          },
          {
            text: "Continuar",
            onPress: () => navigation.navigate("Feed"),
          },
        ]
      );
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert(
        "Erro",
        "Não foi possível realizar o pedido. Tente novamente."
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cart.state.items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Carrinho</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={Colors.gray} />
          <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
          <Text style={styles.emptySubtitle}>
            Adicione itens de um restaurante para começar
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate("Feed")}
          >
            <Text style={styles.browseButtonText}>Explorar Restaurantes</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Carrinho</Text>
        <TouchableOpacity onPress={cart.clearCart}>
          <Ionicons name="trash-outline" size={24} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Restaurant Info */}
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{cart.state.restaurantName}</Text>
          <Text style={styles.itemCount}>
            {cart.getItemCount()} {cart.getItemCount() === 1 ? "item" : "itens"}
          </Text>
        </View>

        {/* Cart Items */}
        <View style={styles.itemsContainer}>
          {cart.state.items.map((item) => (
            <View key={item.menuItem.id} style={styles.cartItem}>
              <View style={styles.itemContent}>
                {item.menuItem.imageUrl && (
                  <Image
                    source={{ uri: item.menuItem.imageUrl }}
                    style={styles.itemImage}
                  />
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.menuItem.name}</Text>
                  {item.notes && (
                    <Text style={styles.itemNotes}>Obs: {item.notes}</Text>
                  )}
                  <Text style={styles.itemPrice}>
                    R$ {item.menuItem.price.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    handleUpdateQuantity(item.menuItem.id, item.quantity - 1)
                  }
                >
                  <Ionicons name="remove" size={16} color={Colors.primary} />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{item.quantity}</Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    handleUpdateQuantity(item.menuItem.id, item.quantity + 1)
                  }
                >
                  <Ionicons name="add" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
          <TextInput
            style={styles.addressInput}
            placeholder="Digite seu endereço completo"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
          />
        </View>

        {/* Order Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações do Pedido</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Alguma observação especial? (opcional)"
            value={orderNotes}
            onChangeText={setOrderNotes}
            multiline
          />
        </View>

        {/* Order Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>R$ {subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxa de entrega</Text>
            <Text style={styles.summaryValue}>R$ {deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            isPlacingOrder && styles.disabledButton,
          ]}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder}
        >
          <Text style={styles.placeOrderButtonText}>
            {isPlacingOrder
              ? "Realizando Pedido..."
              : `Finalizar Pedido • R$ ${total.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: "center",
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: Colors.white,
    fontWeight: "bold",
  },
  restaurantInfo: {
    padding: 16,
    backgroundColor: Colors.lightGray,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.dark,
  },
  itemCount: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  itemsContainer: {
    padding: 16,
  },
  cartItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    width: 60,
    height: 60,
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
  itemNotes: {
    fontSize: 12,
    color: Colors.gray,
    fontStyle: "italic",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 16,
    color: Colors.dark,
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 12,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: "top",
  },
  summary: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
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
    borderTopColor: Colors.lightGray,
    paddingTop: 8,
    marginTop: 8,
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
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  placeOrderButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: Colors.gray,
  },
  placeOrderButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CartScreen;
