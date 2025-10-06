import apiClient from "./client";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Post,
  Restaurant,
  CreatePostRequest,
  CreateCommentRequest,
  CreateRestaurantRequest,
  UpdateUserRequest,
  PaginatedResponse,
} from "../../types";

// Authentication API
export const authApi = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    apiClient.post("/auth/login", data),

  register: (data: RegisterRequest): Promise<AuthResponse> =>
    apiClient.post("/auth/register", data),

  getProfile: (): Promise<User> => apiClient.get("/auth/profile"),

  healthCheck: (): Promise<{
    service: string;
    status: string;
    timestamp: string;
  }> => apiClient.get("/auth/health"),
};

// Users API
export const usersApi = {
  getMe: (): Promise<User> => apiClient.get("/users/me"),

  updateMe: (data: UpdateUserRequest): Promise<User> =>
    apiClient.put("/users/me", data),

  getUsers: (params?: { page?: number; limit?: number }): Promise<User[]> =>
    apiClient.get("/users", { params }),

  searchUsers: (name: string): Promise<User[]> =>
    apiClient.get("/users/search", { params: { name } }),

  getUserById: (id: string): Promise<User> => apiClient.get(`/users/${id}`),

  getUserByUsername: (username: string): Promise<User> =>
    apiClient.get(`/users/username/${username}`),
};

// Posts API
export const postsApi = {
  createPost: (data: CreatePostRequest): Promise<Post> =>
    apiClient.post("/posts", data),

  getPost: (id: string): Promise<Post> => apiClient.get(`/posts/${id}`),

  getPosts: (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Post>> => apiClient.get("/posts", { params }),

  updatePost: (id: string, data: Partial<CreatePostRequest>): Promise<Post> =>
    apiClient.put(`/posts/${id}`, data),

  deletePost: (id: string): Promise<void> => apiClient.delete(`/posts/${id}`),

  getFeed: (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Post>> =>
    apiClient.get("/posts/feed/timeline", { params }),

  getUserPosts: (
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<Post[]> => apiClient.get(`/posts/user/${userId}`, { params }),

  getRestaurantPosts: (
    restaurantId: string,
    params?: { page?: number; limit?: number }
  ): Promise<Post[]> =>
    apiClient.get(`/posts/restaurant/${restaurantId}`, { params }),

  likePost: (id: string): Promise<{ liked: boolean; likesCount: number }> =>
    apiClient.post(`/posts/${id}/like`),

  unlikePost: (id: string): Promise<{ liked: boolean; likesCount: number }> =>
    apiClient.delete(`/posts/${id}/like`),

  getPostComments: (postId: string): Promise<Comment[]> =>
    apiClient.get(`/posts/${postId}/comments`),

  addComment: (postId: string, data: CreateCommentRequest): Promise<Comment> =>
    apiClient.post(`/posts/${postId}/comments`, data),

  getMyPosts: (params?: { page?: number; limit?: number }): Promise<Post[]> =>
    apiClient.get("/posts/me/posts", { params }),
};

// Restaurants API
export const restaurantsApi = {
  createRestaurant: (data: CreateRestaurantRequest): Promise<Restaurant> =>
    apiClient.post("/restaurants", data),

  getRestaurant: (id: string): Promise<Restaurant> =>
    apiClient.get(`/restaurants/${id}`),

  updateRestaurant: (
    id: string,
    data: Partial<Restaurant>
  ): Promise<Restaurant> => apiClient.put(`/restaurants/${id}`, data),

  deleteRestaurant: (id: string): Promise<void> =>
    apiClient.delete(`/restaurants/${id}`),

  getRestaurants: (params?: {
    page?: number;
    limit?: number;
  }): Promise<Restaurant[]> => apiClient.get("/restaurants", { params }),

  searchRestaurants: (q: string): Promise<Restaurant[]> =>
    apiClient.get("/restaurants/search/query", { params: { q } }),

  getNearbyRestaurants: (params: {
    lat: number;
    lng: number;
    radius?: number;
  }): Promise<Restaurant[]> =>
    apiClient.get("/restaurants/nearby/location", { params }),
};

// Stories API
export const storiesApi = {
  getStoriesForUser: (userId: string): Promise<any[]> =>
    apiClient.get(`/stories/feed/${userId}`),

  getUserStories: (userId: string): Promise<any[]> =>
    apiClient.get(`/stories/user/${userId}`),

  createStory: (data: any): Promise<any> => apiClient.post("/stories", data),

  markStoryAsViewed: (
    storyId: string,
    data: { userId: string }
  ): Promise<void> => apiClient.post(`/stories/${storyId}/view`, data),

  getStoryMetrics: (storyId: string): Promise<any> =>
    apiClient.get(`/stories/${storyId}/metrics`),

  deleteStory: (storyId: string): Promise<void> =>
    apiClient.delete(`/stories/${storyId}`),

  toggleHighlight: (
    storyId: string,
    data: { isHighlighted: boolean }
  ): Promise<any> => apiClient.patch(`/stories/${storyId}/highlight`, data),
};

// App API
export const appApi = {
  healthCheck: (): Promise<string> => apiClient.get("/"),
};
