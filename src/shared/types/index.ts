// src/types.ts

// 1. ADICIONADO: Importar o tipo helper para navegadores aninhados
import type { NavigatorScreenParams } from '@react-navigation/native';

// Definição do tipo Exercise
export type Exercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
};

// Definição do tipo Routine
export type Routine = {
  id: string;
  name: string;
  exercises: Exercise[];
};

// Tipo para Grupos
export type Group = {
  id: string;
  name: string;
  isPinned: boolean;
};

// ===================================================================
// ALTERAÇÕES PRINCIPAIS ABAIXO
// ===================================================================


// Define os parâmetros esperados para cada rota dentro do seu BottomTabNavigator.
export type BottomTabParamList = {
  // 2. ALTERADO: A tela Treinos agora pode receber um parâmetro opcional 'refresh'.
  Treinos: { refresh?: boolean }; 
  Feed: undefined;
  Conta: undefined;
  Groups: undefined;
};


// Define os parâmetros esperados para cada rota no seu StackNavigator principal.
export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  
  // 3. ALTERADO: A rota MainTab agora está corretamente tipada para aceitar
  // parâmetros de navegação para as telas definidas em BottomTabParamList.
  MainTab: NavigatorScreenParams<BottomTabParamList>;
  
  AddEditRoutine: { selectedRoutine: Routine | null };
  WorkoutInProgress: { selectedRoutine?: Routine };
  
  // 4. LIMPEZA: As rotas 'Treinos', 'Feed' e 'Conta' foram removidas daqui.
  // Elas não são filhas diretas do StackNavigator, e sim do TabNavigator,
  // então não devem ser listadas aqui. Isso torna os tipos mais precisos.
  // Mantivemos 'Groups' pois você a declarou como uma tela no StackNavigator também.
  Groups: undefined;
};

