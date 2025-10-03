import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { restaurantsApi } from "../services/api";
import { Restaurant, CreateRestaurantRequest } from "../types";

// Query keys for restaurants
export const restaurantKeys = {
  all: ["restaurants"] as const,
  lists: () => [...restaurantKeys.all, "list"] as const,
  list: (filters: string) => [...restaurantKeys.lists(), { filters }] as const,
  details: () => [...restaurantKeys.all, "detail"] as const,
  detail: (id: string) => [...restaurantKeys.details(), id] as const,
  search: (query: string) => [...restaurantKeys.all, "search", query] as const,
};

// Fetch all restaurants
export const useRestaurants = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: restaurantKeys.list(JSON.stringify(params)),
    queryFn: () => restaurantsApi.getRestaurants(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch single restaurant
export const useRestaurant = (restaurantId: string) => {
  return useQuery({
    queryKey: restaurantKeys.detail(restaurantId),
    queryFn: () => restaurantsApi.getRestaurant(restaurantId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!restaurantId,
  });
};

// Search restaurants
export const useSearchRestaurants = (query: string) => {
  return useQuery({
    queryKey: restaurantKeys.search(query),
    queryFn: () => restaurantsApi.searchRestaurants(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!query && query.length > 2,
  });
};

// Create restaurant
export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRestaurantRequest) =>
      restaurantsApi.createRestaurant(data),
    onSuccess: () => {
      // Invalidate restaurants list
      queryClient.invalidateQueries({ queryKey: restaurantKeys.lists() });
    },
    onError: (error) => {
      console.error("Create restaurant error:", error);
    },
  });
};

// Update restaurant
export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateRestaurantRequest>;
    }) => restaurantsApi.updateRestaurant(id, data),
    onSuccess: (updatedRestaurant: Restaurant) => {
      // Update restaurant in cache
      queryClient.setQueryData(
        restaurantKeys.detail(updatedRestaurant.id),
        updatedRestaurant
      );
      queryClient.invalidateQueries({ queryKey: restaurantKeys.lists() });
    },
    onError: (error) => {
      console.error("Update restaurant error:", error);
    },
  });
};

// Delete restaurant
export const useDeleteRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (restaurantId: string) =>
      restaurantsApi.deleteRestaurant(restaurantId),
    onSuccess: (_, restaurantId) => {
      // Remove restaurant from cache
      queryClient.removeQueries({
        queryKey: restaurantKeys.detail(restaurantId),
      });
      queryClient.invalidateQueries({ queryKey: restaurantKeys.lists() });
    },
    onError: (error) => {
      console.error("Delete restaurant error:", error);
    },
  });
};

// Get nearby restaurants
export const useNearbyRestaurants = (params: {
  lat: number;
  lng: number;
  radius?: number;
}) => {
  return useQuery({
    queryKey: [...restaurantKeys.all, "nearby", params],
    queryFn: () => restaurantsApi.getNearbyRestaurants(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!params.lat && !!params.lng,
  });
};
