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
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SwipeListView } from "react-native-swipe-list-view";

import { Exercise, Routine, RootStackParamList } from "../types";
import { STORAGE_KEY, MOCK_AVAILABLE_EXERCISES } from "../constants";
import ExerciseSelectionModal from "../components/ExerciseSelectionModal";

type AddEditRoutineScreenRouteProp = RouteProp<
  RootStackParamList,
  "AddEditRoutine"
>;

const AddEditRoutineScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AddEditRoutineScreenRouteProp>();
  const { selectedRoutine } = route.params;

  const [routineName, setRoutineName] = useState("");
  const [currentRoutineExercises, setCurrentRoutineExercises] = useState<
    Exercise[]
  >([]);
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

  const generateUniqueId = () => Date.now().toString();

  const handleSaveRoutine = async () => {
    if (routineName.trim() === "") {
      Alert.alert("Erro", "Por favor, insira um nome para a rotina.");
      return;
    }

    const incompleteExercises = currentRoutineExercises.filter(
      (ex) => ex.sets.trim() === "" || ex.reps.trim() === ""
    );
    if (incompleteExercises.length > 0) {
      Alert.alert(
        "Atenção",
        "Por favor, preencha as séries e repetições para todos os exercícios na rotina."
      );
      return;
    }

    try {
      const existingRoutinesJson = await AsyncStorage.getItem(STORAGE_KEY);
      let existingRoutines: Routine[] = existingRoutinesJson
        ? JSON.parse(existingRoutinesJson)
        : [];

      if (selectedRoutine) {
        existingRoutines = existingRoutines.map((r) =>
          r.id === selectedRoutine.id
            ? {
                ...r,
                name: routineName.trim(),
                exercises: currentRoutineExercises,
              }
            : r
        );
      } else {
        const newRoutine: Routine = {
          id: generateUniqueId(),
          name: routineName.trim(),
          exercises: currentRoutineExercises,
        };
        existingRoutines = [...existingRoutines, newRoutine];
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existingRoutines));
      Alert.alert("Sucesso", `Rotina "${routineName.trim()}" salva!`);
      navigation.goBack();
    } catch (e) {
      console.error("Erro ao salvar rotina:", e);
      Alert.alert("Erro", "Não foi possível salvar a rotina.");
    }
  };

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
                value={item.sets}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? 20 : 40,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#333" },
  content: { padding: 20 },
  input: {
    backgroundColor: "#00000010",
    borderRadius: 35,
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
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginHorizontal: 20,
  },
  exerciseName: { fontSize: 16, color: "#333", flex: 1 },
  setsRepsContainer: { flexDirection: "row", alignItems: "center" },
  setsRepsInput: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#333",
    width: 65,
    textAlign: "center",
    marginRight: 8,
  },
  rowBack: {
    alignItems: "center",
    backgroundColor: "#db4045",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 20,
  },
  backRightBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: 75,
    height: "100%",
  },
  backRightBtnRight: {
    backgroundColor: "#db4045",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    borderRadius: 35,
    paddingVertical: 12,
  },
  addButtonText: {
    color: "white",
    marginLeft: 10,
    fontWeight: "500",
    fontSize: 16,
  },
  footerArea: { marginTop: "auto" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#00000010",
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "50%",
  },
  cancelButtonText: {
    color: "#db4045",
    fontWeight: "500",
    fontSize: 16,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#541cb6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "50%",
  },
  saveButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AddEditRoutineScreen;
