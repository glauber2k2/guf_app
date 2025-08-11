import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ExerciseSelector from "../components/ExerciseSelectionModal";
import SeriesList from "../components/SeriesList";

import firestore from "@react-native-firebase/firestore";
import exercices from "../../../shared/constants/exercises.json";
import {
  ExerciseForRoutine,
  saveRoutine,
} from "../../../services/RoutineService";

type Exercise = {
  id: string;
  name: string;
  muscleFocus: string;
  muscleSecondary: string[];
  imageUrl?: string;
};

export default function AddEditRoutineScreen() {
  const navigation = useNavigation();

  const [routineName, setRoutineName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<
    Array<{
      id: string;
      name: string;
      muscleFocus: string;
      muscleSecondary: string[];
      notes: string;
      setsData: Array<{
        setNumber: number;
        previousReps?: string;
        previousKg?: string;
        kg: string;
        reps: string;
      }>;
    }>
  >([]);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  function openSelector() {
    setSelectorVisible(true);
  }

  function onConfirmSelected(selected: Exercise[]) {
    setSelectedExercises((prev) => {
      const newList = [...prev];
      selected.forEach((ex) => {
        if (!newList.find((e) => e.id === ex.id)) {
          newList.push({
            ...ex,
            notes: "",
            setsData: [],
          });
        }
      });
      // Remove exercícios que foram desmarcados no selector
      return newList.filter((e) => selected.find((s) => s.id === e.id));
    });
    setSelectorVisible(false);
  }

  function onCancelSelector() {
    setSelectorVisible(false);
  }

  function handleUpdateNotes(exId: string, text: string) {
    setSelectedExercises((prev) =>
      prev.map((ex) => (ex.id === exId ? { ...ex, notes: text } : ex))
    );
  }

  function handleUpdateSetData(
    exId: string,
    setIndex: number,
    field: "kg" | "reps",
    value: string
  ) {
    setSelectedExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exId) {
          const newSets = [...ex.setsData];
          newSets[setIndex] = {
            ...newSets[setIndex],
            [field]: value,
          };
          return { ...ex, setsData: newSets };
        }
        return ex;
      })
    );
  }

  function handleDeleteSet(exId: string, setIndex: number) {
    setSelectedExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exId) {
          const newSets = ex.setsData.filter((_, i) => i !== setIndex);
          return { ...ex, setsData: newSets };
        }
        return ex;
      })
    );
  }

  function handleAddSet(exId: string) {
    setSelectedExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exId) {
          const nextSetNumber = ex.setsData.length + 1;

          const newSet = {
            setNumber: nextSetNumber,
            kg: "",
            reps: "",
          };

          return {
            ...ex,
            setsData: [...ex.setsData, newSet], // Adicione o novo objeto "limpo"
          };
        }
        return ex;
      })
    );
  }

  // Render fallback quando não há exercícios
  const renderEmptyList = () => (
    <View className="items-center mt-20 flex-1 justify-center">
      <Ionicons
        name="alert-circle-outline"
        size={64}
        color="#a78bfa"
        style={{ marginBottom: 12 }}
      />
      <Text className="text-zinc-500 dark:text-zinc-400 mb-6 text-center">
        Nenhum exercício selecionado.
      </Text>
      <TouchableOpacity
        className="bg-violet-600 rounded-full px-6 py-3"
        onPress={openSelector}
        activeOpacity={0.8}
      >
        <Text className="text-white font-semibold text-base">
          Adicionar Exercícios
        </Text>
      </TouchableOpacity>
    </View>
  );

  async function handleSaveRoutine() {
    setLoading(true);
    try {
      await saveRoutine(routineName, selectedExercises as ExerciseForRoutine[]);
      Alert.alert("Sucesso", "Rotina salva com sucesso!");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha ao salvar rotina.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <SafeAreaView className="dark:bg-zinc-800 bg-zinc-100 flex-1">
      {/* Header */}
      <View className="dark:bg-zinc-900 bg-zinc-200 flex-row items-center p-3 gap-4 mb-6">
        <TouchableOpacity
          className="p-2"
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          disabled={loading}
        >
          <Text className="text-violet-600 font-semibold text-base">
            Cancelar
          </Text>
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="text-zinc-800 dark:text-zinc-100 font-bold text-lg">
            Adicionar Exercício
          </Text>
        </View>

        <TouchableOpacity
          className="p-2"
          activeOpacity={0.7}
          onPress={handleSaveRoutine}
          disabled={loading}
        >
          <Text className="text-violet-600 font-semibold text-base">
            {loading ? "Salvando..." : "Salvar"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Nome da rotina */}
      <View className="px-4 mb-4">
        <TextInput
          placeholder="Nome da rotina"
          placeholderTextColor="#888"
          className="bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-md p-4 text-lg"
          value={routineName}
          onChangeText={setRoutineName}
          editable={!loading}
        />
      </View>

      {/* Lista de exercícios */}
      <FlatList
        data={selectedExercises}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <SeriesList
            item={item}
            handleUpdateNotes={handleUpdateNotes}
            handleUpdateSetData={handleUpdateSetData}
            handleDeleteSet={handleDeleteSet}
            handleAddSet={handleAddSet}
          />
        )}
      />

      {/* Botão para adicionar mais exercícios */}
      {selectedExercises.length > 0 && (
        <TouchableOpacity
          className="bg-violet-600 rounded-full px-6 py-3 self-center my-6"
          onPress={openSelector}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text className="text-white font-semibold text-base">
            Adicionar Mais Exercícios
          </Text>
        </TouchableOpacity>
      )}

      {/* Modal fullscreen para ExerciseSelector */}
      <Modal
        visible={selectorVisible}
        animationType="slide"
        onRequestClose={onCancelSelector}
        presentationStyle="fullScreen"
      >
        <ExerciseSelector
          exercises={exercices}
          onConfirm={onConfirmSelected}
          onCancel={onCancelSelector}
        />
      </Modal>
    </SafeAreaView>
  );
}
