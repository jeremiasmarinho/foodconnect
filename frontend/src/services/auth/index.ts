import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../api";
import { User, LoginRequest, RegisterRequest, AuthResponse } from "../../types";

const AUTH_TOKEN_KEY = "access_token";
const USER_DATA_KEY = "user_data";

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Login user and persist session
  async login(credentials: LoginRequest): Promise<User> {
    try {
      const response: AuthResponse = await authApi.login(credentials);

      // Store token and user data
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));

      this.currentUser = response.user;
      return response.user;
    } catch (error) {
      throw new Error("Login failed. Please check your credentials.");
    }
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<User> {
    try {
      const response: AuthResponse = await authApi.register(userData);

      // Store token and user data
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));

      this.currentUser = response.user;
      return response.user;
    } catch (error) {
      throw new Error("Registration failed. Please try again.");
    }
  }

  // Logout user and clear session
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
      this.currentUser = null;
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  // Check if user has valid session
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);

      if (token && userData) {
        this.currentUser = JSON.parse(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  }

  // Get current user data
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Restore user session from storage
  async restoreSession(): Promise<User | null> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);

      if (token && userData) {
        this.currentUser = JSON.parse(userData);
        return this.currentUser;
      }
      return null;
    } catch (error) {
      console.error("Error restoring session:", error);
      return null;
    }
  }

  // Get stored auth token
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  // Refresh user profile data
  async refreshProfile(): Promise<User | null> {
    try {
      const updatedUser = await authApi.getProfile();
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      this.currentUser = updatedUser;
      return updatedUser;
    } catch (error) {
      console.error("Error refreshing profile:", error);
      return null;
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
export default authService;
