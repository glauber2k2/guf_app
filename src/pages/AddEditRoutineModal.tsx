// screens/AddEditRoutineScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importa os tipos e constantes
import { Exercise, Routine, RootStackParamList } from '../types';
import { STORAGE_KEY, MOCK_AVAILABLE_EXERCISES } from '../constants'; // <-- Importação crucial dos dados mockados
import ExerciseSelectionModal from '../components/ExerciseSelectionModal';

// Define o tipo para as props da rota desta tela
type AddEditRoutineScreenRouteProp = RouteProp<RootStackParamList, 'AddEditRoutine'>;

const AddEditRoutineScreen: React.FC = () => {
 

  const navigation = useNavigation();
  const route = useRoute<AddEditRoutineScreenRouteProp>();
  const { selectedRoutine } = route.params;

  const [routineName, setRoutineName] = useState('');
  const [currentRoutineExercises, setCurrentRoutineExercises] = useState<Exercise[]>([]);
  const [exerciseSelectionModalVisible, setExerciseSelectionModalVisible] = useState(false);
  const [selectedExercisesForModal, setSelectedExercisesForModal] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Inicializa estados com base na rotina selecionada (edição) ou para uma nova rotina
  useEffect(() => {
    if (selectedRoutine) {
      setRoutineName(selectedRoutine.name);
      setCurrentRoutineExercises([...selectedRoutine.exercises]);
      setSelectedExercisesForModal([...selectedRoutine.exercises]); // Inicializa para o modal de seleção
    } else {
      setRoutineName('');
      setCurrentRoutineExercises([]);
      setSelectedExercisesForModal([]);
    }
  }, [selectedRoutine]);

  // Gera um ID único para novas rotinas
  const generateUniqueId = () => Date.now().toString();

  // Salva a rotina no AsyncStorage
  const handleSaveRoutine = async () => {
    if (routineName.trim() === '') {
      Alert.alert('Erro', 'Por favor, insira um nome para a rotina.');
      return;
    }

    const incompleteExercises = currentRoutineExercises.filter(ex => ex.sets.trim() === '' || ex.reps.trim() === '');
    if (incompleteExercises.length > 0) {
      Alert.alert('Atenção', 'Por favor, preencha as séries e repetições para todos os exercícios na rotina.');
      return;
    }

    try {
      const existingRoutinesJson = await AsyncStorage.getItem(STORAGE_KEY);
      let existingRoutines: Routine[] = existingRoutinesJson ? JSON.parse(existingRoutinesJson) : [];

      if (selectedRoutine) {
        existingRoutines = existingRoutines.map(r =>
          r.id === selectedRoutine.id ? { ...r, name: routineName.trim(), exercises: currentRoutineExercises } : r
        );
      } else {
        const newRoutine: Routine = {
          id: generateUniqueId(),
          name: routineName.trim(),
          exercises: currentRoutineExercises,
        };
        existingRoutines = [...existingRoutines, newRoutine];
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existingRoutines));
      Alert.alert('Sucesso', `Rotina "${routineName.trim()}" salva!`);
      navigation.goBack();
    } catch (e) {
      console.error("Erro ao salvar rotina:", e);
      Alert.alert('Erro', 'Não foi possível salvar a rotina.');
    }
  };

  // Retorna para a tela anterior
  const handleCancelRoutine = () => {
    navigation.goBack();
  };

  // Abre o modal de seleção de exercícios
  const handleOpenExerciseSelection = () => {
    setSelectedExercisesForModal([...currentRoutineExercises]); // Clona para evitar mutações diretas
    setSearchQuery(''); // Limpa a busca ao abrir o modal
    setExerciseSelectionModalVisible(true);
  };

  // Alterna a seleção de um exercício no modal
  const handleToggleExerciseSelection = (exercise: Omit<Exercise, 'sets' | 'reps'>) => {
    setSelectedExercisesForModal(prevSelected => {
      const isSelected = prevSelected.some(e => e.id === exercise.id);
      if (isSelected) {
        return prevSelected.filter(e => e.id !== exercise.id);
      } else {
        return [...prevSelected, { ...exercise, sets: '', reps: '' }]; // Adiciona com sets/reps vazios
      }
    });
  };

  // Confirma a seleção de exercícios do modal
  const handleSaveExerciseSelection = () => {
    setCurrentRoutineExercises([...selectedExercisesForModal]);
    setExerciseSelectionModalVisible(false);
  };

  // Cancela a seleção de exercícios no modal
  const handleCancelExerciseSelection = () => {
    setCurrentRoutineExercises(selectedRoutine ? [...selectedRoutine.exercises] : []);
    setExerciseSelectionModalVisible(false);
    setSearchQuery('');
  };

  // Remove um exercício da rotina atual
  const handleRemoveExerciseFromCurrentRoutine = (exerciseId: string) => {
    setCurrentRoutineExercises(prev => prev.filter(e => e.id !== exerciseId));
  };

  // Atualiza séries/repetições de um exercício
  const handleUpdateExerciseSetsReps = (exerciseId: string, field: 'sets' | 'reps', value: string) => {
    setCurrentRoutineExercises(prev =>
      prev.map(ex =>
        ex.id === exerciseId ? { ...ex, [field]: value } : ex
      )
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancelRoutine}>
          <Ionicons name="arrow-back" size={24} color="#888" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {selectedRoutine ? 'Editar Rotina' : 'Nova Rotina'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Nome da Rotina (ex: Treino de Peito)"
          value={routineName}
          onChangeText={setRoutineName}
          autoCapitalize="words"
        />

        <Text style={styles.subtitle}>Exercícios:</Text>
        {currentRoutineExercises.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum exercício adicionado.</Text>
        ) : (
          <FlatList
            data={currentRoutineExercises}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.exerciseItem}>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <View style={styles.setsRepsContainer}>
                  <TextInput
                    style={styles.setsRepsInput}
                    placeholder="Séries"
                    value={item.sets}
                    onChangeText={(text) => handleUpdateExerciseSetsReps(item.id, 'sets', text)}
                    keyboardType="numeric"
                  />
                  <Text style={styles.setsRepsSeparator}>x</Text>
                  <TextInput
                    style={styles.setsRepsInput}
                    placeholder="Reps"
                    value={item.reps}
                    onChangeText={(text) => handleUpdateExerciseSetsReps(item.id, 'reps', text)}
                    keyboardType="default"
                  />
                </View>
                <TouchableOpacity onPress={() => handleRemoveExerciseFromCurrentRoutine(item.id)} style={styles.removeButton}>
                  <Ionicons name="close-circle" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            )}
            scrollEnabled={false}
            contentContainerStyle={{ width: '100%' }}
          />
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleOpenExerciseSelection}>
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Adicionar Exercícios</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelRoutine}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveRoutine}>
          <Text style={styles.saveButtonText}>
            {selectedRoutine ? 'Salvar Edição' : 'Salvar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ExerciseSelectionModal
        isVisible={exerciseSelectionModalVisible}
        searchQuery={searchQuery}
        selectedExercisesForModal={selectedExercisesForModal}
        onClose={handleCancelExerciseSelection}
        onConfirm={handleSaveExerciseSelection}
        onSearchChange={setSearchQuery}
        onToggleExerciseSelection={handleToggleExerciseSelection}
        availableExercises={MOCK_AVAILABLE_EXERCISES}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 40,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#555',
    marginBottom: 10,
  },
  emptyText: {
    color: '#777',
    marginBottom: 15,
    textAlign: 'center',
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  exerciseName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  setsRepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setsRepsInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#333',
    width: 60,
    textAlign: 'center',
    marginRight: 5,
  },
  setsRepsSeparator: {
    color: '#555',
    marginRight: 5,
  },
  removeButton: {
    padding: 5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#541cb6', // Roxo
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 20,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: '500',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '500',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#541cb6', // Roxo mais claro
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddEditRoutineScreen;
