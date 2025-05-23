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
    <View style={styles.cardContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.routineName}>{routine.name}</Text>
        <Text style={styles.muscleGroupsSubtitle}>
          {routine.muscleGroups || "Personalizado"}
        </Text>
        <TouchableOpacity
          onPress={() => onOptionsPress(routine)}
          style={styles.optionsButton}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.footerContainer}>
        <View style={styles.durationContainer}>
          <Ionicons name="time-outline" size={18} color="#666" />
          <Text style={styles.durationText}>
            {routine.durationMinutes
              ? `${routine.durationMinutes} min`
              : "45min"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => onStartPress(routine)}
        >
          <Ionicons name="play" size={20} color="white" />
          <Text style={styles.startButtonText}>Iniciar</Text>
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
