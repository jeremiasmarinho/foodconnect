import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { colors } from "../../styles/colors";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to monitoring service
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you would send this to your error reporting service
    if (__DEV__) {
      console.group("🚨 Error Boundary Details");
      console.error("Error:", error.message);
      console.error("Stack:", error.stack);
      console.error("Component Stack:", errorInfo.componentStack);
      console.groupEnd();
    }
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;

    Alert.alert(
      "Reportar Erro",
      "Deseja reportar este erro para nossa equipe de desenvolvimento?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Reportar",
          onPress: () => {
            // Here you would implement error reporting to your service
            console.log("Error reported:", { error, errorInfo });
            Alert.alert("Sucesso", "Erro reportado com sucesso!");
          },
        },
      ]
    );
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Oops! Algo deu errado</Text>
            <Text style={styles.errorMessage}>
              Ocorreu um erro inesperado. Nossa equipe foi notificada.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.devErrorInfo}>
                <Text style={styles.devErrorTitle}>
                  Detalhes do Erro (DEV):
                </Text>
                <Text style={styles.devErrorText}>
                  {this.state.error.message}
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={this.handleRestart}
              >
                <Text style={styles.primaryButtonText}>Tentar Novamente</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={this.handleReportError}
              >
                <Text style={styles.secondaryButtonText}>Reportar Erro</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  errorCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: "100%",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.error,
    marginBottom: 12,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  devErrorInfo: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: "100%",
  },
  devErrorTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.error,
    marginBottom: 8,
  },
  devErrorText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ErrorBoundary;
