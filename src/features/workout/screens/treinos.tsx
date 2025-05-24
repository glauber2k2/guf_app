import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  ActivityIndicator,
  Modal,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  type NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList, Routine } from "../../../shared/types";
import { STORAGE_KEY } from "../../../shared/constants";
import { globalStyles } from "../../../styles";
import RoutineCard from "../components/RoutineCard";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TreinosScreenNavigationProp = NavigationProp<
  RootStackParamList,
  "Treinos"
>;

export default function TreinosScreen() {
  const navigation = useNavigation<TreinosScreenNavigationProp>();
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
                  exercises: Array.isArray(routine.exercises)
                    ? routine.exercises
                    : [],
                }))
              : [];
            setRoutines(sanitizedRoutines);
          } else {
            setRoutines([]);
          }
        } catch (e) {
          console.error("Erro ao carregar rotinas do AsyncStorage:", e);
          Alert.alert("Erro", "Não foi possível carregar suas rotinas salvas.");
          setRoutines([]);
        } finally {
          setIsLoading(false);
        }
      };
      loadRoutines();
    }, [])
  );

  useEffect(() => {
    if (!isLoading) {
      const saveRoutines = async (currentRoutines: Routine[]) => {
        try {
          const jsonValue = JSON.stringify(currentRoutines);
          await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
        } catch (e) {
          console.error("Erro ao salvar rotinas no AsyncStorage:", e);
          Alert.alert("Erro", "Não foi possível salvar suas rotinas.");
        }
      };
      saveRoutines(routines);
    }
  }, [routines, isLoading]);

  const handleNewWorkout = () => {
    navigation.navigate("WorkoutInProgress", {});
  };

  const handleAddRoutine = () => {
    navigation.navigate("AddEditRoutine", { selectedRoutine: null });
  };

  const handleRoutinePress = (routine: Routine) => {
    navigation.navigate("WorkoutInProgress", { selectedRoutine: routine });
  };

  const handleOptionsPress = (routine: Routine) => {
    setSelectedRoutine(routine);
    setOptionsModalVisible(true);
  };

  const handleEditOption = () => {
    setOptionsModalVisible(false);
    if (selectedRoutine) {
      navigation.navigate("AddEditRoutine", { selectedRoutine });
    }
  };

  const handleDeleteOption = () => {
    setOptionsModalVisible(false);
    if (selectedRoutine) {
      Alert.alert(
        "Confirmar Exclusão",
        `Tem certeza que deseja excluir a rotina "${selectedRoutine.name}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Excluir",
            onPress: () => {
              setRoutines((prevRoutines) =>
                prevRoutines.filter((r) => r.id !== selectedRoutine.id)
              );
              setSelectedRoutine(null);
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
            },
            style: "destructive",
          },
        ],
        { cancelable: false }
      );
    }
  };

  if (isLoading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#541cb6" />
        <Text style={globalStyles.loadingText}>Carregando suas rotinas...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-zinc-200 dark:bg-zinc-900 p-6"
      contentContainerStyle={{
        justifyContent: "flex-start",
        paddingBottom: 20,
      }}
    >
      <View className="my-6">
        <Text className="dark:text-zinc-300 text-4xl font-bold text-center">
          Seus Treinos
        </Text>
        <Text className="dark:text-zinc-50 opacity-50 text-center">
          Gerencie suas rotinas e comece a treinar!
        </Text>
      </View>

      <TouchableOpacity
        className="bg-violet-800 p-5 rounded-full flex-row items-center justify-center gap-2"
        onPress={handleNewWorkout}
      >
        <Ionicons name="play-outline" size={24} color="white" />
        <Text className="text-zinc-50 text-xl font-bold">
          Iniciar Novo Treino
        </Text>
      </TouchableOpacity>

      <View className="mt-10 flex-row justify-between">
        <Text className="dark:text-zinc-300 font-medium text-xl mb-2">
          Minhas Rotinas
        </Text>
        <TouchableOpacity onPress={handleAddRoutine}>
          <Ionicons name="add" size={20} color="grey" />
        </TouchableOpacity>
      </View>

      {!routines.length === 0 ? (
        <Text style={styles.emptyRoutinesText}>
          Nenhuma rotina cadastrada ainda. Crie uma!
        </Text>
      ) : (
        <FlatList
          data={routines}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RoutineCard
              routine={item as any}
              onPress={handleRoutinePress}
              onStartPress={handleRoutinePress}
              onOptionsPress={handleOptionsPress}
            />
          )}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalRoutineList}
        />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={optionsModalVisible}
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <View style={globalStyles.centeredView}>
          <View style={globalStyles.optionsModalView}>
            <TouchableOpacity
              style={globalStyles.optionButton}
              onPress={handleEditOption}
            >
              <Text style={globalStyles.optionButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[globalStyles.optionButton, globalStyles.optionButtonLast]}
              onPress={handleDeleteOption}
            >
              <Text style={globalStyles.optionButtonTextDelete}>Deletar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  routinesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 20, // Espaçamento superior
  },
  routinesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  horizontalRoutineList: {
    gap: 10,
  },
  emptyRoutinesText: {
    color: "#777",
    marginBottom: 10,
    textAlign: "center",
    marginTop: 10, // Adiciona um pouco de espaço acima do texto
    paddingHorizontal: 16, // Garante que o texto não fique colado nas bordas
  },
});
