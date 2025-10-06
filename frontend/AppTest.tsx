import React from "react";
import { View, Text } from "react-native";
import { MinimalStories } from "./src/components/Stories";

export default function AppTest() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Stories Test</Text>
      <MinimalStories />
    </View>
  );
}
