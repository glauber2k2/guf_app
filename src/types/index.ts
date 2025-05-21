export type Exercise = {
  id: string;
  name: string;
  sets: string; // Pode ser number, mas string para input flexível
  reps: string; // Pode ser number ou string (ex: '8-12', 'até a falha')
};

export type Routine = {
  id: string;
  name: string;
  exercises: Exercise[];
};

// Define os parâmetros esperados para cada rota no seu StackNavigator
export type RootStackParamList = {
  Login: undefined; // A tela Login não espera parâmetros
  MainApp: undefined; // A tela MainApp (que contém as tabs) não espera parâmetros
  Treinos: undefined; // A tela Treinos (dentro das tabs) não espera parâmetros
  AddEditRoutine: { selectedRoutine: Routine | null }; // <-- Adicionado/Corrigido aqui
  Feed: undefined; // Assumindo que Feed é uma rota da tab
  Conta: undefined; // Assumindo que Conta é uma rota da tab
  // Adicione outras rotas aqui conforme necessário
  WorkoutInProgress: { selectedRoutine: Routine }
};

