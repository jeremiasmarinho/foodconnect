import React from "react";
import { View, Text, TouchableOpacity, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../providers";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  variant?: "default" | "minimal" | "illustration";
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
  variant = "default",
}) => {
  const { theme } = useTheme();

  const getIconSize = () => {
    switch (variant) {
      case "minimal":
        return 48;
      case "illustration":
        return 80;
      default:
        return 64;
    }
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: theme.spacing.xl,
    };

    switch (variant) {
      case "minimal":
        return {
          ...baseStyle,
          paddingVertical: theme.spacing.lg,
        };
      case "illustration":
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: theme.layout.borderRadius.xl,
          margin: theme.spacing.lg,
          paddingVertical: theme.spacing.xxxxl,
        };
      default:
        return {
          ...baseStyle,
          paddingVertical: theme.spacing.xxxl,
        };
    }
  };

  return (
    <View style={[getContainerStyle(), style]}>
      {/* Icon */}
      <View
        style={{
          width: getIconSize() + 24,
          height: getIconSize() + 24,
          borderRadius: (getIconSize() + 24) / 2,
          backgroundColor:
            variant === "illustration"
              ? theme.colors.primary
              : `${theme.colors.primary}15`,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: theme.spacing.lg,
        }}
      >
        <Ionicons
          name={icon}
          size={getIconSize()}
          color={
            variant === "illustration"
              ? theme.colors.textOnPrimary
              : theme.colors.primary
          }
        />
      </View>

      {/* Title */}
      <Text
        style={{
          fontSize:
            variant === "minimal"
              ? theme.typography.fontSize.lg
              : theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.textPrimary,
          textAlign: "center",
          marginBottom: theme.spacing.sm,
        }}
      >
        {title}
      </Text>

      {/* Description */}
      <Text
        style={{
          fontSize: theme.typography.fontSize.md,
          color: theme.colors.textSecondary,
          textAlign: "center",
          lineHeight:
            theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
          marginBottom: actionLabel ? theme.spacing.xl : 0,
          maxWidth: 280,
        }}
      >
        {description}
      </Text>

      {/* Action Button */}
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          style={{
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.md,
            borderRadius: theme.layout.borderRadius.lg,
            ...theme.layout.shadow.small,
          }}
          activeOpacity={0.8}
        >
          <Text
            style={{
              color: theme.colors.textOnPrimary,
              fontSize: theme.typography.fontSize.md,
              fontWeight: theme.typography.fontWeight.semibold,
            }}
          >
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Predefined empty states for common scenarios
export const FeedEmptyState: React.FC<{ onCreatePost?: () => void }> = ({
  onCreatePost,
}) => (
  <EmptyState
    icon="restaurant-outline"
    title="Nenhum post ainda"
    description="Seja o primeiro a compartilhar uma experiência gastronômica incrível!"
    actionLabel="Criar Post"
    onAction={onCreatePost}
    variant="illustration"
  />
);

export const SearchEmptyState: React.FC<{
  query?: string;
  onClearSearch?: () => void;
}> = ({ query, onClearSearch }) => (
  <EmptyState
    icon="search-outline"
    title={query ? "Nenhum resultado encontrado" : "Comece a pesquisar"}
    description={
      query
        ? `Não encontramos resultados para "${query}". Tente outros termos.`
        : "Digite o nome de um restaurante, prato ou localização para começar."
    }
    actionLabel={query ? "Limpar busca" : undefined}
    onAction={onClearSearch}
  />
);

export const RestaurantsEmptyState: React.FC<{ onExplore?: () => void }> = ({
  onExplore,
}) => (
  <EmptyState
    icon="storefront-outline"
    title="Nenhum restaurante por aqui"
    description="Que tal explorar outras regiões ou ajustar seus filtros?"
    actionLabel="Explorar"
    onAction={onExplore}
  />
);

export const FavoritesEmptyState: React.FC<{ onDiscover?: () => void }> = ({
  onDiscover,
}) => (
  <EmptyState
    icon="heart-outline"
    title="Nenhum favorito ainda"
    description="Explore restaurantes incríveis e adicione seus favoritos aqui!"
    actionLabel="Descobrir Restaurantes"
    onAction={onDiscover}
    variant="illustration"
  />
);

export const NotificationsEmptyState: React.FC = () => (
  <EmptyState
    icon="notifications-outline"
    title="Tudo em dia!"
    description="Você não tem notificações pendentes no momento."
    variant="minimal"
  />
);

export const OrdersEmptyState: React.FC<{ onOrderNow?: () => void }> = ({
  onOrderNow,
}) => (
  <EmptyState
    icon="receipt-outline"
    title="Nenhum pedido ainda"
    description="Quando você fizer seu primeiro pedido, ele aparecerá aqui."
    actionLabel="Fazer Pedido"
    onAction={onOrderNow}
  />
);
