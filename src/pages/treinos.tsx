import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  ActivityIndicator,
  Modal,
  LayoutAnimation, // Importar LayoutAnimation
  Platform,        // Importar Platform
  UIManager,       // Importar UIManager
  StyleSheet,      // Importar StyleSheet para estilos locais
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, type NavigationProp, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importa os novos componentes e tipos/constantes
import RoutineCard from '../components/RoutineCard';

import { Exercise, Routine, RootStackParamList } from '../types';
import { STORAGE_KEY } from '../constants';
import { globalStyles } from '../styles';

// Habilita as animações de layout (necessário para Android)
// Isso permite que o LayoutAnimation funcione corretamente.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TreinosScreenNavigationProp = NavigationProp<RootStackParamList, 'Treinos'>;

export default function TreinosScreen() {
  const navigation = useNavigation<TreinosScreenNavigationProp>();
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Estado para controlar a expansão do collapsible das rotinas
  const [isRoutinesExpanded, setIsRoutinesExpanded] = useState(true); // Começa expandido por padrão

  // Função para carregar as rotinas do AsyncStorage
  // Usamos useFocusEffect para garantir que as rotinas sejam recarregadas
  // sempre que a tela de Treinos for focada (útil após salvar/cancelar na tela de edição)
  useFocusEffect(
    useCallback(() => {
      const loadRoutines = async () => {
        try {
          setIsLoading(true);
          const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
          if (jsonValue != null) {
            const parsedRoutines = JSON.parse(jsonValue);
            const sanitizedRoutines: Routine[] = Array.isArray(parsedRoutines)
              ? parsedRoutines.map((routine: any) => ({
                  ...routine,
                  exercises: Array.isArray(routine.exercises) ? routine.exercises : [],
                }))
              : [];
            setRoutines(sanitizedRoutines);
          } else {
            setRoutines([]);
          }
        } catch (e) {
          console.error("Erro ao carregar rotinas do AsyncStorage:", e);
          Alert.alert('Erro', 'Não foi possível carregar suas rotinas salvas.');
          setRoutines([]);
        } finally {
          setIsLoading(false);
        }
      };
      loadRoutines();
    }, [])
  );

  // Função para salvar as rotinas no AsyncStorage
  // Esta função é chamada apenas quando 'routines' ou 'isLoading' mudam,
  // garantindo que os dados sejam persistidos após alterações.
  useEffect(() => {
    if (!isLoading) {
      const saveRoutines = async (currentRoutines: Routine[]) => {
        try {
          const jsonValue = JSON.stringify(currentRoutines);
          await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
        } catch (e) {
          console.error("Erro ao salvar rotinas no AsyncStorage:", e);
          Alert.alert('Erro', 'Não foi possível salvar suas rotinas.');
        }
      };
      saveRoutines(routines);
    }
  }, [routines, isLoading]);

  /**
   * Inicia um novo treino.
   * Por enquanto, apenas exibe um alerta.
   */
  const handleNewWorkout = () => {
    Alert.alert('Novo Treino', 'Iniciando um novo treino!');
  };

  /**
   * Navega para a tela de criação de nova rotina.
   * Passa `selectedRoutine: null` para indicar que é uma nova rotina.
   */
  const handleAddRoutine = () => {
    navigation.navigate('AddEditRoutine', { selectedRoutine: null });
  };

  /**
   * Lida com o clique em um cartão de rotina.
   * Agora navega para a tela de treino em andamento.
   * @param routine A rotina selecionada.
   */
  const handleRoutinePress = (routine: Routine) => {
    navigation.navigate('WorkoutInProgress', { selectedRoutine: routine });
  };

  /**
   * Exibe o modal de opções (Editar/Deletar) para uma rotina.
   * @param routine A rotina para a qual as opções serão exibidas.
   */
  const handleOptionsPress = (routine: Routine) => {
    setSelectedRoutine(routine);
    setOptionsModalVisible(true);
  };

  /**
   * Navega para a tela de edição de rotina.
   * Passa a rotina selecionada para preencher os campos na tela de edição.
   */
  const handleEditOption = () => {
    setOptionsModalVisible(false); // Fecha o modal de opções
    if (selectedRoutine) {
      navigation.navigate('AddEditRoutine', { selectedRoutine });
    }
  };

  /**
   * Lida com a exclusão de uma rotina.
   * Exibe um alerta de confirmação antes de excluir.
   */
  const handleDeleteOption = () => {
    setOptionsModalVisible(false); // Fecha o modal de opções
    if (selectedRoutine) {
      Alert.alert(
        'Confirmar Exclusão',
        `Tem certeza que deseja excluir a rotina "${selectedRoutine.name}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            onPress: () => {
              // Filtra a rotina a ser excluída da lista de rotinas
              setRoutines(prevRoutines => prevRoutines.filter(r => r.id !== selectedRoutine.id));
              setSelectedRoutine(null); // Limpa a rotina selecionada
              // Aplica a animação de layout na exclusão
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            },
            style: 'destructive',
          },
        ],
        { cancelable: false }
      );
    }
  };

  /**
   * Alterna a visibilidade do collapsible de rotinas.
   * Aplica uma animação suave ao expandir/recolher.
   */
  const toggleRoutinesVisibility = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsRoutinesExpanded(!isRoutinesExpanded);
  };

  // Exibe um indicador de carregamento enquanto as rotinas estão sendo carregadas
  if (isLoading) {
    return (
      <SafeAreaView style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#541cb6" />
        <Text style={globalStyles.loadingText}>Carregando suas rotinas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', paddingBottom: 20 }}
      >
        <View style={globalStyles.header}>
          <Text style={globalStyles.title}>Seus Treinos</Text>
          <Text style={globalStyles.subtitle}>Gerencie suas rotinas e comece a treinar!</Text>
        </View>

        {/* Botão "Iniciar Novo Treino" - Fora do collapsible */}
        <TouchableOpacity style={globalStyles.newWorkoutButton} onPress={handleNewWorkout}>
          <Ionicons name="play-outline" size={24} color="white" />
          <Text style={globalStyles.newWorkoutButtonText}>Iniciar Novo Treino</Text>
        </TouchableOpacity>

      
      

          
            <View style={{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}> 
              
              <TouchableOpacity style={styles.collapsibleHeader} onPress={toggleRoutinesVisibility}>
                <Ionicons
                 name={isRoutinesExpanded ? 'caret-down-outline' : 'caret-forward-outline'}
                 size={20}
                 color="#555"
                 style={styles.collapsibleArrow}
            />
              <Text style={styles.collapsibleTitle}>Minhas Rotinas</Text>
            </TouchableOpacity>

            <TouchableOpacity style={globalStyles.addRoutineButton} onPress={handleAddRoutine}>
            <Ionicons name="add" size={20} color="black" />
           
        </TouchableOpacity>
          </View>
          
          {isRoutinesExpanded && (
            <View>
              {routines.length === 0 ? (
                <Text style={styles.emptyRoutinesText}>
                  Nenhuma rotina cadastrada ainda. Crie uma!
                </Text>
              ) : (
                <FlatList
                  data={routines}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <RoutineCard
                      routine={item}
                      onPress={handleRoutinePress}
                      onOptionsPress={handleOptionsPress}
                    />
                  )}
                  scrollEnabled={false} // Desabilita o scroll da FlatList para que o ScrollView pai gerencie
                />
              )}
            </View>
          )}
       

        {/* Modal para Opções da Rotina (Editar/Deletar) - Este modal permanece */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={optionsModalVisible}
          onRequestClose={() => setOptionsModalVisible(false)}
        >
          <View style={globalStyles.centeredView}>
            <View style={globalStyles.optionsModalView}>
              <TouchableOpacity style={globalStyles.optionButton} onPress={handleEditOption}>
                <Text style={globalStyles.optionButtonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.optionButton, globalStyles.optionButtonLast]} onPress={handleDeleteOption}>
                <Text style={globalStyles.optionButtonTextDelete}>Deletar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos específicos para o collapsible
const styles = StyleSheet.create({
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10, // Espaçamento entre o cabeçalho e o conteúdo (quando expandido)
  },
  collapsibleArrow: {
    marginRight: 10,
  },
  collapsibleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  emptyRoutinesText: {
    color: '#777',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 10, // Adiciona um pouco de espaço acima do texto
  },
});
