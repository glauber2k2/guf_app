import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../../shared/types";
import SeriesList from "../components/SeriesList"; // ajuste o caminho se necessário

export default function AddEditRoutineScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "WorkoutInProgress">>();
  const routine = route.params?.selectedRoutine;

  const [exercises, setExercises] = useState(routine?.exercises || []);

  // Funções para passar para o SeriesList para manipular os exercícios
  const handleUpdateNotes = (exId: string, text: string) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exId ? { ...ex, notes: text } : ex))
    );
  };

  const handleUpdateSetData = (
    exId: string,
    setIndex: number,
    field: "kg" | "reps",
    value: string
  ) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exId) {
          const newSets = [...ex.setsData];
          newSets[setIndex] = { ...newSets[setIndex], [field]: value };
          return { ...ex, setsData: newSets };
        }
        return ex;
      })
    );
  };

  const handleDeleteSet = (exId: string, setIndex: number) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exId) {
          const newSets = ex.setsData.filter((_, i) => i !== setIndex);
          return { ...ex, setsData: newSets };
        }
        return ex;
      })
    );
  };

  const handleAddSet = (exId: string) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exId) {
          const nextSetNumber = ex.setsData.length + 1;
          return {
            ...ex,
            setsData: [
              ...ex.setsData,
              { setNumber: nextSetNumber, kg: "", reps: "" },
            ],
          };
        }
        return ex;
      })
    );
  };

  return (
    <SafeAreaView className="dark:bg-zinc-800 bg-zinc-100 flex-1">
      <View className="dark:bg-zinc-900 bg-zinc-200 flex-row items-center p-3 gap-4">
        <TouchableOpacity
          className="p-2"
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text className="text-violet-600 font-semibold text-base">
            Cancelar
          </Text>
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="text-zinc-800 dark:text-zinc-100 font-bold text-lg">
            {routine?.name}
          </Text>
        </View>

        <TouchableOpacity className="p-2" activeOpacity={0.7}>
          <Text className="text-violet-600 font-semibold text-base">
            Concluir
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        className="p-4"
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SeriesList
            item={item}
            handleUpdateNotes={handleUpdateNotes}
            handleUpdateSetData={handleUpdateSetData}
            handleDeleteSet={handleDeleteSet}
            handleAddSet={handleAddSet}
          />
        )}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="text-zinc-500 dark:text-zinc-400">
              Nenhum exercício
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
}
