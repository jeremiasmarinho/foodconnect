import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Formik } from "formik";
import FormField from "../../components/forms/FormField";
import FormButton from "../../components/forms/FormButton";
import { authSchemas } from "../../utils/validation/schemas";
import { colors } from "../../styles/colors";
import api from "../../services/api/interceptors";
import { useErrorContext } from "../../contexts/ErrorContext";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginScreenProps {
  onLoginSuccess?: (token: string, user: any) => void;
  onNavigateToRegister?: () => void;
  onForgotPassword?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onForgotPassword,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { showError, showSuccess } = useErrorContext();

  const initialValues: LoginFormData = {
    email: "",
    password: "",
  };

  const handleLogin = useCallback(
    async (values: LoginFormData) => {
      try {
        const response = await api.post("/auth/login", values);
        const { access_token, user } = response.data;

        showSuccess("Login realizado com sucesso!");

        if (onLoginSuccess) {
          onLoginSuccess(access_token, user);
        }
      } catch (error) {
        showError(error);
      }
    },
    [showSuccess, showError, onLoginSuccess]
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Bem-vindo de volta!</Text>
        <Text style={styles.subtitle}>Faça login para continuar</Text>
      </View>

      <Formik
        initialValues={initialValues}
        validationSchema={authSchemas.login}
        onSubmit={handleLogin}
      >
        {({ handleSubmit, isSubmitting, isValid, dirty }) => (
          <View style={styles.form}>
            <FormField
              name="email"
              label="Email"
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              required
              leftIcon={<Text style={styles.icon}>📧</Text>}
            />

            <FormField
              name="password"
              label="Senha"
              placeholder="Sua senha"
              secureTextEntry={!showPassword}
              required
              leftIcon={<Text style={styles.icon}>🔒</Text>}
              rightIcon={
                <Text style={styles.icon}>{showPassword ? "🙈" : "👁️"}</Text>
              }
              onRightIconPress={togglePasswordVisibility}
            />

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={onForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
            </TouchableOpacity>

            <FormButton
              title="Entrar"
              loading={isSubmitting}
              disabled={!isValid || !dirty}
              onPress={() => handleSubmit()}
              style={styles.loginButton}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <FormButton
              title="Criar nova conta"
              variant="outline"
              onPress={onNavigateToRegister}
              leftIcon={<Text style={styles.icon}>👤</Text>}
            />
          </View>
        )}
      </Formik>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Ao fazer login, você concorda com nossos{" "}
          <Text style={styles.link}>Termos de Uso</Text> e{" "}
          <Text style={styles.link}>Política de Privacidade</Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  icon: {
    fontSize: 20,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
  },
  loginButton: {
    marginBottom: 24,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  link: {
    color: colors.primary,
    fontWeight: "500",
  },
});

export default LoginScreen;
