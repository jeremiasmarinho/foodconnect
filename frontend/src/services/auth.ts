import { apiClient } from "../api/client";
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
} from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@foodconnect:token";
const USER_KEY = "@foodconnect:user";

export class AuthService {
  static async login(
    credentials: LoginRequest
  ): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>(
        "/auth/login",
        credentials
      );

      if (response.data.access_token) {
        await AsyncStorage.setItem(TOKEN_KEY, response.data.access_token);
        await AsyncStorage.setItem(
          USER_KEY,
          JSON.stringify(response.data.user)
        );
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao fazer login",
      };
    }
  }

  static async register(
    userData: RegisterRequest
  ): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>(
        "/auth/register",
        userData
      );

      if (response.data.access_token) {
        await AsyncStorage.setItem(TOKEN_KEY, response.data.access_token);
        await AsyncStorage.setItem(
          USER_KEY,
          JSON.stringify(response.data.user)
        );
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao criar conta",
      };
    }
  }

  static async logout(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        await apiClient.post("/auth/logout");
      }
    } catch (error) {
      console.warn("Erro ao fazer logout no servidor:", error);
    } finally {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    }
  }

  static async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  }

  static async getStoredUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  static async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get<User>("/auth/profile");
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Erro ao buscar perfil",
      };
    }
  }

  static async refreshToken(): Promise<boolean> {
    try {
      const response = await apiClient.post<{ access_token: string }>(
        "/auth/refresh"
      );
      if (response.data.access_token) {
        await AsyncStorage.setItem(TOKEN_KEY, response.data.access_token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return !!token;
  }
}

// Export a singleton instance with wrapper methods
export const authService = {
  async login(credentials: LoginRequest): Promise<User> {
    const response = await AuthService.login(credentials);
    if (!response.success || !response.data) {
      throw new Error(response.error || "Login failed");
    }
    return response.data.user;
  },

  async register(userData: RegisterRequest): Promise<User> {
    const response = await AuthService.register(userData);
    if (!response.success || !response.data) {
      throw new Error(response.error || "Registration failed");
    }
    return response.data.user;
  },

  async logout(): Promise<void> {
    await AuthService.logout();
  },

  async restoreSession(): Promise<User | null> {
    const token = await AuthService.getStoredToken();
    if (!token) {
      return null;
    }

    const response = await AuthService.getCurrentUser();
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  },

  async getCurrentUser(): Promise<User | null> {
    const response = await AuthService.getCurrentUser();
    if (response.success && response.data) {
      return response.data;
    }
    return null;
  },
};
