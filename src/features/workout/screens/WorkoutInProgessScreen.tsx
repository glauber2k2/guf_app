import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  Image, // Importar Image para a foto do exercício
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tipos necessários definidos localmente para correção do erro
// Em um projeto real, estes viriam de um arquivo como '../types'
interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  type: string; // Adicionado para completar a interface, se não existir
}

export interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
}

// Nova interface para a estrutura de dados do exercício no treino em andamento
interface WorkoutExercise {
  id: string;
  name: string;
  imageUrl: string;
  originalSets: string;
  originalReps: string;
  notes: string;
  setsData: {
    setNumber: number;
    previousReps: string;
    kg: string;
    reps: string;
  }[];
}

// Define o tipo para o estado de treino que pode ser retomado
interface ResumedWorkoutState {
  routine: Routine;
  workoutExercises: WorkoutExercise[];
  elapsedTime: number;
  timerRunning: boolean;
}

// Define o RootStackParamList incluindo a propriedade 'resumedWorkoutState' como opcional
export type RootStackParamList = {
  WorkoutInProgress: {
    selectedRoutine?: Routine;
    resumedWorkoutState?: ResumedWorkoutState;
  };
  // Adicione outras rotas aqui conforme necessário para o seu aplicativo
};

// Define o tipo para as props da rota desta tela
type WorkoutInProgressScreenRouteProp = RouteProp<
  RootStackParamList,
  "WorkoutInProgress"
>;

// Chave para armazenar o treino em andamento no AsyncStorage
const STORAGE_KEY_CURRENT_WORKOUT = "@currentWorkout";

const WorkoutInProgressScreen: React.FC = () => {
  const route = useRoute<WorkoutInProgressScreenRouteProp>();
  const navigation = useNavigation();
  const { selectedRoutine, resumedWorkoutState } = route.params;

  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    []
  );
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Efeito para inicializar o estado do treino (novo ou retomado)
  useEffect(() => {
    if (resumedWorkoutState) {
      // Se estamos retomando um treino, carregamos o estado salvo
      setWorkoutExercises(resumedWorkoutState.workoutExercises);
      setElapsedTime(resumedWorkoutState.elapsedTime);
      setTimerRunning(resumedWorkoutState.timerRunning);
    } else if (selectedRoutine) {
      // Se é um novo treino, inicializamos com os exercícios da rotina
      const initialWorkoutExercises: WorkoutExercise[] =
        selectedRoutine.exercises.map((ex) => {
          const numSets = parseInt(ex.sets || "0", 10);
          const setsData = Array.from({ length: numSets }, (_, i) => ({
            setNumber: i + 1,
            previousReps: ex.reps, // Usa as repetições da rotina como "anterior"
            kg: "",
            reps: "",
          }));
          return {
            id: ex.id,
            name: ex.name,
            imageUrl: `https://placehold.co/100x100/E0E0E0/333333?text=${ex.name
              .substring(0, 2)
              .toUpperCase()}`, // Placeholder de imagem
            originalSets: ex.sets,
            originalReps: ex.reps,
            notes: "", // Inicializa notas vazias
            setsData: setsData,
          };
        });
      setWorkoutExercises(initialWorkoutExercises);
      setElapsedTime(0);
      setTimerRunning(true); // Inicia o cronômetro automaticamente para novos treinos
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [selectedRoutine, resumedWorkoutState]);

  // Lógica do cronômetro
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .map((unit) => String(unit).padStart(2, "0"))
      .join(":");
  };

  const handleStartStopTimer = () => {
    setTimerRunning((prev) => !prev);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setElapsedTime(0);
  };

  // Nova função para atualizar os dados de uma série específica
  const handleUpdateSetData = (
    exerciseId: string,
    setIndex: number, // Índice da série no array setsData
    field: "kg" | "reps",
    value: string
  ) => {
    setWorkoutExercises((prevExercises) =>
      prevExercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              setsData: ex.setsData.map((set, idx) =>
                idx === setIndex ? { ...set, [field]: value } : set
              ),
            }
          : ex
      )
    );
  };

  // Função para atualizar as anotações do exercício
  const handleUpdateNotes = (exerciseId: string, text: string) => {
    setWorkoutExercises((prevExercises) =>
      prevExercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, notes: text } : ex
      )
    );
  };

  /**
   * Salva o estado atual do treino no AsyncStorage.
   * @param isFinishing Indica se o treino está sendo finalizado (para limpar o estado salvo).
   */
  const saveWorkoutState = async (isFinishing: boolean = false) => {
    try {
      if (isFinishing) {
        await AsyncStorage.removeItem(STORAGE_KEY_CURRENT_WORKOUT);
      } else {
        const stateToSave = {
          routine: selectedRoutine,
          workoutExercises: workoutExercises,
          elapsedTime: elapsedTime,
          timerRunning: timerRunning,
        };
        await AsyncStorage.setItem(
          STORAGE_KEY_CURRENT_WORKOUT,
          JSON.stringify(stateToSave)
        );
      }
    } catch (e) {
      console.error("Erro ao salvar estado do treino:", e);
    }
  };

  const handleFinishWorkout = () => {
    Alert.alert("Concluir Treino", "Deseja realmente concluir este treino?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Concluir",
        onPress: async () => {
          await saveWorkoutState(true); // Salva e limpa o estado do treino
          Alert.alert("Treino Concluído", "Seu treino foi registrado!");
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={async () => {
            await saveWorkoutState(); // Salva o estado ao voltar
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedRoutine?.name || "Treino"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
        <View style={styles.timerControls}>
          <TouchableOpacity
            style={styles.timerButton}
            onPress={handleStartStopTimer}
          >
            <Ionicons
              name={timerRunning ? "pause" : "play"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.timerButton}
            onPress={handleResetTimer}
          >
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={workoutExercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
            {/* Cabeçalho do Card do Exercício */}
            <View style={styles.exerciseCardHeader}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.exerciseImage}
              />
              <Text style={styles.exerciseCardTitle}>{item.name}</Text>
              <TouchableOpacity style={styles.moreOptionsButton}>
                <Ionicons name="ellipsis-horizontal" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            {/* Campo de Anotações/Descrição */}
            <TextInput
              style={styles.notesInput}
              placeholder="Adicionar anotações ou descrição..."
              placeholderTextColor="#999"
              multiline
              value={item.notes}
              onChangeText={(text) => handleUpdateNotes(item.id, text)}
            />

            <View style={[styles.setRow, { backgroundColor: "#00000010" }]}>
              <Text style={styles.setNumber}>N</Text>
              <Text style={styles.setFieldInput}>Anterior</Text>
              <Text style={styles.setFieldInput}>KG</Text>
              <Text style={styles.setFieldInput}>Reps</Text>
            </View>

            {/* Seções de Séries */}
            {item.setsData.map((set, index) => (
              <View
                key={index}
                style={[
                  styles.setRow,
                  index % 2 === 1 ? { backgroundColor: "#00000010" } : "",
                ]}
              >
                <Text style={styles.setNumber}>{set.setNumber}.</Text>
                <TextInput
                  style={styles.setFieldInput}
                  placeholder={`Anterior: ${set.previousReps}`}
                  placeholderTextColor="#999"
                  value={set.previousReps} // Valor do treino anterior
                  editable={false} // Não editável, apenas para visualização
                />
                <TextInput
                  style={styles.setFieldInput}
                  placeholder="KG"
                  placeholderTextColor="#999"
                  value={set.kg}
                  onChangeText={(text) =>
                    handleUpdateSetData(item.id, index, "kg", text)
                  }
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.setFieldInput}
                  placeholder="Reps"
                  placeholderTextColor="#999"
                  value={set.reps}
                  onChangeText={(text) =>
                    handleUpdateSetData(item.id, index, "reps", text)
                  }
                  keyboardType="numeric"
                />
              </View>
            ))}
          </View>
        )}
        contentContainerStyle={styles.exerciseListContent}
      />

      <TouchableOpacity
        style={styles.finishButton}
        onPress={handleFinishWorkout}
      >
        <Text style={styles.finishButtonText}>Concluir Treino</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  timerContainer: {
    backgroundColor: "#6200ee",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  timerText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  timerControls: {
    flexDirection: "row",
    gap: 16,
  },
  timerButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
  },
  exerciseListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  // Novos estilos para o card de exercício
  exerciseCard: {
    borderRadius: 12,
    marginBottom: 16,
  },
  exerciseCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  exerciseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#e0e0e0", // Cor de fundo para o placeholder
  },
  exerciseCardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1, // Permite que o título ocupe o espaço restante
  },
  moreOptionsButton: {
    padding: 5,
  },
  notesInput: {
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#333",
    marginBottom: 16,
    minHeight: 60, // Altura mínima para anotações
    textAlignVertical: "top", // Alinha o texto no topo em Android
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: "#00000005",
  },
  setNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    width: 30, // Largura fixa para o número da série
  },
  setFieldInput: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#333",
    flex: 1,
    marginHorizontal: 5,
    textAlign: "center",
  },
  finishButton: {
    backgroundColor: "#03dac6",
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  finishButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default WorkoutInProgressScreen;
