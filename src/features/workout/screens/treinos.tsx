// features/workout/screens/treinos.tsx

import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { StackScreenProps } from "@react-navigation/stack";

import React, { useState, useCallback, useEffect } from "react";
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
  RootStackParamList,
  BottomTabParamList,
  Routine,
} from "../../../shared/types"; // ajuste o caminho se necessário
import { globalStyles } from "../../../styles";
import RoutineCard from "../components/RoutineCard";

import * as RoutineService from "../../../services/RoutineService"; // import corrigido para o service

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TreinosScreenProps = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, "Treinos">,
  StackScreenProps<RootStackParamList>
>;

export default function TreinosScreen({
  navigation,
  route,
}: TreinosScreenProps) {
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadRoutines = useCallback(async () => {
    try {
      if (!isLoading) setIsLoading(true);
      const routinesFromDb = await RoutineService.getAllRoutines();
      // Não precisa de JSON.parse, pois já vem no formato correto
      setRoutines(routinesFromDb);
    } catch (e) {
      console.error("Erro ao carregar rotinas do Firestore:", e);
      Alert.alert("Erro", "Não foi possível carregar suas rotinas.");
      setRoutines([]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadRoutines();
    });

    return unsubscribe;
  }, [navigation, loadRoutines]);

  const handleDeleteRoutine = async (id: string) => {
    try {
      await RoutineService.deleteRoutine(id);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setRoutines((prev) => prev.filter((r) => r.id !== id));
      setSelectedRoutine(null);
    } catch (e) {
      console.error("Erro ao deletar rotina:", e);
      Alert.alert("Erro", "Não foi possível deletar a rotina.");
    }
  };

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
            onPress: () => handleDeleteRoutine(selectedRoutine.id),
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
        paddingBottom: 100,
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

      <View className="mt-10 flex-row justify-between items-center">
        <Text className="dark:text-zinc-300 font-medium text-xl mb-2">
          Minhas Rotinas
        </Text>
        <TouchableOpacity onPress={handleAddRoutine} className="p-2">
          <Ionicons name="add" size={24} color="grey" />
        </TouchableOpacity>
      </View>

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
              onPress={() => handleRoutinePress(item)}
              onStartPress={() => handleRoutinePress(item)}
              onOptionsPress={() => handleOptionsPress(item)}
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
    marginTop: 20,
  },
  routinesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  horizontalRoutineList: {
    gap: 10,
    paddingVertical: 10,
  },
  emptyRoutinesText: {
    color: "#777",
    marginBottom: 10,
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 16,
  },
});
