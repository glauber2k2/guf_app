import React from "react";
import { StatusBar, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";

// Hook de autenticação e tipos com caminhos corretos
import { useAuth } from "../../contexts/AuthContext";
import { RootStackParamList } from "../../shared/types";

// Telas principais
import MainTabNavigator from "./MainTabNavigator"; // Supondo que esteja na mesma pasta
import WorkoutInProgressScreen from "../../features/workout/screens/WorkoutInProgressScreen";
import AddEditRoutineScreen from "../../features/workout/screens/AddEditRoutineModal";
import GroupsScreen from "../../features/groups/screens/GroupsScreen";

// Telas de autenticação
import LoginScreen from "../../features/auth/screens/login";
import SignUpScreen from "../../features/auth/screens/SignUpScreen";
import { useColorScheme } from "nativewind";

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const theme = useColorScheme().colorScheme;
  const { user, initializing } = useAuth(); // Pega o usuário e o estado de inicialização do contexto

  // Mostra uma tela de carregamento enquanto o Firebase verifica o login
  if (initializing) {
    return (
      <View className="flex-1 justify-center items-center bg-zinc-200 dark:bg-zinc-900">
        <ActivityIndicator
          size="large"
          color={theme === "dark" ? "#FFFFFF" : "#000000"}
        />
      </View>
    );
  }

  return (
    <SafeAreaView className=" flex-1 bg-zinc-200 dark:bg-zinc-900">
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            // Usuário está LOGADO: renderiza as telas principais
            <>
              <Stack.Screen name="MainTab" component={MainTabNavigator} />
              <Stack.Screen
                name="WorkoutInProgress"
                component={WorkoutInProgressScreen}
              />
              <Stack.Screen
                name="AddEditRoutine"
                component={AddEditRoutineScreen}
                options={{ presentation: "modal" }}
              />
              <Stack.Screen name="Groups" component={GroupsScreen} />
            </>
          ) : (
            // Usuário está DESLOGADO: renderiza as telas de autenticação
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </>
          )}
        </Stack.Navigator>
        <StatusBar
          barStyle={theme === "dark" ? "light-content" : "dark-content"}
        />
      </NavigationContainer>
    </SafeAreaView>
  );
}
