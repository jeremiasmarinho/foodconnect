import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../types";
import { Button, Input } from "../../components/ui";
import { useAuth, useTheme } from "../../providers";

type RegisterScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  "Register"
>;

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  navigation,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { register } = useAuth();
  const { theme } = useTheme();

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Nome de usuário é obrigatório";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Nome de usuário deve ter pelo menos 3 caracteres";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      newErrors.username =
        "Nome de usuário pode conter apenas letras, números e _";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(
        formData.email.trim(),
        formData.password,
        formData.name.trim(),
        formData.username.trim()
      );
      // Navigation will be handled automatically by the auth state change
    } catch (error: any) {
      Alert.alert(
        "Erro no Cadastro",
        error.response?.data?.message ||
          "Erro ao criar conta. Tente novamente.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { padding: theme.spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: theme.colors.primary,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: theme.spacing.lg,
              }}
            >
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                👨‍🍳
              </Text>
            </View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              Criar Conta
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.colors.textSecondary }]}
            >
              Junte-se à comunidade food lovers
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nome Completo"
              value={formData.name}
              onChangeText={(value: string) => updateFormData("name", value)}
              error={errors.name}
              leftIcon="person-outline"
              placeholder="Maria Silva"
            />

            <Input
              label="Nome de Usuário"
              value={formData.username}
              onChangeText={(value: string) =>
                updateFormData("username", value)
              }
              error={errors.username}
              autoCapitalize="none"
              leftIcon="at-outline"
              placeholder="maria_foodie"
            />

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(value: string) => updateFormData("email", value)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              placeholder="maria@exemplo.com"
            />

            <Input
              label="Senha"
              value={formData.password}
              onChangeText={(value: string) =>
                updateFormData("password", value)
              }
              error={errors.password}
              secureTextEntry
              placeholder="••••••••"
            />

            <Input
              label="Confirmar Senha"
              value={formData.confirmPassword}
              onChangeText={(value: string) =>
                updateFormData("confirmPassword", value)
              }
              error={errors.confirmPassword}
              secureTextEntry
              placeholder="••••••••"
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: theme.spacing.md,
                marginBottom: theme.spacing.lg,
              }}
            >
              <TouchableOpacity
                style={{
                  width: 20,
                  height: 20,
                  borderWidth: 2,
                  borderColor: theme.colors.primary,
                  borderRadius: 4,
                  marginRight: theme.spacing.sm,
                  backgroundColor: theme.colors.primary,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 12, fontWeight: "bold" }}
                >
                  ✓
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  flex: 1,
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textSecondary,
                  lineHeight: 18,
                }}
              >
                Concordo com os{" "}
                <Text
                  style={{ color: theme.colors.primary, fontWeight: "bold" }}
                >
                  Termos de Uso
                </Text>{" "}
                e{" "}
                <Text
                  style={{ color: theme.colors.primary, fontWeight: "bold" }}
                >
                  Política de Privacidade
                </Text>
              </Text>
            </View>

            <Button
              title="Criar Conta"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />
          </View>

          <View style={styles.footer}>
            <Text
              style={[styles.footerText, { color: theme.colors.textSecondary }]}
            >
              Já tem uma conta?
            </Text>
            <Button
              title="Fazer login"
              onPress={() => navigation.navigate("Login")}
              variant="outline"
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#8E8E93",
  },
  form: {
    marginBottom: 32,
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 12,
  },
});
