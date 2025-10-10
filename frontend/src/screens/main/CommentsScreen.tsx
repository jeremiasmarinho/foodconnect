import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { CommentsList } from "../../components/Comments";

type CommentsScreenRouteProp = RouteProp<
  { Comments: { postId: string; postTitle?: string } },
  "Comments"
>;

export function CommentsScreen() {
  const route = useRoute<CommentsScreenRouteProp>();
  const { postId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <CommentsList postId={postId} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
});
