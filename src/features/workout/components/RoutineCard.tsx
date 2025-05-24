import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Definição da interface Routine (assumindo que viria de um arquivo de tipos compartilhado)
// Adicionei 'muscleGroups' e 'durationMinutes' conforme solicitado.
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
  muscleGroups?: string; // Novo: para o subtítulo dos grupos musculares
  durationMinutes?: number; // Novo: para a duração programada do treino
  exercises: Exercise[];
}

interface RoutineCardProps {
  routine: Routine;
  onPress: (routine: Routine) => void;
  onStartPress: (routine: Routine) => void; // Novo: para o botão Iniciar
  onOptionsPress: (routine: Routine) => void;
}

const RoutineCard: React.FC<RoutineCardProps> = ({
  routine,
  onStartPress,
  onOptionsPress,
}) => {
  return (
    <View className="dark:bg-zinc-800 bg-zinc-300 p-5 rounded-3xl w-[250] h-[150]">
      <View className="flex-row justify-between items-start">
        <Text className="text-zinc-900 dark:text-zinc-300 font-bold text-2xl">
          {routine.name}
        </Text>

        <TouchableOpacity onPress={() => onOptionsPress(routine)}>
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            className="text-zinc-800 dark:text-zinc-500"
          />
        </TouchableOpacity>
      </View>
      <Text className="text-zinc-500">
        {routine.muscleGroups || "Personalizado"}
      </Text>

      <View className="flex-row justify-between mt-auto">
        <View className="flex-row items-center gap-1">
          <Ionicons name="time-outline" size={18} color="gray" />
          <Text className="text-zinc-500">
            {routine.durationMinutes
              ? `${routine.durationMinutes} min`
              : "45min"}
          </Text>
        </View>
        <TouchableOpacity
          className="bg-zinc-400/40 dark:bg-violet-800 px-4 py-2 rounded-full flex-row gap-2 items-center"
          onPress={() => onStartPress(routine)}
        >
          <Ionicons
            name="play"
            size={20}
            className="text-violet-700 dark:text-purple-100"
          />
          <Text className="font-bold text-lg text-violet-700 dark:text-purple-100">
            Iniciar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RoutineCard;
