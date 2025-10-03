import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth";
import { authApi, usersApi } from "../services/api";
import {
  LoginRequest,
  RegisterRequest,
  User,
  UpdateUserRequest,
} from "../types";

// Query keys for caching
export const authKeys = {
  user: ["auth", "user"] as const,
  profile: ["auth", "profile"] as const,
};

// Authentication hooks
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (user: User) => {
      // Cache user data
      queryClient.setQueryData(authKeys.user, user);
      queryClient.setQueryData(authKeys.profile, user);
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
    onSuccess: (user: User) => {
      // Cache user data
      queryClient.setQueryData(authKeys.user, user);
      queryClient.setQueryData(authKeys.profile, user);
    },
    onError: (error) => {
      console.error("Registration error:", error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
};

// User profile hooks
export const useProfile = () => {
  return useQuery({
    queryKey: authKeys.profile,
    queryFn: () => authApi.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => usersApi.updateMe(data),
    onSuccess: (updatedUser: User) => {
      // Update cached user data
      queryClient.setQueryData(authKeys.user, updatedUser);
      queryClient.setQueryData(authKeys.profile, updatedUser);
    },
    onError: (error) => {
      console.error("Profile update error:", error);
    },
  });
};

// Authentication status hook
export const useAuthStatus = () => {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: () => authService.restoreSession(),
    staleTime: Infinity,
    retry: false,
  });
};

// Current user hook
export const useCurrentUser = () => {
  const { data: user, isLoading, error } = useAuthStatus();

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
  };
};
