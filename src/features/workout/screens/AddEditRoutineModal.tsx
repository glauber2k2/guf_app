// screens/AddEditRoutineScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  RouteProp,
  NavigationProp,
} from "@react-navigation/native";
import { SwipeListView } from "react-native-swipe-list-view";
// 1. REMOVIDO: import { v4 as uuidv4 } from "uuid";

import RoutineService from "../../../services/RoutineService";
import { Exercise, RootStackParamList, Routine } from "../../../shared/types"; // Ajuste o tipo se necessário
import ExerciseSelectionModal from "../components/ExerciseSelectionModal";
import { MOCK_AVAILABLE_EXERCISES } from "../../../shared/constants";

type AddEditRoutineScreenRouteProp = RouteProp<
  RootStackParamList,
  "AddEditRoutine"
>;

type AddEditRoutineNavigationProp = NavigationProp<RootStackParamList>;

const AddEditRoutineScreen: React.FC = () => {
  const navigation = useNavigation<AddEditRoutineNavigationProp>();
  const route = useRoute<AddEditRoutineScreenRouteProp>();
  const { selectedRoutine } = route.params;

  const [routineName, setRoutineName] = useState("");
  const [currentRoutineExercises, setCurrentRoutineExercises] = useState<
    Exercise[]
  >([]);

  // ... (nenhuma outra mudança de estado é necessária)
  const [exerciseSelectionModalVisible, setExerciseSelectionModalVisible] =
    useState(false);
  const [selectedExercisesForModal, setSelectedExercisesForModal] = useState<
    Exercise[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (selectedRoutine) {
      setRoutineName(selectedRoutine.name);
      setCurrentRoutineExercises([...selectedRoutine.exercises]);
      setSelectedExercisesForModal([...selectedRoutine.exercises]);
    } else {
      setRoutineName("");
      setCurrentRoutineExercises([]);
      setSelectedExercisesForModal([]);
    }
  }, [selectedRoutine]);

  const handleSaveRoutine = async () => {
    // ... (validações permanecem as mesmas)
    if (routineName.trim() === "") {
      Alert.alert("Erro", "Por favor, insira um nome para a rotina.");
      return;
    }
    const incompleteExercises = currentRoutineExercises.some(
      (ex) => !ex.sets || !ex.reps
    );
    if (incompleteExercises) {
      Alert.alert(
        "Atenção",
        "Por favor, preencha as séries e repetições para todos os exercícios."
      );
      return;
    }

    try {
      if (selectedRoutine) {
        // MODO EDIÇÃO (Nenhuma mudança aqui)
        const updatedRoutine = {
          id: selectedRoutine.id,
          name: routineName.trim(),
          exercises: JSON.stringify(currentRoutineExercises),
        };
        await RoutineService.updateRoutine(updatedRoutine as any); // Usamos 'as any' para compatibilidade de tipo
      } else {
        // MODO CRIAÇÃO (AQUI ESTÁ A MUDANÇA)
        // 2. Não geramos mais um ID. Apenas montamos o objeto com os dados.
        const newRoutineData = {
          name: routineName.trim(),
          exercises: JSON.stringify(currentRoutineExercises),
        };
        // O serviço agora sabe como lidar com isso
        await RoutineService.addRoutine(newRoutineData);
      }

      Alert.alert("Sucesso", `Rotina "${routineName.trim()}" salva!`);
      navigation.navigate("MainTab", {
        screen: "Treinos",
        params: { refresh: true },
      });
    } catch (e) {
      console.error("Erro ao salvar rotina no SQLite:", e);
      Alert.alert("Erro", "Não foi possível salvar a rotina.");
    }
  };

  // NENHUMA OUTRA MUDANÇA É NECESSÁRIA NO RESTO DO ARQUIVO
  // O código restante do componente permanece o mesmo.
  // ... (handleCancelRoutine, render, styles, etc.)
  const handleCancelRoutine = () => {
    navigation.goBack();
  };

  const handleOpenExerciseSelection = () => {
    setSelectedExercisesForModal([...currentRoutineExercises]);
    setSearchQuery("");
    setExerciseSelectionModalVisible(true);
  };

  const handleToggleExerciseSelection = (
    exercise: Omit<Exercise, "sets" | "reps">
  ) => {
    setSelectedExercisesForModal((prevSelected) => {
      const isSelected = prevSelected.some((e) => e.id === exercise.id);
      if (isSelected) {
        return prevSelected.filter((e) => e.id !== exercise.id);
      } else {
        return [...prevSelected, { ...exercise, sets: "", reps: "" }];
      }
    });
  };

  const handleSaveExerciseSelection = () => {
    setCurrentRoutineExercises([...selectedExercisesForModal]);
    setExerciseSelectionModalVisible(false);
  };

  const handleCancelExerciseSelection = () => {
    // Lógica original está correta, reverte para o estado inicial
    setCurrentRoutineExercises(
      selectedRoutine ? [...selectedRoutine.exercises] : []
    );
    setExerciseSelectionModalVisible(false);
    setSearchQuery("");
  };

  const handleRemoveExerciseFromCurrentRoutine = (exerciseId: string) => {
    setCurrentRoutineExercises((prev) =>
      prev.filter((e) => e.id !== exerciseId)
    );
  };

  const handleUpdateExerciseSetsReps = (
    exerciseId: string,
    field: "sets" | "reps",
    value: string
  ) => {
    setCurrentRoutineExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, [field]: value } : ex))
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* O JSX (a parte visual) do componente permanece exatamente o mesmo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancelRoutine}>
          <Ionicons name="arrow-back" size={24} color="#888" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {selectedRoutine ? "Editar Rotina" : "Nova Rotina"}
        </Text>
        <View style={{ width: 24 }} />
      </View>
      <SwipeListView
        data={currentRoutineExercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.exerciseItem}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <View style={styles.setsRepsContainer}>
              <TextInput
                style={styles.setsRepsInput}
                placeholder="Séries"
                value={String(item.sets)} // Convertido para string para evitar warnings
                onChangeText={(text) =>
                  handleUpdateExerciseSetsReps(item.id, "sets", text)
                }
                keyboardType="numeric"
              />
              <TextInput
                style={styles.setsRepsInput}
                placeholder="Reps"
                value={item.reps}
                onChangeText={(text) =>
                  handleUpdateExerciseSetsReps(item.id, "reps", text)
                }
                keyboardType="default"
              />
            </View>
          </View>
        )}
        renderHiddenItem={({ item }) => (
          <View style={styles.rowBack}>
            <TouchableOpacity
              style={[styles.backRightBtn, styles.backRightBtnRight]}
              onPress={() => handleRemoveExerciseFromCurrentRoutine(item.id)}
            >
              <Ionicons name="trash-bin" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
        rightOpenValue={-75}
        disableRightSwipe={true}
        ListHeaderComponent={
          <View style={styles.content}>
            <TextInput
              style={styles.input}
              placeholder="Nome da Rotina (ex: Treino de pernas)"
              value={routineName}
              onChangeText={setRoutineName}
              autoCapitalize="words"
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleOpenExerciseSelection}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.addButtonText}>Adicionar Exercícios</Text>
            </TouchableOpacity>

            <Text style={styles.subtitle}>Exercícios:</Text>
            {currentRoutineExercises.length === 0 && (
              <Text style={styles.emptyText}>Nenhum exercício adicionado.</Text>
            )}
          </View>
        }
      />
      <ExerciseSelectionModal
        isVisible={exerciseSelectionModalVisible}
        searchQuery={searchQuery}
        selectedExercisesForModal={selectedExercisesForModal}
        onClose={handleCancelExerciseSelection}
        onConfirm={handleSaveExerciseSelection}
        onSearchChange={setSearchQuery}
        onToggleExerciseSelection={handleToggleExerciseSelection}
        availableExercises={MOCK_AVAILABLE_EXERCISES}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelRoutine}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveRoutine}>
          <Text style={styles.saveButtonText}>
            {selectedRoutine ? "Salvar Edição" : "Salvar"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
// ... (seus estilos aqui, não precisam de mudança)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? 40 : 50, // Ajuste para melhor visualização
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#333" },
  content: { padding: 20 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#555",
    marginVertical: 10,
  },
  emptyText: { color: "#777", marginBottom: 15, textAlign: "center" },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  exerciseName: { fontSize: 16, color: "#333", flex: 1 },
  setsRepsContainer: { flexDirection: "row", alignItems: "center" },
  setsRepsInput: {
    backgroundColor: "#f4f4f4",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#333",
    width: 70,
    textAlign: "center",
    marginLeft: 8,
  },
  rowBack: {
    alignItems: "center",
    backgroundColor: "#db4045",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 1, // Ajuste para alinhar com o item
  },
  backRightBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: 75,
    height: "100%",
  },
  backRightBtnRight: {
    backgroundColor: "#db4045",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#541cb6",
    borderRadius: 35,
    paddingVertical: 12,
  },
  addButtonText: {
    color: "white",
    marginLeft: 10,
    fontWeight: "500",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  cancelButton: {
    backgroundColor: "#f4f4f4",
    paddingVertical: 12,
    borderRadius: 35,
    flex: 1,
    marginRight: 5,
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "500",
    fontSize: 16,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#541cb6",
    paddingVertical: 12,
    borderRadius: 35,
    flex: 1,
    marginLeft: 5,
  },
  saveButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AddEditRoutineScreen;
