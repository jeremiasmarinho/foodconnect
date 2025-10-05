import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Formik } from "formik";
import FormField from "../../components/forms/FormField";
import FormButton from "../../components/forms/FormButton";
import { authSchemas } from "../../utils/validation/schemas";
import { masks } from "../../utils/validation/masks";
import { colors } from "../../styles/colors";
import api from "../../services/api/interceptors";
import { useErrorContext } from "../../contexts/ErrorContext";

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface RegisterScreenProps {
  onRegisterSuccess?: (token: string, user: any) => void;
  onNavigateToLogin?: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showError, showSuccess } = useErrorContext();

  const initialValues: RegisterFormData = {
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  };

  const handleRegister = async (values: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = values;
      const response = await api.post("/auth/register", registerData);
      const { access_token, user } = response.data;

      showSuccess("Conta criada com sucesso!");

      if (onRegisterSuccess) {
        onRegisterSuccess(access_token, user);
      }
    } catch (error) {
      showError(error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Preencha os dados para começar</Text>
      </View>

      <Formik
        initialValues={initialValues}
        validationSchema={authSchemas.register}
        onSubmit={handleRegister}
      >
        {({ handleSubmit, isSubmitting, isValid, dirty }) => (
          <View style={styles.form}>
            <FormField
              name="name"
              label="Nome completo"
              placeholder="Seu nome completo"
              autoCapitalize="words"
              autoCorrect={false}
              required
              leftIcon={<Text style={styles.icon}>👤</Text>}
              mask={masks.alphabetic}
              helperText="Apenas letras e espaços são permitidos"
            />

            <FormField
              name="email"
              label="Email"
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              required
              leftIcon={<Text style={styles.icon}>📧</Text>}
              helperText="Será usado para fazer login"
            />

            <FormField
              name="phone"
              label="Telefone"
              placeholder="(00) 00000-0000"
              keyboardType="phone-pad"
              required
              leftIcon={<Text style={styles.icon}>📱</Text>}
              mask={masks.phone}
              helperText="Usado para contato sobre pedidos"
            />

            <FormField
              name="password"
              label="Senha"
              placeholder="Crie uma senha segura"
              secureTextEntry={!showPassword}
              required
              leftIcon={<Text style={styles.icon}>🔒</Text>}
              rightIcon={
                <Text style={styles.icon}>{showPassword ? "🙈" : "👁️"}</Text>
              }
              onRightIconPress={togglePasswordVisibility}
              helperText="Mínimo 8 caracteres com maiúscula, minúscula e número"
            />

            <FormField
              name="confirmPassword"
              label="Confirmar senha"
              placeholder="Digite a senha novamente"
              secureTextEntry={!showConfirmPassword}
              required
              leftIcon={<Text style={styles.icon}>🔒</Text>}
              rightIcon={
                <Text style={styles.icon}>
                  {showConfirmPassword ? "🙈" : "👁️"}
                </Text>
              }
              onRightIconPress={toggleConfirmPasswordVisibility}
            />

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                Ao criar uma conta, você concorda com nossos{" "}
                <Text style={styles.link}>Termos de Uso</Text> e{" "}
                <Text style={styles.link}>Política de Privacidade</Text>
              </Text>
            </View>

            <FormButton
              title="Criar conta"
              loading={isSubmitting}
              disabled={!isValid || !dirty}
              onPress={() => handleSubmit()}
              style={styles.registerButton}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={onNavigateToLogin}
            >
              <Text style={styles.loginText}>
                Já tem uma conta? <Text style={styles.link}>Faça login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
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
  termsContainer: {
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  termsText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  registerButton: {
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
  loginButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  loginText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  link: {
    color: colors.primary,
    fontWeight: "500",
  },
});

export default RegisterScreen;
