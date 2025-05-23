import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Platform,
  Image,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SwipeListView } from "react-native-swipe-list-view";

interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  type: string;
}

export interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
}

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
    previousKg: string;
    kg: string;
    reps: string;
  }[];
}

interface ResumedWorkoutState {
  routine: Routine | null;
  workoutExercises: WorkoutExercise[];
  elapsedTime: number;
  timerRunning: boolean;
}

export type RootStackParamList = {
  WorkoutInProgress: {
    selectedRoutine?: Routine;
    resumedWorkoutState?: ResumedWorkoutState;
  };
};

type WorkoutInProgressScreenRouteProp = RouteProp<
  RootStackParamList,
  "WorkoutInProgress"
>;

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

  const [isCustomAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState("");
  const [customAlertMessage, setCustomAlertMessage] = useState("");
  const [customAlertActions, setCustomAlertActions] = useState<
    { text: string; onPress: () => void; style?: "cancel" | "destructive" }[]
  >([]);

  const [isAddExerciseModalVisible, setAddExerciseModalVisible] =
    useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseSets, setNewExerciseSets] = useState("");
  const [newExerciseReps, setNewExerciseReps] = useState("");

  const showCustomAlert = (
    title: string,
    message: string,
    actions: {
      text: string;
      onPress: () => void;
      style?: "cancel" | "destructive";
    }[] = [{ text: "OK", onPress: () => setCustomAlertVisible(false) }]
  ) => {
    setCustomAlertTitle(title);
    setCustomAlertMessage(message);
    setCustomAlertActions(actions);
    setCustomAlertVisible(true);
  };

  useEffect(() => {
    if (resumedWorkoutState) {
      setWorkoutExercises(resumedWorkoutState.workoutExercises);
      setElapsedTime(resumedWorkoutState.elapsedTime);
      setTimerRunning(resumedWorkoutState.timerRunning);
    } else if (selectedRoutine) {
      const initialWorkoutExercises: WorkoutExercise[] =
        selectedRoutine.exercises.map((ex) => {
          const numSets = parseInt(ex.sets || "0", 10);
          const setsData = Array.from({ length: numSets }, (_, i) => ({
            setNumber: i + 1,
            previousReps: ex.reps,
            previousKg: `${Math.floor(Math.random() * 50) + 20}`,
            kg: "",
            reps: "",
          }));
          return {
            id: ex.id,
            name: ex.name,
            imageUrl: `https://placehold.co/100x100/E0E0E0/333333?text=${ex.name
              .substring(0, 2)
              .toUpperCase()}`,
            originalSets: ex.sets,
            originalReps: ex.reps,
            notes: "",
            setsData: setsData,
          };
        });
      setWorkoutExercises(initialWorkoutExercises);
      setElapsedTime(0);
      setTimerRunning(true);
    } else {
      setWorkoutExercises([]);
      setElapsedTime(0);
      setTimerRunning(true);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [selectedRoutine, resumedWorkoutState]);

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

  const handleUpdateSetData = (
    exerciseId: string,
    setIndex: number,
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

  const handleUpdateNotes = (exerciseId: string, text: string) => {
    setWorkoutExercises((prevExercises) =>
      prevExercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, notes: text } : ex
      )
    );
  };

  const saveWorkoutState = async (isFinishing: boolean = false) => {
    try {
      if (isFinishing) {
        await AsyncStorage.removeItem(STORAGE_KEY_CURRENT_WORKOUT);
      } else {
        const stateToSave = {
          routine: selectedRoutine || null,
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
      showCustomAlert("Erro", "Não foi possível salvar o progresso do treino.");
    }
  };

  const handleFinishWorkout = () => {
    showCustomAlert(
      "Concluir Treino",
      "Deseja realmente concluir este treino?",
      [
        {
          text: "Cancelar",
          onPress: () => setCustomAlertVisible(false),
          style: "cancel",
        },
        {
          text: "Concluir",
          onPress: async () => {
            setCustomAlertVisible(false);
            await saveWorkoutState(true);
            showCustomAlert("Treino Concluído", "Seu treino foi registrado!");
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleAddSet = (exerciseId: string) => {
    setWorkoutExercises((prevExercises) =>
      prevExercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              setsData: [
                ...ex.setsData,
                {
                  setNumber: ex.setsData.length + 1,
                  previousReps: "",
                  previousKg: "",
                  kg: "",
                  reps: "",
                },
              ],
            }
          : ex
      )
    );
  };

  const handleAddNewExercise = () => {
    if (newExerciseName.trim() === "") {
      showCustomAlert("Erro", "Por favor, insira um nome para o exercício.");
      return;
    }

    const numSets = parseInt(newExerciseSets || "1", 10);
    const setsData = Array.from({ length: numSets }, (_, i) => ({
      setNumber: i + 1,
      previousReps: newExerciseReps || "",
      previousKg: "",
      kg: "",
      reps: "",
    }));

    const newExercise: WorkoutExercise = {
      id: `new-ex-${Date.now()}`,
      name: newExerciseName.trim(),
      imageUrl: `https://placehold.co/100x100/E0E0E0/333333?text=${newExerciseName
        .substring(0, 2)
        .toUpperCase()}`,
      originalSets: newExerciseSets || "1",
      originalReps: newExerciseReps || "",
      notes: "",
      setsData: setsData,
    };

    setWorkoutExercises((prev) => [...prev, newExercise]);
    setNewExerciseName("");
    setNewExerciseSets("");
    setNewExerciseReps("");
    setAddExerciseModalVisible(false);
    showCustomAlert("Sucesso", `Exercício "${newExercise.name}" adicionado!`);
  };

  const handleDeleteSet = (exerciseId: string, setIndexToDelete: number) => {
    setWorkoutExercises((prevExercises) =>
      prevExercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              setsData: ex.setsData
                .filter((_, idx) => idx !== setIndexToDelete)
                .map((set, idx) => ({ ...set, setNumber: idx + 1 })),
            }
          : ex
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={async () => {
            await saveWorkoutState();
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedRoutine?.name || "Treino Livre"}
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

      {!selectedRoutine && (
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => setAddExerciseModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color="white" />
          <Text style={styles.addExerciseButtonText}>Adicionar Exercício</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={workoutExercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
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
              <Text style={styles.setFieldHeader}>Anterior</Text>
              <Text style={styles.setFieldHeader}>KG</Text>
              <Text style={styles.setFieldHeader}>Reps</Text>
            </View>

            <SwipeListView
              data={item.setsData}
              keyExtractor={(set, index) =>
                `${item.id}-set-${set.setNumber}-${index}`
              }
              renderItem={({ item: set, index: setIndex }) => (
                <View
                  style={[
                    styles.setRow,
                    setIndex % 2 === 1 ? { backgroundColor: "#00000010" } : {},
                    { backgroundColor: "white" },
                  ]}
                >
                  <Text style={styles.setNumber}>{set.setNumber}.</Text>
                  <TextInput
                    style={styles.setFieldInput}
                    placeholder={
                      set.previousReps || set.previousKg
                        ? `${set.previousReps || "N/A"} x ${
                            set.previousKg || "0"
                          }kg`
                        : "N/A"
                    }
                    placeholderTextColor="#999"
                    value={
                      set.previousReps || set.previousKg
                        ? `${set.previousReps || "N/A"} x ${
                            set.previousKg || "0"
                          }kg`
                        : ""
                    }
                    editable={false}
                  />
                  <TextInput
                    style={styles.setFieldInput}
                    placeholder="KG"
                    placeholderTextColor="#999"
                    value={set.kg}
                    onChangeText={(text) =>
                      handleUpdateSetData(item.id, setIndex, "kg", text)
                    }
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.setFieldInput}
                    placeholder="Reps"
                    placeholderTextColor="#999"
                    value={set.reps}
                    onChangeText={(text) =>
                      handleUpdateSetData(item.id, setIndex, "reps", text)
                    }
                    keyboardType="numeric"
                  />
                </View>
              )}
              renderHiddenItem={({ item: set, index: setIndex }) => (
                <View style={styles.rowBack}>
                  <TouchableOpacity
                    style={[styles.backBtn, styles.backRightBtn]}
                    onPress={() => handleDeleteSet(item.id, setIndex)}
                  >
                    <Ionicons name="trash-bin" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              )}
              disableRightSwipe={true}
              rightOpenValue={-75}
              tension={-1}
              friction={10}
              swipeToOpenPercent={10}
              swipeToClosePercent={10}
              // directionalLockEnabled={true} // Removido para evitar erro de tipagem
            />
            <TouchableOpacity
              style={styles.addSetButton}
              onPress={() => handleAddSet(item.id)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#6200ee" />
              <Text style={styles.addSetButtonText}>Adicionar Série</Text>
            </TouchableOpacity>
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

      <Modal
        animationType="fade"
        transparent={true}
        visible={isCustomAlertVisible}
        onRequestClose={() => setCustomAlertVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{customAlertTitle}</Text>
            <Text style={styles.modalText}>{customAlertMessage}</Text>
            <View style={styles.modalButtonContainer}>
              {customAlertActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalButton,
                    action.style === "cancel"
                      ? styles.modalCancelButton
                      : action.style === "destructive"
                      ? styles.modalDestructiveButton
                      : styles.modalConfirmButton,
                  ]}
                  onPress={action.onPress}
                >
                  <Text style={styles.modalButtonText}>{action.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddExerciseModalVisible}
        onRequestClose={() => setAddExerciseModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Adicionar Novo Exercício</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nome do Exercício"
              placeholderTextColor="#999"
              value={newExerciseName}
              onChangeText={setNewExerciseName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Número de Séries (ex: 3)"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={newExerciseSets}
              onChangeText={setNewExerciseSets}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Repetições (ex: 10-12)"
              placeholderTextColor="#999"
              value={newExerciseReps}
              onChangeText={setNewExerciseReps}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setAddExerciseModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleAddNewExercise}
              >
                <Text style={styles.modalButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addExerciseButton: {
    backgroundColor: "#6200ee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addExerciseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  exerciseListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  exerciseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    backgroundColor: "#e0e0e0",
  },
  exerciseCardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  moreOptionsButton: {
    padding: 5,
  },
  notesInput: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#333",
    marginBottom: 16,
    minHeight: 60,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#eee",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderColor: "#00000005",
  },
  setNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    width: 30,
    textAlign: "center",
  },
  setFieldHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#777",
    flex: 1,
    marginHorizontal: 5,
    textAlign: "center",
  },
  setFieldInput: {
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#333",
    flex: 1,
    marginHorizontal: 5,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  addSetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: "#f0f2f5",
    borderWidth: 1,
    borderColor: "#eee",
  },
  addSetButtonText: {
    color: "#6200ee",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  rowBack: {
    alignItems: "center",
    backgroundColor: "#db4045",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    borderRadius: 6,
    marginBottom: 8,
    paddingRight: 10,
  },
  backBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: 75,
    height: "100%",
  },
  backRightBtn: {
    backgroundColor: "#db4045",
    right: 0,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  backTextWhite: {
    color: "#FFF",
    marginTop: 5,
    fontSize: 12,
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  modalText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  modalInput: {
    width: "100%",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  modalButton: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
  },
  modalCancelButton: {
    backgroundColor: "#db4045",
  },
  modalConfirmButton: {
    backgroundColor: "#6200ee",
  },
  modalDestructiveButton: {
    backgroundColor: "#db4045",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});

export default WorkoutInProgressScreen;
