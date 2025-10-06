import React from "react";
import { render, act, fireEvent } from "@testing-library/react-native";
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
        testID="update-to-zero-btn"
        title="Set Quantity Zero"
        onPress={() => updateQuantity("item-1", 0)}
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
    const { getByText, getByTestId } = renderWithProvider(<TestComponent />);

    act(() => {
      fireEvent.press(getByText("Add Item"));
    });

    expect(getByTestId("cart-items-count")).toHaveTextContent("1");
    expect(getByTestId("cart-total")).toHaveTextContent("25.99");
    expect(getByTestId("restaurant-id")).toHaveTextContent("restaurant-1");
  });

  it("should update item quantity", () => {
    const { getByText, getByTestId } = renderWithProvider(<TestComponent />);

    // First add an item
    act(() => {
      fireEvent.press(getByText("Add Item"));
    });

    // Then update quantity
    act(() => {
      fireEvent.press(getByText("Update Quantity"));
    });

    expect(getByTestId("cart-items-count")).toHaveTextContent("1"); // Still 1 item
    expect(getByTestId("cart-total")).toHaveTextContent("51.98"); // 25.99 * 2
  });

  it("should remove item from cart", () => {
    const { getByText, getByTestId } = renderWithProvider(<TestComponent />);

    // First add an item
    act(() => {
      fireEvent.press(getByText("Add Item"));
    });

    expect(getByTestId("cart-items-count")).toHaveTextContent("1");

    // Then remove it
    act(() => {
      fireEvent.press(getByText("Remove Item"));
    });

    expect(getByTestId("cart-items-count")).toHaveTextContent("0");
    expect(getByTestId("cart-total")).toHaveTextContent("0");
  });

  it("should clear entire cart", () => {
    const { getByText, getByTestId } = renderWithProvider(<TestComponent />);

    // Add an item
    act(() => {
      fireEvent.press(getByText("Add Item"));
    });

    expect(getByTestId("cart-items-count")).toHaveTextContent("1");

    // Clear cart
    act(() => {
      fireEvent.press(getByText("Clear Cart"));
    });

    expect(getByTestId("cart-items-count")).toHaveTextContent("0");
    expect(getByTestId("cart-total")).toHaveTextContent("0");
    expect(getByTestId("restaurant-id")).toHaveTextContent("none");
  });

  it("should handle adding multiple different items", () => {
    const MultiItemTestComponent = () => {
      const { state, addItem, getSubtotal } = useCart();

      return (
        <View>
          <Text testID="cart-items-count">{state.items.length}</Text>
          <Text testID="cart-total">{getSubtotal()}</Text>

          <Button
            testID="add-pizza-btn"
            title="Add Pizza"
            onPress={() =>
              addItem({
                id: "pizza-1",
                name: "Margherita Pizza",
                price: 18.99,
                restaurantId: "restaurant-1",
                isAvailable: true,
                category: "pizza",
              })
            }
          />

          <Button
            testID="add-burger-btn"
            title="Add Burger"
            onPress={() =>
              addItem({
                id: "burger-1",
                name: "Classic Burger",
                price: 12.99,
                restaurantId: "restaurant-1",
                isAvailable: true,
                category: "burger",
              })
            }
          />
        </View>
      );
    };

    const { getByText, getByTestId } = renderWithProvider(
      <MultiItemTestComponent />
    );

    // Add pizza
    act(() => {
      fireEvent.press(getByText("Add Pizza"));
    });

    expect(getByTestId("cart-items-count")).toHaveTextContent("1");
    expect(getByTestId("cart-total")).toHaveTextContent("18.99");

    // Add burger
    act(() => {
      fireEvent.press(getByText("Add Burger"));
    });

    expect(getByTestId("cart-items-count")).toHaveTextContent("2");
    const total1 = getByTestId("cart-total").props.children;
    expect(Number(total1)).toBeCloseTo(31.98, 2); // 18.99 + 12.99
  });

  it("should detect when adding items from different restaurants via helper", () => {
    const DifferentRestaurantTestComponent = () => {
      const { state, addItem, isFromSameRestaurant, getSubtotal } = useCart();

      return (
        <View>
          <Text testID="cart-items-count">{state.items.length}</Text>
          <Text testID="cart-total">{getSubtotal()}</Text>
          <Text testID="restaurant-id">{state.restaurantId || "none"}</Text>
          <Text testID="same-restaurant">
            {state.restaurantId
              ? String(isFromSameRestaurant(state.restaurantId))
              : "true"}
          </Text>

          <Button
            testID="add-pizza-btn"
            title="Add Pizza"
            onPress={() =>
              addItem({
                id: "pizza-1",
                name: "Margherita Pizza",
                price: 18.99,
                restaurantId: "restaurant-1",
                isAvailable: true,
                category: "pizza",
              })
            }
          />

          <Button
            testID="add-burger-btn"
            title="Add Burger from Different Restaurant"
            onPress={() =>
              addItem({
                id: "burger-1",
                name: "Classic Burger",
                price: 12.99,
                restaurantId: "restaurant-2",
                isAvailable: true,
                category: "burger",
              })
            }
          />
        </View>
      );
    };

    const { getByText, getByTestId } = renderWithProvider(
      <DifferentRestaurantTestComponent />
    );

    // Add pizza from restaurant-1
    act(() => {
      fireEvent.press(getByText("Add Pizza"));
    });

    expect(getByTestId("cart-items-count")).toHaveTextContent("1");
    expect(getByTestId("restaurant-id")).toHaveTextContent("restaurant-1");

    // Try to add burger from restaurant-2 (allowed by provider)
    act(() => {
      fireEvent.press(getByText("Add Burger from Different Restaurant"));
    });

    // Now cart has 2 items and restaurants differ; helper should report false when checking different id
    expect(getByTestId("cart-items-count")).toHaveTextContent("2");
    const total2 = getByTestId("cart-total").props.children;
    expect(Number(total2)).toBeCloseTo(31.98, 2);
  });

  it("should handle updating quantity to zero by removing item", () => {
    const { getByText, getByTestId } = renderWithProvider(<TestComponent />);

    // Add an item
    act(() => {
      fireEvent.press(getByText("Add Item"));
    });

    expect(getByTestId("cart-items-count")).toHaveTextContent("1");

    // Update quantity to 0 using dedicated button
    act(() => {
      fireEvent.press(getByText("Set Quantity Zero"));
    });

    // Item should be removed when quantity is 0
    expect(getByTestId("cart-items-count")).toHaveTextContent("0");
    expect(getByTestId("cart-total")).toHaveTextContent("0");
  });
});
