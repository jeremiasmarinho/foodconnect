import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth, useLogin, useRegister, useLogout } from "../useAuth";
import { authService } from "../../services/auth";

// Mock do auth service
jest.mock("../../services/auth", () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    isAuthenticated: jest.fn(),
  },
}));

// Mock do AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useAuth Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useLogin", () => {
    it("should login successfully", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
      };

      mockAuthService.login.mockResolvedValue(mockUser);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogin(), { wrapper });

      const loginCredentials = {
        email: "test@example.com",
        password: "password123",
      };

      result.current.mutate(loginCredentials);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockAuthService.login).toHaveBeenCalledWith(loginCredentials);
      expect(result.current.data).toEqual(mockUser);
    });

    it("should handle login error", async () => {
      const mockError = new Error("Invalid credentials");
      mockAuthService.login.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogin(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
        password: "wrongpassword",
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe("useRegister", () => {
    it("should register successfully", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
      };

      mockAuthService.register.mockResolvedValue(mockUser);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useRegister(), { wrapper });

      const registerData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        username: "testuser",
      };

      result.current.mutate(registerData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
      expect(result.current.data).toEqual(mockUser);
    });

    it("should handle registration error", async () => {
      const mockError = new Error("Email already exists");
      mockAuthService.register.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useRegister(), { wrapper });

      result.current.mutate({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        username: "testuser",
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe("useLogout", () => {
    it("should logout successfully", async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useLogout(), { wrapper });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });
});
