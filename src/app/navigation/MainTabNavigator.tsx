import { StyleSheet, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { BottomTabParamList } from "../../shared/types";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TreinosScreen from "../../features/workout/screens/treinos";
import FeedScreen from "../../features/feed/screens/feed";
import GroupsScreen from "../../features/groups/screens/GroupsScreen";
import ContaScreen from "../../features/auth/screens/conta";

import { useColorScheme } from "react-native";

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function MainTab() {
  const theme = useColorScheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>["name"];

          switch (route.name) {
            case "Treinos":
              iconName = focused ? "barbell" : "barbell-outline";
              break;
            case "Feed":
              iconName = focused ? "newspaper" : "newspaper-outline";
              break;
            case "Conta":
              iconName = focused ? "person-circle" : "person-circle-outline";
              break;
            case "Groups":
              iconName = focused ? "people" : "people-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }

          return (
            <View
              style={[
                styles.tabIconCircle,
                focused
                  ? styles.tabIconCircleActive
                  : styles.tabIconCircleInactive,
              ]}
            >
              <Ionicons
                name={iconName}
                size={size * 1.2}
                color={focused ? "white" : color}
              />
            </View>
          );
        },
        tabBarActiveTintColor: "#541cb6",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: [
          styles.tabBarStyle,
          theme === "dark"
            ? { backgroundColor: "#09090b" }
            : { backgroundColor: "#d4d4d8" },
        ],
        tabBarLabelStyle: styles.tabBarLabelStyle,
        tabBarShowLabel: false,
        headerShown: false,
        tabBarLabelPosition: "beside-icon",
      })}
    >
      <Tab.Screen name="Treinos" component={TreinosScreen} />
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Conta" component={ContaScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    borderTopWidth: 0,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    height: 70,
    paddingBottom: 5,
    borderRadius: 35,
    marginHorizontal: 20,
    position: "absolute",
    bottom: 15,
  },
  tabBarLabelStyle: {
    fontSize: 12,
    marginBottom: 5,
  },
  tabIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  tabIconCircleActive: {
    backgroundColor: "#541cb6",
  },
  tabIconCircleInactive: {
    backgroundColor: "transparent",
  },
});
