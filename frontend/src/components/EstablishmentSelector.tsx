import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LIGHT_THEME } from "../constants/theme";
import { Establishment, EstablishmentType } from "../types";

interface EstablishmentSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (establishment: Establishment) => void;
  establishments: Establishment[];
  selectedType: EstablishmentType | "ALL";
  onTypeChange: (type: EstablishmentType | "ALL") => void;
}

export const EstablishmentSelector: React.FC<EstablishmentSelectorProps> = ({
  visible,
  onClose,
  onSelect,
  establishments,
  selectedType,
  onTypeChange,
}) => {
  const typeButtons = [
    { key: "ALL" as const, label: "Todos", icon: "grid-outline" },
    {
      key: "RESTAURANT" as const,
      label: "Restaurantes",
      icon: "restaurant-outline",
    },
    { key: "BAR" as const, label: "Bares", icon: "wine-outline" },
  ];

  const filteredEstablishments = establishments.filter(
    (est) => selectedType === "ALL" || est.type === selectedType
  );

  const renderTypeButton = ({ item }: { item: (typeof typeButtons)[0] }) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        selectedType === item.key && styles.activeTypeButton,
      ]}
      onPress={() => onTypeChange(item.key)}
    >
      <Ionicons
        name={item.icon as any}
        size={20}
        color={
          selectedType === item.key
            ? LIGHT_THEME.surface
            : LIGHT_THEME.textSecondary
        }
      />
      <Text
        style={[
          styles.typeButtonText,
          selectedType === item.key && styles.activeTypeButtonText,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderEstablishment = ({ item }: { item: Establishment }) => (
    <TouchableOpacity
      style={styles.establishmentItem}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
    >
      <Image
        source={{
          uri: item.imageUrl || "https://via.placeholder.com/60x60?text=🏪",
        }}
        style={styles.establishmentImage}
      />
      <View style={styles.establishmentInfo}>
        <View style={styles.establishmentHeader}>
          <Text style={styles.establishmentName}>{item.name}</Text>
          <View style={styles.establishmentType}>
            <Ionicons
              name={item.type === "RESTAURANT" ? "restaurant" : "wine"}
              size={14}
              color={LIGHT_THEME.primary}
            />
            <Text style={styles.establishmentTypeText}>
              {item.type === "RESTAURANT" ? "Restaurante" : "Bar"}
            </Text>
          </View>
        </View>
        <Text style={styles.establishmentAddress} numberOfLines={1}>
          {item.address}, {item.city}
        </Text>
        {item.category && (
          <Text style={styles.establishmentCategory}>{item.category}</Text>
        )}
        <View style={styles.establishmentMeta}>
          <View style={styles.rating}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>
              {item.rating?.toFixed(1) || "0.0"}
            </Text>
          </View>
          <Text style={styles.priceRange}>
            {"$".repeat(item.priceRange || 1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={LIGHT_THEME.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Escolher Local</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Type Filter */}
        <View style={styles.typeFilterContainer}>
          <FlatList
            data={typeButtons}
            renderItem={renderTypeButton}
            keyExtractor={(item) => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeFilterContent}
          />
        </View>

        {/* Establishments List */}
        <FlatList
          data={filteredEstablishments}
          renderItem={renderEstablishment}
          keyExtractor={(item) => item.id}
          style={styles.establishmentsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Ionicons
                name={
                  selectedType === "RESTAURANT"
                    ? "restaurant-outline"
                    : selectedType === "BAR"
                    ? "wine-outline"
                    : "grid-outline"
                }
                size={48}
                color={LIGHT_THEME.textSecondary}
              />
              <Text style={styles.emptyText}>
                Nenhum{" "}
                {selectedType === "RESTAURANT"
                  ? "restaurante"
                  : selectedType === "BAR"
                  ? "bar"
                  : "estabelecimento"}{" "}
                encontrado
              </Text>
            </View>
          )}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_THEME.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.surfaceVariant,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: LIGHT_THEME.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  typeFilterContainer: {
    backgroundColor: LIGHT_THEME.surface,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.surfaceVariant,
  },
  typeFilterContent: {
    paddingHorizontal: 16,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: LIGHT_THEME.surfaceVariant,
  },
  activeTypeButton: {
    backgroundColor: LIGHT_THEME.primary,
  },
  typeButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
    color: LIGHT_THEME.textSecondary,
  },
  activeTypeButtonText: {
    color: LIGHT_THEME.surface,
  },
  establishmentsList: {
    flex: 1,
  },
  establishmentItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT_THEME.surfaceVariant,
  },
  establishmentImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  establishmentInfo: {
    flex: 1,
  },
  establishmentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  establishmentName: {
    fontSize: 16,
    fontWeight: "600",
    color: LIGHT_THEME.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  establishmentType: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LIGHT_THEME.primaryLight + "20",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  establishmentTypeText: {
    fontSize: 11,
    fontWeight: "500",
    color: LIGHT_THEME.primary,
    marginLeft: 2,
  },
  establishmentAddress: {
    fontSize: 14,
    color: LIGHT_THEME.textSecondary,
    marginBottom: 2,
  },
  establishmentCategory: {
    fontSize: 12,
    color: LIGHT_THEME.textSecondary,
    marginBottom: 4,
  },
  establishmentMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: LIGHT_THEME.textSecondary,
    marginLeft: 2,
  },
  priceRange: {
    fontSize: 14,
    fontWeight: "600",
    color: LIGHT_THEME.success,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: LIGHT_THEME.textSecondary,
    marginTop: 16,
    textAlign: "center",
  },
});
