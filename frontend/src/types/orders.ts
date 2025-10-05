export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string;
  isAvailable: boolean;
  restaurantId: string;
  restaurant?: {
    id: string;
    name: string;
  };
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivered"
    | "cancelled";
  total: number;
  deliveryFee: number;
  subtotal: number;
  notes?: string;
  deliveryAddress?: string;
  estimatedTime?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  restaurantId: string;
  restaurant: {
    id: string;
    name: string;
    address: string;
    phone?: string;
  };
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  notes?: string;
  menuItem: MenuItem;
}

export interface CreateOrderDto {
  restaurantId: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string;
  deliveryAddress?: string;
  orderItems: Array<{
    menuItemId: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
}
