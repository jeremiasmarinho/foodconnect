import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../types";
import { Button, Input } from "../../components/ui";
import { useAuth, useTheme } from "../../providers";

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, "Login">;

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const { login } = useAuth();
  const { theme } = useTheme();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email inválido";
    }

    if (!password.trim()) {
      newErrors.password = "Senha é obrigatória";
    } else if (password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      // Navigation will be handled automatically by the auth state change
    } catch (error: any) {
      Alert.alert(
        "Erro no Login",
        error.response?.data?.message || "Credenciais inválidas",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: theme.spacing.xl,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              alignItems: "center",
              marginBottom: theme.spacing.xxxxl,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.fontSize.xxxxxl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.primary,
                marginBottom: theme.spacing.sm,
              }}
            >
              FoodConnect
            </Text>
            <Text
              style={{
                fontSize: theme.typography.fontSize.lg,
                color: theme.colors.textSecondary,
                textAlign: "center",
              }}
            >
              Descubra sabores incríveis
            </Text>
          </View>

          <View style={{ marginBottom: theme.spacing.xxxxl }}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              placeholder="seu@email.com"
            />

            <Input
              label="Senha"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry
              placeholder="Sua senha"
            />

            <Button
              title="Entrar"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              style={{ marginTop: theme.spacing.md }}
            />
          </View>

          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.md,
              }}
            >
              Não tem uma conta?
            </Text>
            <Button
              title="Criar conta"
              onPress={() => navigation.navigate("Register")}
              variant="outline"
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
