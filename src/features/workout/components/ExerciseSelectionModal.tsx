import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";

type Exercise = {
  id: string;
  name: string;
  muscleFocus: string;
  muscleSecondary: string[];
};

type ExerciseSelectorProps = {
  exercises: Exercise[];
  onConfirm: (selected: Exercise[]) => void;
  onCancel: () => void;
};

export default function ExerciseSelector({
  exercises,
  onConfirm,
  onCancel,
}: ExerciseSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }

  const renderItem = ({ item }: { item: Exercise }) => {
    const selected = selectedIds.has(item.id);
    return (
      <TouchableOpacity
        onPress={() => toggleSelect(item.id)}
        className={`p-4 border-b border-zinc-300 dark:border-zinc-700 flex-row justify-between items-center ${
          selected ? "bg-violet-600" : "bg-transparent"
        }`}
      >
        <View>
          <Text
            className={`text-lg font-semibold ${
              selected ? "text-white" : "text-zinc-900 dark:text-zinc-100"
            }`}
          >
            {item.name}
          </Text>
          <Text
            className={`text-sm ${
              selected ? "text-violet-200" : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            Foco: {item.muscleFocus}
          </Text>
          {item.muscleSecondary.length > 0 && (
            <Text
              className={`text-xs italic ${
                selected
                  ? "text-violet-200"
                  : "text-zinc-500 dark:text-zinc-500"
              }`}
            >
              Secundários: {item.muscleSecondary.join(", ")}
            </Text>
          )}
        </View>
        {selected && <Text className="text-white font-bold text-xl">✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-100 dark:bg-zinc-900">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-zinc-300 dark:border-zinc-700">
        <TouchableOpacity onPress={onCancel} className="px-3 py-1">
          <Text className="text-violet-600 font-semibold text-base">
            Cancelar
          </Text>
        </TouchableOpacity>
        <Text className="text-zinc-900 dark:text-zinc-100 font-bold text-lg">
          Adicionar Exercícios
        </Text>
        <TouchableOpacity
          onPress={() =>
            onConfirm(exercises.filter((ex) => selectedIds.has(ex.id)))
          }
          className="px-3 py-1"
        >
          <Text className="text-violet-600 font-semibold text-base">Criar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Exercícios */}
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
