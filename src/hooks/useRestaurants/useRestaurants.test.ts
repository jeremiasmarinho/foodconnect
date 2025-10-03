import { renderHook, waitFor } from "@testing-library/react-native";
import { useRestaurants } from "../useRestaurants";

// Mock do serviço de restaurantes
const mockRestaurants = [
  {
    id: "1",
    name: "Pizza Prime",
    description: "Delicious Italian pizza",
    rating: 4.5,
    deliveryTime: "30-45 min",
    deliveryFee: 3.99,
    isOpen: true,
  },
  {
    id: "2",
    name: "Burger House",
    description: "Best burgers in town",
    rating: 4.2,
    deliveryTime: "25-35 min",
    deliveryFee: 2.99,
    isOpen: true,
  },
];

// Mock da API
jest.mock("../../services/api", () => ({
  restaurantsApi: {
    getAll: jest.fn().mockResolvedValue(mockRestaurants),
    getById: jest.fn(),
    search: jest.fn(),
    getNearby: jest.fn(),
  },
}));

describe("useRestaurants Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return restaurants data", async () => {
    const { result } = renderHook(() => useRestaurants());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockRestaurants);
    expect(result.current.isError).toBe(false);
  });

  it("should handle loading state", () => {
    const { result } = renderHook(() => useRestaurants());

    // Should be loading initially
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("should search restaurants", async () => {
    const searchResults = [mockRestaurants[0]];

    const { restaurantsApi } = require("../../services/api");
    restaurantsApi.search.mockResolvedValue(searchResults);

    const { result } = renderHook(() => useRestaurants());

    // Simulate search
    result.current.searchRestaurants("pizza");

    await waitFor(() => {
      expect(restaurantsApi.search).toHaveBeenCalledWith("pizza");
    });
  });

  it("should get restaurant by ID", async () => {
    const restaurant = mockRestaurants[0];

    const { restaurantsApi } = require("../../services/api");
    restaurantsApi.getById.mockResolvedValue(restaurant);

    const { result } = renderHook(() => useRestaurants());

    // Simulate getting by ID
    result.current.getRestaurantById("1");

    await waitFor(() => {
      expect(restaurantsApi.getById).toHaveBeenCalledWith("1");
    });
  });

  it("should get nearby restaurants", async () => {
    const nearbyRestaurants = mockRestaurants;

    const { restaurantsApi } = require("../../services/api");
    restaurantsApi.getNearby.mockResolvedValue(nearbyRestaurants);

    const { result } = renderHook(() => useRestaurants());

    // Simulate getting nearby
    const location = { latitude: -23.5505, longitude: -46.6333 };
    result.current.getNearbyRestaurants(location);

    await waitFor(() => {
      expect(restaurantsApi.getNearby).toHaveBeenCalledWith(location);
    });
  });
});
