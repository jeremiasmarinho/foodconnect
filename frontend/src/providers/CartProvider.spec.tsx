import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { View, Text, TouchableOpacity } from "react-native";
import { CartProvider, useCart } from "./CartProvider";
import { MenuItem } from "../types/orders";

// Simple test component
const CartTestComponent = () => {
  const { state, addItem, removeItem, clearCart, getSubtotal, getItemCount } =
    useCart();

  const testMenuItem: MenuItem = {
    id: "pizza-1",
    name: "Margherita Pizza",
    description: "Classic pizza with tomato and mozzarella",
    price: 18.99,
    category: "pizza",
    isAvailable: true,
    restaurantId: "restaurant-1",
  };

  return (
    <View>
      <Text testID="item-count">{getItemCount()}</Text>
      <Text testID="subtotal">{getSubtotal().toFixed(2)}</Text>
      <Text testID="restaurant-id">{state.restaurantId || "none"}</Text>

      <TouchableOpacity
        testID="add-item-btn"
        onPress={() => addItem(testMenuItem, 1)}
      >
        <Text>Add Item</Text>
      </TouchableOpacity>

      <TouchableOpacity
        testID="remove-item-btn"
        onPress={() => removeItem("pizza-1")}
      >
        <Text>Remove Item</Text>
      </TouchableOpacity>

      <TouchableOpacity testID="clear-cart-btn" onPress={() => clearCart()}>
        <Text>Clear Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

describe("CartProvider", () => {
  const renderWithProvider = () => {
    return render(
      <CartProvider>
        <CartTestComponent />
      </CartProvider>
    );
  };

  it("should render with empty cart initially", () => {
    const { getByTestId } = renderWithProvider();

    expect(getByTestId("item-count")).toHaveTextContent("0");
    expect(getByTestId("subtotal")).toHaveTextContent("0.00");
    expect(getByTestId("restaurant-id")).toHaveTextContent("none");
  });

  it("should add item to cart", () => {
    const { getByText, getByTestId } = renderWithProvider();

    fireEvent.press(getByText("Add Item"));

    expect(getByTestId("item-count")).toHaveTextContent("1");
    expect(getByTestId("subtotal")).toHaveTextContent("18.99");
  });

  it("should remove item from cart", () => {
    const { getByText, getByTestId } = renderWithProvider();

    // Add item first
    fireEvent.press(getByText("Add Item"));
    expect(getByTestId("item-count")).toHaveTextContent("1");

    // Then remove it
    fireEvent.press(getByText("Remove Item"));
    expect(getByTestId("item-count")).toHaveTextContent("0");
    expect(getByTestId("subtotal")).toHaveTextContent("0.00");
  });

  it("should clear entire cart", () => {
    const { getByText, getByTestId } = renderWithProvider();

    // Add item first
    fireEvent.press(getByText("Add Item"));
    expect(getByTestId("item-count")).toHaveTextContent("1");

    // Clear cart
    fireEvent.press(getByText("Clear Cart"));
    expect(getByTestId("item-count")).toHaveTextContent("0");
    expect(getByTestId("subtotal")).toHaveTextContent("0.00");
  });
});
