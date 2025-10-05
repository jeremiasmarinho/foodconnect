import apiClient from "./api/client";
import { MenuItem, Order, CreateOrderDto } from "../types/orders";

export const menuItemsApi = {
  // Get all menu items
  getAll: async (): Promise<MenuItem[]> => {
    return await apiClient.get<MenuItem[]>("/menu-items");
  },

  // Get menu items by restaurant
  getByRestaurant: async (restaurantId: string): Promise<MenuItem[]> => {
    return await apiClient.get<MenuItem[]>(
      `/menu-items/restaurant/${restaurantId}`
    );
  },

  // Get single menu item
  getById: async (id: string): Promise<MenuItem> => {
    return await apiClient.get<MenuItem>(`/menu-items/${id}`);
  },

  // Create menu item (admin only)
  create: async (menuItem: Omit<MenuItem, "id">): Promise<MenuItem> => {
    return await apiClient.post<MenuItem>("/menu-items", menuItem);
  },

  // Update menu item (admin only)
  update: async (
    id: string,
    menuItem: Partial<MenuItem>
  ): Promise<MenuItem> => {
    return await apiClient.patch<MenuItem>(`/menu-items/${id}`, menuItem);
  },

  // Delete menu item (admin only)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/menu-items/${id}`);
  },
};

export const ordersApi = {
  // Create new order
  create: async (orderData: CreateOrderDto): Promise<Order> => {
    return await apiClient.post<Order>("/orders", orderData);
  },

  // Get all orders (admin only)
  getAll: async (): Promise<Order[]> => {
    return await apiClient.get<Order[]>("/orders");
  },

  // Get user's orders
  getMyOrders: async (): Promise<Order[]> => {
    return await apiClient.get<Order[]>("/orders/my-orders");
  },

  // Get orders by restaurant (restaurant owner only)
  getByRestaurant: async (restaurantId: string): Promise<Order[]> => {
    return await apiClient.get<Order[]>(`/orders/restaurant/${restaurantId}`);
  },

  // Get single order
  getById: async (id: string): Promise<Order> => {
    return await apiClient.get<Order>(`/orders/${id}`);
  },

  // Update order status
  updateStatus: async (
    id: string,
    status: string,
    estimatedTime?: string
  ): Promise<Order> => {
    return await apiClient.patch<Order>(`/orders/${id}`, {
      status,
      estimatedTime,
    });
  },

  // Cancel order
  cancel: async (id: string): Promise<Order> => {
    return await apiClient.patch<Order>(`/orders/${id}`, {
      status: "cancelled",
    });
  },

  // Delete order (admin only)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
  },
};
