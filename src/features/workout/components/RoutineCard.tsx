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

        <TouchableOpacity
          onPress={() => onOptionsPress(routine)}
          style={styles.optionsButton}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
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
            className="text-violet-600 dark:text-zinc-300"
          />
          <Text className="font-bold text-lg text-violet-600 dark:text-zinc-300">
            Iniciar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    height: 170,
    width: 300,
    backgroundColor: "#00000008",
    borderRadius: 20,
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-start", // Alinha o topo para o título e subtítulo
    justifyContent: "space-between",
    minHeight: 60, // Aumenta a altura mínima para acomodar o título e subtítulo
  },
  routineName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1, // Permite que o nome ocupe o espaço restante
  },
  muscleGroupsSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    position: "absolute", // Posiciona abaixo do título
    top: 28, // Ajuste conforme necessário para ficar abaixo do título
    left: 0, // Alinha à esquerda com o título
  },
  optionsButton: {
    padding: 5,
  },

  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#541cb6", // Cor de destaque para o botão
    borderRadius: 25, // Botão arredondado
    paddingVertical: 8,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  startButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default RoutineCard;
