import React from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useAuth } from "../providers";
import { Loading } from "../components/ui";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import {
  CommentsScreen,
  NotificationsScreen,
  SearchScreen,
  AchievementsScreen,
  CreatePostScreen,
  EditProfileScreen,
  OrderDetailsScreen,
} from "../screens/main";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return <Loading text="Carregando..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <>
              <Stack.Screen name="Main" component={MainNavigator} />
              {/* Modal Screens */}
              <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{
                  headerShown: true,
                  title: "Notificações",
                  presentation: "modal",
                }}
              />
              <Stack.Screen
                name="Search"
                component={SearchScreen}
                options={{
                  headerShown: true,
                  title: "Buscar",
                  presentation: "modal",
                }}
              />
              <Stack.Screen
                name="Achievements"
                component={AchievementsScreen}
                options={{
                  headerShown: true,
                  title: "Conquistas",
                  presentation: "card",
                }}
              />
              <Stack.Screen
                name="Comments"
                component={CommentsScreen}
                options={{
                  headerShown: true,
                  title: "Comentários",
                  presentation: "card",
                }}
              />
              <Stack.Screen
                name="CreatePost"
                component={CreatePostScreen}
                options={{
                  headerShown: true,
                  title: "Criar Post",
                  presentation: "modal",
                }}
              />
              <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{
                  headerShown: true,
                  title: "Editar Perfil",
                  presentation: "card",
                }}
              />
              <Stack.Screen
                name="OrderDetails"
                component={OrderDetailsScreen}
                options={{
                  headerShown: true,
                  title: "Detalhes do Pedido",
                  presentation: "card",
                }}
              />
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};
