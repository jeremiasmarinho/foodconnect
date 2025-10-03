import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../providers";
import { Button, Input, Card } from "../../components";
import { useCurrentUser, useUpdateProfile } from "../../hooks";

export const EditProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
  });
  const [avatar, setAvatar] = useState(
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarChange = () => {
    // TODO: Implement image picker when expo-image-picker is installed
    Alert.alert(
      "Alterar Foto",
      "Funcionalidade será implementada quando expo-image-picker for instalado.",
      [{ text: "OK" }]
    );
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert("Nome obrigatório", "Por favor, insira seu nome.");
      return false;
    }
    if (!formData.username.trim()) {
      Alert.alert(
        "Username obrigatório",
        "Por favor, insira um nome de usuário."
      );
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert("E-mail obrigatório", "Por favor, insira seu e-mail.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Alert.alert("E-mail inválido", "Por favor, insira um e-mail válido.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await updateProfileMutation.mutateAsync({
        name: formData.name.trim(),
        bio: formData.bio.trim(),
      });

      Alert.alert(
        "Perfil atualizado!",
        "Suas informações foram salvas com sucesso.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível atualizar o perfil. Tente novamente.",
        [{ text: "OK" }]
      );
    }
  };

  const hasChanges = () => {
    return (
      formData.name !== (user?.name || "") ||
      formData.username !== (user?.username || "") ||
      formData.email !== (user?.email || "") ||
      formData.bio !== (user?.bio || "")
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          Editar Perfil
        </Text>
        <TouchableOpacity
          style={[
            styles.headerButton,
            {
              opacity:
                hasChanges() && !updateProfileMutation.isPending ? 1 : 0.5,
            },
          ]}
          onPress={handleSave}
          disabled={!hasChanges() || updateProfileMutation.isPending}
        >
          <Text style={[styles.saveText, { color: theme.colors.primary }]}>
            {updateProfileMutation.isPending ? "Salvando..." : "Salvar"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <Card style={styles.avatarCard}>
          <View style={styles.avatarSection}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
            <TouchableOpacity
              style={[
                styles.changeAvatarButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleAvatarChange}
            >
              <Ionicons name="camera" size={16} color="#FFFFFF" />
              <Text style={styles.changeAvatarText}>Alterar foto</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Form Fields */}
        <Card style={styles.formCard}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            Informações Pessoais
          </Text>

          <View style={styles.fieldContainer}>
            <Text
              style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}
            >
              Nome *
            </Text>
            <Input
              value={formData.name}
              onChangeText={(value) => handleInputChange("name", value)}
              placeholder="Seu nome completo"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text
              style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}
            >
              Nome de usuário *
            </Text>
            <Input
              value={formData.username}
              onChangeText={(value) => handleInputChange("username", value)}
              placeholder="@seuusername"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text
              style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}
            >
              E-mail *
            </Text>
            <Input
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text
              style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}
            >
              Bio
            </Text>
            <Input
              value={formData.bio}
              onChangeText={(value) => handleInputChange("bio", value)}
              placeholder="Conte um pouco sobre você..."
              multiline
              numberOfLines={3}
            />
            <Text
              style={[
                styles.characterCount,
                { color: theme.colors.textSecondary },
              ]}
            >
              {formData.bio.length}/150
            </Text>
          </View>
        </Card>

        {/* Account Settings */}
        <Card style={styles.settingsCard}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            Configurações da Conta
          </Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              // TODO: Navigate to change password screen
              console.log("Navigate to change password");
            }}
          >
            <View style={styles.settingInfo}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.settingText,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Alterar senha
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              // TODO: Navigate to privacy settings
              console.log("Navigate to privacy settings");
            }}
          >
            <View style={styles.settingInfo}>
              <Ionicons
                name="shield-outline"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.settingText,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Privacidade e segurança
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, styles.dangerItem]}
            onPress={() => {
              Alert.alert(
                "Excluir conta",
                "Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.",
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Excluir",
                    style: "destructive",
                    onPress: () => {
                      // TODO: Implement account deletion
                      console.log("Delete account");
                    },
                  },
                ]
              );
            }}
          >
            <View style={styles.settingInfo}>
              <Ionicons
                name="trash-outline"
                size={20}
                color={theme.colors.error}
              />
              <Text style={[styles.settingText, { color: theme.colors.error }]}>
                Excluir conta
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  avatarCard: {
    marginBottom: 16,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  changeAvatarButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeAvatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  formCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    marginBottom: 0,
  },
  bioInput: {
    minHeight: 80,
  },
  characterCount: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 4,
  },
  settingsCard: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  bottomSpacing: {
    height: 32,
  },
});
