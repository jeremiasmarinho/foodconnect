import React, { useState } from "react";
import {
  View,
  Text,
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
                🍽️
              </Text>
            </View>
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
                paddingHorizontal: theme.spacing.lg,
              }}
            >
              Conecte-se aos melhores sabores da sua cidade
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
              placeholder="maria@exemplo.com"
            />

            <Input
              label="Senha"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry
              placeholder="••••••••"
            />

            <TouchableOpacity
              style={{ alignSelf: "flex-end", marginTop: theme.spacing.sm }}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.primary,
                  fontWeight: theme.typography.fontWeight.medium,
                }}
              >
                Esqueceu a senha?
              </Text>
            </TouchableOpacity>

            <Button
              title="Entrar"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              style={{ marginTop: theme.spacing.xl }}
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
              Novo no FoodConnect?
            </Text>
            <Button
              title="Criar conta gratuita"
              onPress={() => navigation.navigate("Register")}
              variant="outline"
              fullWidth
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: theme.spacing.xl,
                paddingHorizontal: theme.spacing.lg,
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: theme.colors.border,
                }}
              />
              <Text
                style={{
                  marginHorizontal: theme.spacing.md,
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textSecondary,
                }}
              >
                ou use uma conta demo
              </Text>
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: theme.colors.border,
                }}
              />
            </View>

            <TouchableOpacity
              style={{
                marginTop: theme.spacing.md,
                padding: theme.spacing.sm,
                borderRadius: 8,
                backgroundColor: theme.colors.surface,
              }}
              onPress={() => {
                setEmail("admin@foodconnect.com");
                setPassword("FoodConnect2024!");
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.primary,
                  textAlign: "center",
                  fontWeight: theme.typography.fontWeight.medium,
                }}
              >
                🎭 Usar conta admin (admin@foodconnect.com)
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
