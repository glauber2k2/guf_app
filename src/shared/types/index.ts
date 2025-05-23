// src/types.ts

// Definição do tipo Exercise
export type Exercise = {
  id: string;
  name: string;
  sets: string; // Pode ser number, mas string para input flexível
  reps: string; // Pode ser number ou string (ex: '8-12', 'até a falha')
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

// Define os parâmetros esperados para cada rota no seu StackNavigator principal.
// Qualquer tela que possa ser navegada diretamente (não apenas via tabs) deve estar aqui.
export type RootStackParamList = {
  Login: undefined; // Tela de login, sem parâmetros
  MainTab: undefined; // A rota que encapsula o BottomTabNavigator
  AddEditRoutine: { selectedRoutine: Routine | null }; // Tela de adicionar/editar rotina com parâmetro opcional
  WorkoutInProgress: { selectedRoutine?: Routine }; // Tela de treino em andamento com a rotina selecionada
  // As rotas abaixo são acessíveis via tabs, mas também podem ser navegadas diretamente pelo Stack se necessário.
  // Se elas forem *apenas* acessadas via tabs, você pode removê-las daqui para manter o RootStackParamList mais limpo.
  Treinos: undefined;
  Feed: undefined;
  Conta: undefined;
  Groups: undefined;
};

// Define os parâmetros esperados para cada rota dentro do seu BottomTabNavigator.
// Apenas as rotas que aparecem como abas na parte inferior do aplicativo devem estar aqui.
export type BottomTabParamList = {
  Treinos: undefined; // Aba de Treinos
  Feed: undefined;    // Aba de Feed
  Conta: undefined;   // Aba de Conta
  Groups: undefined;  // Aba de Grupos
};

// Você pode adicionar outros tipos globais aqui conforme necessário para o seu aplicativo.
