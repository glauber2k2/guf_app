import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Telas
import LoginScreen from './src/pages/login';
import TreinosScreen from './src/pages/treinos';
import FeedScreen from './src/pages/feed';
import ContaScreen from './src/pages/conta';
import AddEditRoutineScreen from './src/pages/AddEditRoutineModal';
import WorkoutInProgressScreen from './src/pages/WorkoutInProgessScreen'; // Importe a nova tela de treino

// Definindo os tipos de navegação
// Importe Routine do seu arquivo de tipos, se ainda não estiver globalmente disponível
import { Routine } from './src/types'; // Certifique-se de que o caminho para 'types' está correto

export type RootStackParamList = {
  Login: undefined;
  MainApp: undefined;
  AddEditRoutine: { selectedRoutine?: Routine | null }; // Ajustado para corresponder ao tipo esperado
  WorkoutInProgress: { selectedRoutine: Routine }; // Adicionado o tipo para a nova tela
};

export type BottomTabParamList = {
  Treinos: undefined;
  Feed: undefined;
  Conta: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

function MainAppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'];

          switch (route.name) {
            case 'Treinos':
              iconName = focused ? 'barbell' : 'barbell-outline';
              break;
            case 'Feed':
              iconName = focused ? 'newspaper' : 'newspaper-outline';
              break;
            case 'Conta':
              iconName = focused ? 'person-circle' : 'person-circle-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#541cb6',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: styles.tabBarStyle,
        tabBarLabelStyle: styles.tabBarLabelStyle,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Treinos" component={TreinosScreen} />
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Conta" component={ContaScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MainApp"
            component={MainAppTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddEditRoutine"
            component={AddEditRoutineScreen}
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
          {/* Adicionando a nova tela de treino em andamento ao Stack Navigator */}
          <Stack.Screen
            name="WorkoutInProgress"
            component={WorkoutInProgressScreen}
            options={{ headerShown: false }} // Geralmente, telas de treino em andamento não têm cabeçalho padrão
          />
        </Stack.Navigator>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    height: 60,
    paddingBottom: 5,
  },
  tabBarLabelStyle: {
    fontSize: 12,
    marginBottom: 5,
  },
});
