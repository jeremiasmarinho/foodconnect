import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "../types";
import { AuthService } from "../services/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      setIsLoading(true);
      const storedUser = await AuthService.getStoredUser();
      const token = await AuthService.getStoredToken();

      if (storedUser && token) {
        // Verificar se o token ainda é válido
        const currentUserResponse = await AuthService.getCurrentUser();
        if (currentUserResponse.success && currentUserResponse.data) {
          setUser(currentUserResponse.data);
        } else {
          // Token inválido, limpar dados
          await AuthService.logout();
          setUser(null);
        }
      }
    } catch (error) {
      console.warn("Erro ao verificar status de autenticação:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      setIsLoading(true);
      const response = await AuthService.login({ email, password });

      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: "Erro inesperado ao fazer login" };
    } finally {
      setIsLoading(false);
    }
  }

  async function register(
    name: string,
    email: string,
    username: string,
    password: string
  ) {
    try {
      setIsLoading(true);
      const response = await AuthService.register({
        name,
        email,
        username,
        password,
      });

      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: "Erro inesperado ao criar conta" };
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      setIsLoading(true);
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      console.warn("Erro ao fazer logout:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshUser() {
    try {
      const response = await AuthService.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.warn("Erro ao atualizar dados do usuário:", error);
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
