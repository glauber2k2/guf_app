// App.tsx
import React from "react";
import { StatusBar, StyleSheet, View, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Importa os tipos de navegação definidos em src/types.ts
// AGORA IMPORTANDO RootStackParamList e BottomTabParamList
import { RootStackParamList, BottomTabParamList, Routine } from "./src/types";

// Telas
import LoginScreen from "./src/pages/login";
import TreinosScreen from "./src/pages/treinos";
import FeedScreen from "./src/pages/feed";
import ContaScreen from "./src/pages/conta";
import AddEditRoutineScreen from "./src/pages/AddEditRoutineModal";
import WorkoutInProgressScreen from "./src/pages/WorkoutInProgessScreen";
import GroupsScreen from "./src/pages/GroupsScreen";

// Cria os navegadores com seus respectivos tipos
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

/**
 * Componente que define as abas inferiores do aplicativo.
 * As rotas definidas aqui correspondem às abas visíveis.
 */
function MainAppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>["name"];

          // Define o ícone com base na rota atual e no estado de foco
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
              iconName = "ellipse-outline"; // Ícone padrão para rotas não mapeadas
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
        tabBarActiveTintColor: "#541cb6", // Cor principal para o ícone ativo
        tabBarInactiveTintColor: "gray", // Cor para o ícone inativo
        tabBarStyle: styles.tabBarStyle, // Estilo da barra de navegação
        tabBarLabelStyle: styles.tabBarLabelStyle, // Estilo do texto do label (se visível)
        tabBarShowLabel: false, // Oculta os títulos das abas para usar apenas ícones
        headerShown: false, // Oculta o cabeçalho padrão das telas de aba
        tabBarLabelPosition: "beside-icon", // Posição do label em relação ao ícone (não visível com tabBarShowLabel: false)
      })}
    >
      {/* Definição das telas que serão exibidas como abas */}
      <Tab.Screen name="Treinos" component={TreinosScreen} />
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Groups" component={GroupsScreen} />
      <Tab.Screen name="Conta" component={ContaScreen} />
    </Tab.Navigator>
  );
}

/**
 * Componente principal da aplicação que gerencia a navegação em pilha (Stack Navigator).
 * Telas como Login, e modais que abrem sobre o conteúdo principal, são definidas aqui.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          {/* Tela de Login, sem cabeçalho */}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          {/* A tela principal do aplicativo (com as abas), sem cabeçalho */}
          <Stack.Screen
            name="MainApp"
            component={MainAppTabs}
            options={{ headerShown: false }}
          />
          {/* Tela de Treino em Andamento, sem cabeçalho padrão */}
          <Stack.Screen
            name="WorkoutInProgress"
            component={WorkoutInProgressScreen}
            options={{ headerShown: false }}
          />
          {/* Tela de Adicionar/Editar Rotina, apresentada como um modal */}
          <Stack.Screen
            name="AddEditRoutine"
            component={AddEditRoutineScreen}
            options={{
              headerShown: false,
              presentation: "modal", // Estilo de apresentação como modal
            }}
          />

          {/* A rota 'Groups' também está no Stack Navigator para permitir navegação direta,
              caso haja alguma funcionalidade que navegue para 'Groups' fora das abas.
              Se 'Groups' for *apenas* acessível via Bottom Tab, esta linha pode ser removida.
          */}
          <Stack.Screen
            name="Groups"
            component={GroupsScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
        {/* Configuração da barra de status do sistema */}
        <StatusBar
          backgroundColor="#fff"
          barStyle={Platform.OS === "android" ? "dark-content" : "default"} // Ajuste para iOS
        />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

// Estilos para os componentes de navegação e abas
const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: "#e9ebee",
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
    backgroundColor: "#541cb6", // Cor do círculo quando a aba está ativa
  },
  tabIconCircleInactive: {
    backgroundColor: "transparent", // Fundo transparente quando a aba está inativa
  },
});
