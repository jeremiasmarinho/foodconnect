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

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Create Post Request
export interface CreatePostRequest {
  content: string;
  images?: string[];
  type: PostType;
  restaurantId?: string;
  taggedFriends?: string[];
}

export interface PostUser {
  id: string;
  username: string;
  name?: string;
  avatar?: string;
  isVerified?: boolean;
}

export type EstablishmentType = "RESTAURANT" | "BAR";

export interface Establishment {
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

  // Establishment type and specific fields
  type: EstablishmentType;
  category?: string; // pizza, burger, sushi, sports bar, nightclub, etc.
  cuisine?: string; // For restaurants: Italian, Japanese, Brazilian, etc.
  ambiance?: string; // For bars: Cozy, Lively, Romantic, etc.
  rating?: number; // Average rating
  reviewCount?: number; // Number of reviews
  deliveryTime?: string; // "25-35 min"
  deliveryFee?: number; // Delivery fee in currency
  minimumOrder?: number; // Minimum order value
  isOpen?: boolean;
  priceRange?: 1 | 2 | 3 | 4; // 1-4 ($, $$, $$$, $$$$)
  openingHours?: Record<string, string>;
  features?: string[];
  tags?: string[];

  // Bar specific features
  hasLiveMusic?: boolean;
  hasKaraoke?: boolean;
  hasDanceFloor?: boolean;

  createdAt: string;
  updatedAt?: string;
}

// Keep Restaurant interface for backwards compatibility
export interface Restaurant extends Establishment {
  type: "RESTAURANT";
}

// New Bar interface
export interface Bar extends Establishment {
  type: "BAR";
}

export type PostType = "FOOD" | "DRINKS" | "SOCIAL";

export interface PostTag {
  id: string;
  postId: string;
  userId: string;
  user: User;
  x?: number; // X coordinate for photo tagging (0-1)
  y?: number; // Y coordinate for photo tagging (0-1)
  imageIndex: number; // Which image in the post (for multiple images)
}

export interface PostData {
  id: string;
  content: string;
  images: string[]; // Multiple images support
  postType: PostType;
  rating?: number; // 1-5 stars
  userId: string;
  user: PostUser;
  establishmentId?: string;
  establishment?: Establishment;
  restaurant?: Restaurant; // Backwards compatibility
  location?: string;
  likesCount: number;
  commentsCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  taggedUsers?: PostTag[]; // Users tagged in this post
  createdAt: string;
  updatedAt?: string;
}

// Post interface aligned with backend API
export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  imageUrls: string; // JSON string array
  rating?: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  restaurantId?: string;
  establishmentId?: string;
  user: PostUser;
  restaurant?: {
    id: string;
    name: string;
    city: string;
    state?: string;
    imageUrl?: string;
    cuisine?: string;
    rating?: number;
  };
  establishment?: {
    id: string;
    name: string;
    city: string;
    state?: string;
    imageUrl?: string;
    cuisine?: string;
    rating?: number;
  };
  comments?: any[];
  _count: {
    likes: number;
    comments: number;
  };
  isLikedByUser?: boolean;
  isLiked?: boolean;
  likesCount?: number;
  commentsCount?: number;
  timeAgo?: string;
  postType?: PostType;
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

// API Response types (rename to avoid conflict)
export interface BackendApiResponse<T> {
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
