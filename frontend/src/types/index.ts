// Types matching our backend API

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  website?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;

  // Restaurant specific fields
  category?: string; // pizza, burger, sushi, etc.
  cuisine?: string; // Italian, Japanese, Brazilian, etc.
  rating?: number; // Average rating
  reviewCount?: number; // Number of reviews
  deliveryTime?: string; // "25-35 min"
  deliveryFee?: number; // Delivery fee in currency
  minimumOrder?: number; // Minimum order value
  isOpen?: boolean;
  priceRange?: "low" | "medium" | "high";
  openingHours?: Record<string, string>;
  features?: string[];
  tags?: string[];

  createdAt: string;
  updatedAt?: string;
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  userId: string;
  authorId: string;
  author?: User;
  user?: User;
  restaurantId?: string;
  restaurant?: Restaurant;
  likesCount: number;
  commentsCount?: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  username: string;
}

export interface CreatePostRequest {
  content: string;
  imageUrl?: string;
  restaurantId?: string;
  location?: string;
  tags?: string[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  postId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateUserRequest {
  name?: string;
  bio?: string;
}

export interface CreateRestaurantRequest {
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  category: string;
  website?: string;
  cuisine?: string;
  rating?: number;
  deliveryTime?: string;
  deliveryFee?: number;
  minimumOrder?: number;
  isOpen?: boolean;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  PostDetail: { postId: string };
  RestaurantDetail: { restaurantId: string };
  UserProfile: { userId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Discover: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

// Component props types
export interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
}

export interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

export interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress?: (restaurantId: string) => void;
}

// Additional types for mock data
export interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  user?: User;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isAvailable: boolean;
  preparationTime?: string;
  calories?: number;
  allergens?: string[];
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
}
