import React from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { useTheme } from "../../providers";

const { width } = Dimensions.get("window");

interface SkeletonProps {
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height,
  borderRadius = 4,
  style,
}) => {
  const { theme } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Restaurant Card Skeleton
export const RestaurantCardSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.restaurantCard, { backgroundColor: theme.colors.surface }]}
    >
      <Skeleton height={120} borderRadius={8} style={styles.restaurantImage} />
      <View style={styles.restaurantInfo}>
        <Skeleton height={18} width="70%" style={styles.restaurantName} />
        <Skeleton height={14} width="50%" style={styles.restaurantCuisine} />
        <View style={styles.restaurantMeta}>
          <Skeleton height={12} width={60} />
          <Skeleton height={12} width={40} style={{ marginLeft: 16 }} />
        </View>
      </View>
    </View>
  );
};

// Feed Post Skeleton
export const PostCardSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.postCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.postHeader}>
        <Skeleton height={40} width={40} borderRadius={20} />
        <View style={styles.postHeaderText}>
          <Skeleton height={16} width="60%" />
          <Skeleton height={12} width="40%" style={{ marginTop: 4 }} />
        </View>
      </View>
      <Skeleton height={300} style={styles.postImage} />
      <View style={styles.postFooter}>
        <Skeleton height={14} width="80%" />
        <Skeleton height={12} width="30%" style={{ marginTop: 8 }} />
      </View>
    </View>
  );
};

// Profile Screen Skeleton
export const ProfileSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.profileContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View
        style={[
          styles.profileHeader,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <View style={styles.profileInfo}>
          <Skeleton height={80} width={80} borderRadius={40} />
          <View style={styles.profileText}>
            <Skeleton height={20} width="60%" />
            <Skeleton height={16} width="40%" style={{ marginTop: 4 }} />
            <Skeleton height={14} width="80%" style={{ marginTop: 8 }} />
          </View>
        </View>
        <View style={styles.profileStats}>
          <View style={styles.statItem}>
            <Skeleton height={20} width={30} />
            <Skeleton height={12} width={40} style={{ marginTop: 4 }} />
          </View>
          <View style={styles.statItem}>
            <Skeleton height={20} width={30} />
            <Skeleton height={12} width={60} style={{ marginTop: 4 }} />
          </View>
          <View style={styles.statItem}>
            <Skeleton height={20} width={30} />
            <Skeleton height={12} width={50} style={{ marginTop: 4 }} />
          </View>
        </View>
        <View style={styles.profileActions}>
          <Skeleton height={36} width="70%" borderRadius={18} />
          <Skeleton
            height={36}
            width={36}
            borderRadius={18}
            style={{ marginLeft: 8 }}
          />
        </View>
      </View>
      <View style={styles.profileContent}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Skeleton
            key={item}
            height={(width - 48) / 3}
            width={(width - 48) / 3}
            style={styles.profilePostItem}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Restaurant Card Skeleton
  restaurantCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantImage: {
    marginBottom: 12,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    marginBottom: 4,
  },
  restaurantCuisine: {
    marginBottom: 8,
  },
  restaurantMeta: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Post Card Skeleton
  postCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  postHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  postImage: {
    marginBottom: 16,
  },
  postFooter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  // Profile Skeleton
  profileContainer: {
    flex: 1,
  },
  profileHeader: {
    padding: 16,
  },
  profileInfo: {
    flexDirection: "row",
    marginBottom: 16,
  },
  profileText: {
    flex: 1,
    marginLeft: 16,
  },
  profileStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  profileActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
  },
  profilePostItem: {
    marginRight: 8,
    marginBottom: 8,
  },
});
