import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useErrorContext } from "../../contexts/ErrorContext";
import api from "../../services/api/interceptors";
import { colors } from "../../styles/colors";

const ErrorHandlingExample: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess, showWarning, showInfo } = useErrorContext();

  const simulateNetworkError = async () => {
    setLoading(true);
    try {
      // This will trigger a network error
      await api.get("/nonexistent-endpoint");
    } catch (error) {
      showError(error, () => simulateNetworkError());
    } finally {
      setLoading(false);
    }
  };

  const simulateValidationError = async () => {
    setLoading(true);
    try {
      // This will trigger a validation error (422)
      await api.post("/auth/register", {
        email: "invalid-email",
        password: "123", // too short
      });
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const simulateServerError = async () => {
    setLoading(true);
    try {
      // This will trigger a server error (500)
      await api.get("/simulate-server-error");
    } catch (error) {
      showError(error, () => simulateServerError());
    } finally {
      setLoading(false);
    }
  };

  const simulateUnauthorizedError = async () => {
    setLoading(true);
    try {
      // This will trigger unauthorized error (401)
      await api.get("/protected-route");
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const showSuccessExample = () => {
    showSuccess("Operação realizada com sucesso!");
  };

  const showWarningExample = () => {
    showWarning("Atenção: Esta ação não pode ser desfeita.");
  };

  const showInfoExample = () => {
    showInfo("Informação: Sua sessão expira em 5 minutos.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exemplos de Tratamento de Erros</Text>

      <Text style={styles.subtitle}>Testar Erros de API:</Text>

      <TouchableOpacity
        style={[styles.button, styles.errorButton]}
        onPress={simulateNetworkError}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Carregando..." : "Erro de Rede (404)"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.errorButton]}
        onPress={simulateValidationError}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Carregando..." : "Erro de Validação (422)"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.errorButton]}
        onPress={simulateServerError}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Carregando..." : "Erro do Servidor (500)"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.errorButton]}
        onPress={simulateUnauthorizedError}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Carregando..." : "Não Autorizado (401)"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Testar Feedbacks Visuais:</Text>

      <TouchableOpacity
        style={[styles.button, styles.successButton]}
        onPress={showSuccessExample}
      >
        <Text style={styles.buttonText}>Mostrar Sucesso</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.warningButton]}
        onPress={showWarningExample}
      >
        <Text style={styles.buttonText}>Mostrar Aviso</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.infoButton]}
        onPress={showInfoExample}
      >
        <Text style={styles.buttonText}>Mostrar Info</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 24,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  errorButton: {
    backgroundColor: colors.error,
  },
  successButton: {
    backgroundColor: colors.success,
  },
  warningButton: {
    backgroundColor: colors.warning,
  },
  infoButton: {
    backgroundColor: colors.info,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ErrorHandlingExample;
