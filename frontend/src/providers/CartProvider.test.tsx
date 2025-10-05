import React from "react";
import { render, act } from "@testing-library/react-native";
import { CartProvider, useCart } from "./CartProvider";
import { View, Text, Button } from "react-native";

// Test component that uses the cart context
const TestComponent = () => {
  const { state, addItem, removeItem, updateQuantity, clearCart, getSubtotal } =
    useCart();

  return (
    <View>
      <Text testID="cart-items-count">{state.items.length}</Text>
      <Text testID="cart-total">{getSubtotal()}</Text>
      <Text testID="restaurant-id">{state.restaurantId || "none"}</Text>

      <Button
        testID="add-item-btn"
        title="Add Item"
        onPress={() =>
          addItem(
            {
              id: "item-1",
              name: "Test Pizza",
              price: 25.99,
              restaurantId: "restaurant-1",
              description: "Delicious test pizza",
              category: "pizza",
              isAvailable: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            1
          )
        }
      />

      <Button
        testID="update-quantity-btn"
        title="Update Quantity"
        onPress={() => updateQuantity("item-1", 2)}
      />

      <Button
        testID="remove-item-btn"
        title="Remove Item"
        onPress={() => removeItem("item-1")}
      />

      <Button
        testID="clear-cart-btn"
        title="Clear Cart"
        onPress={() => clearCart()}
      />
    </View>
  );
};

describe("CartProvider", () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<CartProvider>{component}</CartProvider>);
  };

  it("should provide initial empty cart state", () => {
    const { getByTestId } = renderWithProvider(<TestComponent />);

    expect(getByTestId("cart-items-count")).toHaveTextContent("0");
    expect(getByTestId("cart-total")).toHaveTextContent("0");
    expect(getByTestId("restaurant-id")).toHaveTextContent("none");
  });

  it("should add item to cart", () => {
    const { getByTestId } = renderWithProvider(<TestComponent />);

    act(() => {
      getByTestId("add-item-btn").props.onPress();
    });

    expect(getByTestId("cart-items-count")).toHaveTextContent("1");
    expect(getByTestId("cart-total")).toHaveTextContent("25.99");
    expect(getByTestId("restaurant-id")).toHaveTextContent("restaurant-1");
  });

  it("should update item quantity", () => {
    const { getByTestId } = renderWithProvider(<TestComponent />);

    // First add an item
    act(() => {
      getByTestId("add-item-btn").props.onPress();
    });

    // Then update quantity
    act(() => {
      getByTestId("update-quantity-btn").props.onPress();
    });

    expect(getByTestId("cart-items-count")).toHaveTextContent("1"); // Still 1 item
    expect(getByTestId("cart-total")).toHaveTextContent("51.98"); // 25.99 * 2
  });

  it("should remove item from cart", () => {
    const { getByTestId } = renderWithProvider(<TestComponent />);

    // First add an item
    act(() => {
      getByTestId("add-item-btn").props.onPress();
    });

    expect(getByTestId("cart-items-count")).toHaveTextContent("1");

    // Then remove it
    act(() => {
      getByTestId("remove-item-btn").props.onPress();
    });

    expect(getByTestId("cart-items-count")).toHaveTextContent("0");
    expect(getByTestId("cart-total")).toHaveTextContent("0");
  });

  it("should clear entire cart", () => {
    const { getByTestId } = renderWithProvider(<TestComponent />);

    // Add an item
    act(() => {
      getByTestId("add-item-btn").props.onPress();
    });

    expect(getByTestId("cart-items-count")).toHaveTextContent("1");

    // Clear cart
    act(() => {
      getByTestId("clear-cart-btn").props.onPress();
    });

    expect(getByTestId("cart-items-count")).toHaveTextContent("0");
    expect(getByTestId("cart-total")).toHaveTextContent("0");
    expect(getByTestId("restaurant-id")).toHaveTextContent("none");
  });

  it("should handle adding multiple different items", () => {
    const MultiItemTestComponent = () => {
      const { cart, addToCart, getCartTotal } = useCart();

      return (
        <View>
          <Text testID="cart-items-count">{cart.items.length}</Text>
          <Text testID="cart-total">{getCartTotal()}</Text>

          <Button
            testID="add-pizza-btn"
            title="Add Pizza"
            onPress={() =>
              addToCart({
                id: "pizza-1",
                name: "Margherita Pizza",
                price: 18.99,
                restaurantId: "restaurant-1",
                quantity: 1,
              })
            }
          />

          <Button
            testID="add-burger-btn"
            title="Add Burger"
            onPress={() =>
              addToCart({
                id: "burger-1",
                name: "Classic Burger",
                price: 12.99,
                restaurantId: "restaurant-1",
                quantity: 1,
              })
            }
          />
        </View>
      );
    };

    const { getByTestId } = renderWithProvider(<MultiItemTestComponent />);

    // Add pizza
    act(() => {
      getByTestId("add-pizza-btn").props.onPress();
    });

    expect(getByTestId("cart-items-count")).toHaveTextContent("1");
    expect(getByTestId("cart-total")).toHaveTextContent("18.99");

    // Add burger
    act(() => {
      getByTestId("add-burger-btn").props.onPress();
    });

    expect(getByTestId("cart-items-count")).toHaveTextContent("2");
    expect(getByTestId("cart-total")).toHaveTextContent("31.98"); // 18.99 + 12.99
  });

  it("should prevent adding items from different restaurants", () => {
    const DifferentRestaurantTestComponent = () => {
      const { cart, addToCart, getCartTotal } = useCart();

      return (
        <View>
          <Text testID="cart-items-count">{cart.items.length}</Text>
          <Text testID="cart-total">{getCartTotal()}</Text>
          <Text testID="restaurant-id">{cart.restaurantId || "none"}</Text>

          <Button
            testID="add-pizza-btn"
            title="Add Pizza"
            onPress={() =>
              addToCart({
                id: "pizza-1",
                name: "Margherita Pizza",
                price: 18.99,
                restaurantId: "restaurant-1",
                quantity: 1,
              })
            }
          />

          <Button
            testID="add-burger-btn"
            title="Add Burger from Different Restaurant"
            onPress={() =>
              addToCart({
                id: "burger-1",
                name: "Classic Burger",
                price: 12.99,
                restaurantId: "restaurant-2", // Different restaurant
                quantity: 1,
              })
            }
          />
        </View>
      );
    };

    const { getByTestId } = renderWithProvider(
      <DifferentRestaurantTestComponent />
    );

    // Add pizza from restaurant-1
    act(() => {
      getByTestId("add-pizza-btn").props.onPress();
    });

    expect(getByTestId("cart-items-count")).toHaveTextContent("1");
    expect(getByTestId("restaurant-id")).toHaveTextContent("restaurant-1");

    // Try to add burger from restaurant-2
    act(() => {
      getByTestId("add-burger-btn").props.onPress();
    });

    // Should still only have 1 item from restaurant-1
    expect(getByTestId("cart-items-count")).toHaveTextContent("1");
    expect(getByTestId("restaurant-id")).toHaveTextContent("restaurant-1");
    expect(getByTestId("cart-total")).toHaveTextContent("18.99");
  });

  it("should handle updating quantity to zero by removing item", () => {
    const { getByTestId } = renderWithProvider(<TestComponent />);

    // Add an item
    act(() => {
      getByTestId("add-item-btn").props.onPress();
    });

    expect(getByTestId("cart-items-count")).toHaveTextContent("1");

    // Update quantity to 0
    act(() => {
      const updateToZeroComponent = () => {
        const { updateQuantity } = useCart();
        updateQuantity("item-1", 0);
        return null;
      };
      render(
        <CartProvider>
          <updateToZeroComponent />
        </CartProvider>
      );
    });

    // Item should be removed when quantity is 0
    expect(getByTestId("cart-items-count")).toHaveTextContent("0");
    expect(getByTestId("cart-total")).toHaveTextContent("0");
  });
});
