// components/ExerciseSelectionModal.tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Exercise } from "../../../shared/types";

interface ExerciseSelectionModalProps {
  isVisible: boolean;
  searchQuery: string;
  selectedExercisesForModal: Exercise[];
  onClose: () => void;
  onConfirm: () => void;
  onSearchChange: (text: string) => void;
  onToggleExerciseSelection: (
    exercise: Omit<Exercise, "sets" | "reps">
  ) => void;
  availableExercises: Omit<Exercise, "sets" | "reps">[];
}

const ExerciseSelectionModal: React.FC<ExerciseSelectionModalProps> = ({
  isVisible,
  searchQuery,
  selectedExercisesForModal,
  onClose,
  onConfirm,
  onSearchChange,
  onToggleExerciseSelection,
  availableExercises = [],
}) => {
  const filteredExercises = availableExercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.title}>Selecionar Exercícios</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={30} color="#888" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar exercício..."
            value={searchQuery}
            onChangeText={onSearchChange}
          />

          {filteredExercises.length === 0 ? (
            <Text style={styles.emptyListText}>
              {searchQuery
                ? `Nenhum exercício encontrado para "${searchQuery}".`
                : "Nenhum exercício disponível."}
            </Text>
          ) : (
            <FlatList
              data={filteredExercises}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = selectedExercisesForModal.some(
                  (e) => e.id === item.id
                );
                return (
                  <TouchableOpacity
                    style={[
                      styles.exerciseItem,
                      isSelected && styles.selectedExerciseItem,
                    ]}
                    onPress={() => onToggleExerciseSelection(item)}
                  >
                    <Ionicons
                      name={isSelected ? "checkbox-outline" : "square-outline"}
                      size={24}
                      color={isSelected ? "#8e44ad" : "#555"}
                    />
                    <Text style={styles.exerciseName}>{item.name}</Text>
                  </TouchableOpacity>
                );
              }}
              style={styles.exerciseList}
            />
          )}

          <TouchableOpacity
            style={[
              styles.confirmButton,
              selectedExercisesForModal.length === 0 && { opacity: 0.6 },
            ]}
            onPress={onConfirm}
            disabled={selectedExercisesForModal.length === 0}
          >
            <Text style={styles.confirmButtonText}>Confirmar Seleção</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalView: {
    width: "90%",
    height: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  searchInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    color: "#333",
  },
  exerciseList: {
    width: "100%",
    flex: 1,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedExerciseItem: {
    backgroundColor: "#f3e8ff",
    borderRadius: 8,
  },
  exerciseName: {
    fontSize: 16,
    marginLeft: 10,
    color: "#333",
  },
  confirmButton: {
    backgroundColor: "#8e44ad",
    borderRadius: 10,
    paddingVertical: 15,
    width: "100%",
    marginTop: 20,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyListText: {
    color: "#777",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});

export default ExerciseSelectionModal;
