import { StatusBar, Platform } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import MainTab from "./MainTabNavigator";
import { RootStackParamList } from "../../shared/types";
import WorkoutInProgressScreen from "../../features/workout/screens/WorkoutInProgessScreen";
import AddEditRoutineScreen from "../../features/workout/screens/AddEditRoutineModal";
import GroupsScreen from "../../features/groups/screens/GroupsScreen";
import Login from "../../features/auth/screens/login";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const theme = useColorScheme();

  return (
    <SafeAreaView className="flex-1 bg-zinc-200 dark:bg-zinc-900">
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="MainTab"
            component={MainTab}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="WorkoutInProgress"
            component={WorkoutInProgressScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="AddEditRoutine"
            component={AddEditRoutineScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />

          <Stack.Screen
            name="Groups"
            component={GroupsScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>

        <StatusBar
          barStyle={theme === "dark" ? "light-content" : "dark-content"}
        />
      </NavigationContainer>
    </SafeAreaView>
  );
}
