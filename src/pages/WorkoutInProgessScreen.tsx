import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';

// Importa os tipos necessários
import { Exercise, Routine, RootStackParamList } from '../types';

// Define o tipo para as props da rota desta tela
type WorkoutInProgressScreenRouteProp = RouteProp<RootStackParamList, 'WorkoutInProgress'>;

const WorkoutInProgressScreen: React.FC = () => {
  const route = useRoute<WorkoutInProgressScreenRouteProp>();
  const navigation = useNavigation();
  // A rotina selecionada é passada via parâmetros da rota
  const { selectedRoutine } = route.params;

  // Estado para armazenar os exercícios do treino atual, permitindo modificação
  const [workoutExercises, setWorkoutExercises] = useState<Exercise[]>([]);

  // Estados para o cronômetro
  const [elapsedTime, setElapsedTime] = useState(0); // Tempo decorrido em segundos
  const [timerRunning, setTimerRunning] = useState(true); // Começa como true para iniciar automaticamente
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Referência para o setInterval

  // Inicializa os exercícios do treino e limpa o timer ao montar/desmontar
  useEffect(() => {
    if (selectedRoutine) {
      // Cria uma cópia profunda dos exercícios, mas com sets/reps vazios para o input,
      // e os valores originais como placeholders.
      setWorkoutExercises(selectedRoutine.exercises.map(ex => ({
        ...ex,
        // Mantemos os valores originais aqui, mas eles serão usados como placeholders
        // O usuário preencherá os novos valores no TextInput
        sets: '', // Limpa o valor inicial para o input
        reps: '', // Limpa o valor inicial para o input
      })));
    }

    // Função de limpeza para parar o timer ao desmontar o componente
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [selectedRoutine]); // Dependência na rotina selecionada para re-inicializar se mudar

  // Lógica do cronômetro: inicia/pausa/reseta o intervalo
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000); // Atualiza a cada segundo
    } else {
      // Limpa o intervalo se o timer não estiver rodando
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    // Função de limpeza para garantir que o intervalo seja limpo quando timerRunning muda
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerRunning]); // Dependência no estado timerRunning

  // Formata o tempo para exibir HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .map(unit => String(unit).padStart(2, '0')) // Adiciona zero à esquerda se for menor que 10
      .join(':');
  };

  // Inicia ou pausa o cronômetro
  const handleStartStopTimer = () => {
    setTimerRunning(prev => !prev);
  };

  // Reseta o cronômetro para zero
  const handleResetTimer = () => {
    setTimerRunning(false);
    setElapsedTime(0);
  };

  // Atualiza as séries ou repetições de um exercício específico
  const handleUpdateExerciseSetsReps = (exerciseId: string, field: 'sets' | 'reps', value: string) => {
    setWorkoutExercises(prevExercises =>
      prevExercises.map(ex =>
        ex.id === exerciseId ? { ...ex, [field]: value } : ex // Atualiza o campo específico
      )
    );
  };

  // Lida com a conclusão do treino
  const handleFinishWorkout = () => {
    Alert.alert(
      'Concluir Treino',
      'Deseja realmente concluir este treino?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Concluir',
          onPress: () => {
            // Aqui você pode adicionar lógica para salvar os dados do treino,
            // como as séries/repetições preenchidas, o tempo total, etc.
            // Os valores preenchidos estarão em `workoutExercises`
            Alert.alert('Treino Concluído', 'Seu treino foi registrado!');
            navigation.goBack(); // Volta para a tela anterior
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
     
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedRoutine?.name || 'Treino'}</Text>
        <View style={{ width: 24 }} /> 
      </View>

     
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
        <View style={styles.timerControls}>
          <TouchableOpacity style={styles.timerButton} onPress={handleStartStopTimer}>
            <Ionicons name={timerRunning ? 'pause' : 'play'} size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.timerButton} onPress={handleResetTimer}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

     
      <FlatList
        data={workoutExercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.exerciseItem}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <View style={styles.setsRepsInputContainer}>
              <TextInput
                style={styles.setsRepsInput}
                placeholder={`${selectedRoutine?.exercises.find(ex => ex.id === item.id)?.sets || ''}`} // Apenas o número como placeholder
                placeholderTextColor="#999"
                value={item.sets} // O valor digitado pelo usuário
                onChangeText={(text) => handleUpdateExerciseSetsReps(item.id, 'sets', text)}
                keyboardType="numeric"
              />
              <Text style={styles.setsRepsSeparator}>x</Text>
              <TextInput
                style={styles.setsRepsInput}
                placeholder={`${selectedRoutine?.exercises.find(ex => ex.id === item.id)?.reps || ''}`} // Apenas o número como placeholder
                placeholderTextColor="#999"
                value={item.reps} // O valor digitado pelo usuário
                onChangeText={(text) => handleUpdateExerciseSetsReps(item.id, 'reps', text)}
                keyboardType="default"
              />
            </View>
          </View>
        )}
        contentContainerStyle={styles.exerciseListContent}
      />

    
      <TouchableOpacity style={styles.finishButton} onPress={handleFinishWorkout}>
        <Text style={styles.finishButtonText}>Concluir Treino</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Estilos para a tela
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Fundo cinza claro, padrão Google
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  timerContainer: {
    backgroundColor: '#6200ee', // Roxo profundo, cor primária do Material Design
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  timerControls: {
    flexDirection: 'row',
    gap: 16, // Espaçamento entre os botões do timer
  },
  timerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)', // Fundo semi-transparente para os botões do timer
    padding: 12,
    borderRadius: 50, // Botão circular
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  exerciseListContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1, // Permite que o nome do exercício ocupe o espaço disponível
    marginRight: 10,
  },
  setsRepsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setsRepsInput: {
    backgroundColor: '#f5f5f5', // Cinza mais claro para o fundo do input
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#333',
    width: 70, // Largura fixa para os inputs
    textAlign: 'center',
  },
  setsRepsSeparator: {
    fontSize: 16,
    color: '#555',
    marginHorizontal: 8,
    fontWeight: 'bold',
  },
  finishButton: {
    backgroundColor: '#000', // Verde-azulado, cor secundária do Material Design
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  finishButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WorkoutInProgressScreen;
