import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
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
    <SafeAreaView className="dark:bg-zinc-800 bg-zinc-100 flex-1 ">
      <View className="dark:bg-zinc-900 bg-zinc-200 flex-row items-center p-3 gap-4 mb-6 ">
        <TouchableOpacity
          onPress={async () => {
            await saveWorkoutState();
            navigation.goBack();
          }}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            className="dark:text-zinc-300"
          />
        </TouchableOpacity>
        <Text className="dark:text-zinc-300 font-bold text-2xl">
          {selectedRoutine?.name || "Treino Livre"}
        </Text>

        <TouchableOpacity
          className="bg-violet-700 py-3 px-4 rounded-full ml-auto flex-row gap-2"
          onPress={() => setAddExerciseModalVisible(true)}
        >
          <Ionicons
            name="add-circle-sharp"
            size={24}
            className="text-purple-200"
          />
          <Text className="text-purple-200 font-bold text-lg">Exercício</Text>
        </TouchableOpacity>
      </View>

      <View className="absolute bottom-6 self-center py-4 px-6 rounded-full gap-4 bg-violet-800 z-50 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-purple-100">
          {formatTime(elapsedTime)}
        </Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="bg-purple-50/10 justify-center p-4 rounded-full"
            onPress={handleResetTimer}
          >
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-purple-50/10 justify-center p-4 rounded-full"
            onPress={handleStartStopTimer}
          >
            <Ionicons
              name={timerRunning ? "pause" : "play"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-purple-50/10 justify-center p-4 rounded-full"
            onPress={handleFinishWorkout}
          >
            <Ionicons name="checkmark-done" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        className="px-3"
        data={workoutExercises}
        keyExtractor={(item) => item.id}
        ListFooterComponent={<View style={{ height: 100 }} />}
        renderItem={({ item }) => (
          <View className="dark:bg-zinc-900 bg-zinc-200 p-4 rounded-3xl mb-3">
            <View className="flex-row items-center gap-4">
              <Image
                source={{ uri: item.imageUrl }}
                className="w-14 h-14 bg-zinc-400 rounded-2xl"
              />
              <Text className="text-2xl font-bold dark:text-zinc-300">
                {item.name}
              </Text>
              <TouchableOpacity className=" ml-auto">
                <Ionicons
                  name="ellipsis-horizontal"
                  size={24}
                  className="dark:text-zinc-300"
                />
              </TouchableOpacity>
            </View>

            <TextInput
              className="dark:text-zinc-200 "
              placeholder="Adicionar anotações ou descrição..."
              placeholderTextColor="grey"
              multiline
              value={item.notes}
              onChangeText={(text) => handleUpdateNotes(item.id, text)}
            />

            <View className="justify-between flex-row py-2 px-8  dark:border-zinc-700 border-zinc-400">
              <Text className="dark:text-zinc-200 font-bold text-lg w-1/4">
                S
              </Text>
              <Text className="dark:text-zinc-200 font-bold text-lg w-1/4 text-center">
                Anterior
              </Text>
              <Text className="dark:text-zinc-200 font-bold text-lg w-1/4 text-center">
                Kg
              </Text>
              <Text className="dark:text-zinc-200 font-bold text-lg w-1/4 text-center">
                Reps
              </Text>
            </View>

            <SwipeListView
              data={item.setsData}
              keyExtractor={(set, index) =>
                `${item.id}-set-${set.setNumber}-${index}`
              }
              renderItem={({ item: set, index: setIndex }) => (
                <View
                  className={` justify-between flex-row py-2 px-8 items-center
                    ${
                      setIndex % 2 === 1
                        ? "dark:bg-zinc-800 bg-zinc-300"
                        : "dark:bg-zinc-900 bg-zinc-200"
                    } `}
                >
                  <Text className="dark:text-zinc-400 text-lg  w-1/4">
                    {set.setNumber}.
                  </Text>
                  <Text className="dark:text-zinc-400 text-lg text-center w-1/4">
                    {set.previousReps || set.previousKg
                      ? `${set.previousReps || "N/A"} x ${
                          set.previousKg || "0"
                        }kg`
                      : "N/A"}
                  </Text>
                  <TextInput
                    multiline
                    numberOfLines={1}
                    className="dark:text-zinc-400 text-lg text-center w-1/4"
                    placeholder="0"
                    placeholderTextColor="#999"
                    value={set.kg}
                    onChangeText={(text) =>
                      handleUpdateSetData(item.id, setIndex, "kg", text)
                    }
                    keyboardType="numeric"
                  />
                  <TextInput
                    multiline
                    numberOfLines={1}
                    className="dark:text-zinc-400 text-lg text-center w-1/4"
                    placeholder="0"
                    placeholderTextColor="#999"
                    value={set.reps}
                    onChangeText={(text) =>
                      handleUpdateSetData(item.id, setIndex, "reps", text)
                    }
                    keyboardType="numeric"
                  />
                </View>
              )}
              //TODO: mb-[0.1] por causa que ao testar (apenas no emulador ate entao) vazava parte da view vermelha por baixo de algumas rows.
              renderHiddenItem={({ item: set, index: setIndex }) => (
                <View className="mb-[0.1] bg-red-500 overflow-hidden">
                  <TouchableOpacity
                    className=" flex-row h-full items-center justify-end px-6"
                    onPress={() => handleDeleteSet(item.id, setIndex)}
                  >
                    <Ionicons name="trash-bin" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              )}
              disableRightSwipe={true}
              rightOpenValue={-75}
              tension={40}
              friction={10}
              swipeToOpenPercent={10}
              swipeToClosePercent={10}
            />
            <TouchableOpacity
              className="dark:bg-zinc-800 bg-zinc-300 mt-4 rounded-full items-center flex-row justify-center gap-2 p-4"
              onPress={() => handleAddSet(item.id)}
            >
              <Ionicons
                name="add-circle-outline"
                size={28}
                className="dark:text-violet-500 text-violet-700"
              />
              <Text className="dark:text-violet-500 text-violet-700 text-xl font-bold">
                Adicionar Série
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={isCustomAlertVisible}
        onRequestClose={() => setCustomAlertVisible(false)}
      >
        <View className="flex-1 justify-center items-center">
          <View className="bg-white rounded-lg shadow-md w-4/5 max-w-md p-6">
            <Text className="text-xl font-bold mb-2">{customAlertTitle}</Text>
            <Text className="mb-4">{customAlertMessage}</Text>
            <View className="flex-row justify-end">
              {customAlertActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={action.onPress}
                  className={`rounded-md px-4 py-2 ml-2 ${
                    action.style === "cancel"
                      ? "bg-gray-300"
                      : action.style === "destructive"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                >
                  <Text
                    className={`text-white font-bold ${
                      action.style === "cancel" ? "text-gray-700" : ""
                    }`}
                  >
                    {action.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        visible={isAddExerciseModalVisible}
        transparent
        onRequestClose={() => setAddExerciseModalVisible(false)}
      >
        <View className="p-6 bg-zinc-200 dark:bg-zinc-900 flex-1 w-full ">
          <View className="flex-row items-center gap-4 mb-6">
            <TouchableOpacity onPress={() => setAddExerciseModalVisible(false)}>
              <Ionicons
                name="chevron-down"
                size={22}
                className="dark:text-zinc-100"
              />
            </TouchableOpacity>

            <Text className="text-xl dark:text-zinc-100">
              Exercicio Personalizado
            </Text>

            <TouchableOpacity
              onPress={handleAddNewExercise}
              className="bg-gray-300 dark:bg-violet-700 px-6 py-3 ml-auto rounded-full"
            >
              <Text className="font-bold ml-auto text-violet-700 dark:text-violet-100">
                Salvar
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            className="dark:bg-zinc-800 mt-6 rounded-full px-6 py-4 text-lg bg-zinc-300 dark:text-zinc-100"
            placeholder="Nome do Exercício"
            placeholderTextColor="#999"
            value={newExerciseName}
            onChangeText={setNewExerciseName}
          />
          <TextInput
            className="dark:bg-zinc-800 mt-6 rounded-full px-6 py-4 text-lg bg-zinc-300 dark:text-zinc-100"
            placeholder="Número de Séries (ex: 3)"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={newExerciseSets}
            onChangeText={setNewExerciseSets}
          />
          <TextInput
            className="dark:bg-zinc-800 mt-6 rounded-full px-6 py-4 text-lg bg-zinc-300 dark:text-zinc-100"
            placeholder="Repetições (ex: 10-12)"
            placeholderTextColor="#999"
            value={newExerciseReps}
            onChangeText={setNewExerciseReps}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default WorkoutInProgressScreen;
