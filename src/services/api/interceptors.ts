import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:3000", // Replace with your API base URL
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Add authentication token if available
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log request in development
      if (__DEV__) {
        console.log("🚀 API Request:", {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
        });
      }

      return config;
    } catch (error) {
      console.error("Request interceptor error:", error);
      return config;
    }
  },
  (error: any) => {
    console.error("Request setup error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful response in development
    if (__DEV__) {
      console.log("✅ API Response:", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    // Log error in development
    if (__DEV__) {
      console.log("❌ API Error:", {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle different error scenarios
    await handleApiError(error);

    return Promise.reject(error);
  }
);

// Error handling function
const handleApiError = async (error: AxiosError): Promise<void> => {
  const status = error.response?.status;
  const data = error.response?.data as any;

  switch (status) {
    case 400:
      // Bad Request - Show validation errors
      showErrorAlert(
        "Dados Inválidos",
        data?.message || "Verifique os dados enviados e tente novamente."
      );
      break;

    case 401:
      // Unauthorized - Handle token expiration
      await handleUnauthorized();
      break;

    case 403:
      // Forbidden
      showErrorAlert(
        "Acesso Negado",
        "Você não tem permissão para realizar esta ação."
      );
      break;

    case 404:
      // Not Found
      showErrorAlert(
        "Não Encontrado",
        "O recurso solicitado não foi encontrado."
      );
      break;

    case 422:
      // Unprocessable Entity - Validation errors
      const validationErrors = data?.errors || data?.message;
      showErrorAlert(
        "Erro de Validação",
        Array.isArray(validationErrors)
          ? validationErrors.join("\n")
          : validationErrors || "Dados inválidos."
      );
      break;

    case 429:
      // Too Many Requests
      showErrorAlert(
        "Muitas Tentativas",
        "Aguarde um momento antes de tentar novamente."
      );
      break;

    case 500:
    case 502:
    case 503:
    case 504:
      // Server errors
      showErrorAlert(
        "Erro do Servidor",
        "Ocorreu um erro interno. Tente novamente em alguns minutos."
      );
      break;

    default:
      // Network errors or other issues
      if (error.code === "ECONNABORTED") {
        showErrorAlert(
          "Timeout",
          "A requisição demorou muito para responder. Verifique sua conexão."
        );
      } else if (error.message === "Network Error") {
        showErrorAlert(
          "Erro de Conexão",
          "Verifique sua conexão com a internet e tente novamente."
        );
      } else {
        showErrorAlert(
          "Erro Inesperado",
          "Ocorreu um erro inesperado. Tente novamente."
        );
      }
  }
};

// Handle unauthorized errors (token expiration)
const handleUnauthorized = async (): Promise<void> => {
  try {
    // Clear stored authentication data
    await AsyncStorage.multiRemove(["authToken", "refreshToken", "userData"]);

    // Show alert and potentially navigate to login
    Alert.alert(
      "Sessão Expirada",
      "Sua sessão expirou. Faça login novamente.",
      [
        {
          text: "OK",
          onPress: () => {
            // Here you would navigate to login screen
            // You can use navigation service or emit an event
            console.log("Navigate to login screen");
          },
        },
      ]
    );
  } catch (error) {
    console.error("Error handling unauthorized:", error);
  }
};

// Show error alert
const showErrorAlert = (title: string, message: string): void => {
  Alert.alert(title, message, [{ text: "OK" }]);
};

// Helper function to check if error is a specific type
export const isApiError = (error: any): error is AxiosError => {
  return error && error.isAxiosError === true;
};

// Helper function to get error message
export const getErrorMessage = (error: any): string => {
  if (isApiError(error)) {
    const data = error.response?.data as any;
    return data?.message || error.message || "Erro desconhecido";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erro desconhecido";
};

// Helper function to check if user should retry
export const shouldRetry = (error: any): boolean => {
  if (isApiError(error)) {
    const status = error.response?.status;
    // Retry on server errors or network issues
    return !status || status >= 500 || error.code === "ECONNABORTED";
  }
  return false;
};

export default api;
