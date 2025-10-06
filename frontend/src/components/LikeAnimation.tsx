import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LIGHT_THEME } from "../constants/theme";

interface LikeAnimationProps {
  isVisible: boolean;
  onAnimationEnd?: () => void;
}

export const LikeAnimation: React.FC<LikeAnimationProps> = ({
  isVisible,
  onAnimationEnd,
}) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Start animation
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Reset values
        scaleValue.setValue(0);
        opacityValue.setValue(0);
        onAnimationEnd?.();
      });
    }
  }, [isVisible, scaleValue, opacityValue, onAnimationEnd]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleValue }],
          opacity: opacityValue,
        },
      ]}
      pointerEvents="none"
    >
      <Ionicons name="heart" size={80} color="white" />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -40,
    marginLeft: -40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
});
