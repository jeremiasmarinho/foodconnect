import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { RestaurantCard } from "../RestaurantCard";

describe("RestaurantCard Component", () => {
  const mockRestaurant = {
    id: "1",
    name: "Pizza Prime",
    description: "Delicious Italian pizza",
    imageUrl: "https://example.com/pizza.jpg",
    rating: 4.5,
    category: "Italian",
    deliveryTime: "30-45 min",
    deliveryFee: 3.99,
    isOpen: true,
    address: "123 Main St",
    phone: "123-456-7890",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const defaultProps = {
    restaurant: mockRestaurant,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders restaurant information correctly", () => {
    const { getByText } = render(<RestaurantCard {...defaultProps} />);

    expect(getByText("Pizza Prime")).toBeTruthy();
    expect(getByText("Delicious Italian pizza")).toBeTruthy();
    expect(getByText("30-45 min")).toBeTruthy();
    expect(getByText("R$ 3,99")).toBeTruthy();
    expect(getByText("4.5")).toBeTruthy();
  });

  it('shows "Aberto" when restaurant is open', () => {
    const { getByText } = render(<RestaurantCard {...defaultProps} />);

    expect(getByText("Aberto")).toBeTruthy();
  });

  it('shows "Fechado" when restaurant is closed', () => {
    const closedRestaurant = { ...mockRestaurant, isOpen: false };
    const { getByText } = render(
      <RestaurantCard {...defaultProps} restaurant={closedRestaurant} />
    );

    expect(getByText("Fechado")).toBeTruthy();
  });

  it("calls onPress when card is pressed", () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <RestaurantCard {...defaultProps} onPress={mockOnPress} />
    );

    const card = getByTestId("restaurant-card");
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledWith(mockRestaurant);
  });

  it("renders restaurant image", () => {
    const { getByTestId } = render(<RestaurantCard {...defaultProps} />);

    const image = getByTestId("restaurant-image");
    expect(image.props.source.uri).toBe("https://example.com/pizza.jpg");
  });

  it("handles missing image gracefully", () => {
    const restaurantWithoutImage = { ...mockRestaurant, imageUrl: undefined };
    const { getByTestId } = render(
      <RestaurantCard {...defaultProps} restaurant={restaurantWithoutImage} />
    );

    expect(getByTestId("restaurant-image")).toBeTruthy();
  });

  it("formats delivery fee correctly", () => {
    const { getByText } = render(<RestaurantCard {...defaultProps} />);

    expect(getByText("R$ 3,99")).toBeTruthy();
  });

  it("shows free delivery when fee is 0", () => {
    const freeDeliveryRestaurant = { ...mockRestaurant, deliveryFee: 0 };
    const { getByText } = render(
      <RestaurantCard {...defaultProps} restaurant={freeDeliveryRestaurant} />
    );

    expect(getByText("Grátis")).toBeTruthy();
  });

  it("renders rating with star icon", () => {
    const { getByTestId } = render(<RestaurantCard {...defaultProps} />);

    expect(getByTestId("rating-star")).toBeTruthy();
  });

  it("renders category badge", () => {
    const { getByText } = render(<RestaurantCard {...defaultProps} />);

    expect(getByText("Italian")).toBeTruthy();
  });
});
