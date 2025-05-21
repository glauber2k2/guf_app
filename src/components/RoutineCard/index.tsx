import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Routine } from '../../types'; // Importe Routine do arquivo de tipos compartilhado
import { globalStyles } from '../../styles'; // Import global styles

interface RoutineCardProps {
  routine: Routine;
  onPress: (routine: Routine) => void;
  onOptionsPress: (routine: Routine) => void;
}

const RoutineCard: React.FC<RoutineCardProps> = ({ routine, onPress, onOptionsPress }) => {
  return (
    <TouchableOpacity style={globalStyles.routineItem} onPress={() => onPress(routine)}>
      <View style={globalStyles.routineItemHeader}>
        <Text style={globalStyles.routineName}>{routine.name}</Text>
        <TouchableOpacity onPress={() => onOptionsPress(routine)} style={globalStyles.optionsButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      <View style={globalStyles.routineExercisesContainer}>
        {routine.exercises && routine.exercises.length > 0 ? (
          routine.exercises.map((ex, idx) => (
            <Text key={idx} style={globalStyles.routineExerciseItem}>
              • {ex.name}: {ex.sets}x{ex.reps}
            </Text>
          ))
        ) : (
          <Text style={globalStyles.noExercisesText}>Nenhum exercício adicionado.</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default RoutineCard;