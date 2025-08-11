import React from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SwipeListView } from "react-native-swipe-list-view";

type SetData = {
  setNumber: number;
  previousReps?: string;
  previousKg?: string;
  kg: string;
  reps: string;
};

type ExerciseItem = {
  id: string;
  name: string;
  imageUrl?: string;
  notes: string;
  setsData: SetData[];
};

type SeriesListProps = {
  item: ExerciseItem;
  handleUpdateNotes: (exId: string, text: string) => void;
  handleUpdateSetData: (
    exId: string,
    setIndex: number,
    field: "kg" | "reps",
    value: string
  ) => void;
  handleDeleteSet: (exId: string, setIndex: number) => void;
  handleAddSet: (exId: string) => void;
};

export default function SeriesList({
  item,
  handleUpdateNotes,
  handleUpdateSetData,
  handleDeleteSet,
  handleAddSet,
}: SeriesListProps) {
  return (
    <View className="dark:bg-zinc-900 bg-zinc-200 p-4 rounded-3xl mb-3">
      <View className="flex-row items-center gap-4 mb-3">
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            className="w-14 h-14 bg-zinc-400 rounded-2xl"
          />
        ) : (
          <View className="w-14 h-14 bg-zinc-400 rounded-2xl" />
        )}
        <Text className="text-2xl font-bold dark:text-zinc-300">
          {item.name}
        </Text>
        <TouchableOpacity className="ml-auto">
          <Ionicons name="ellipsis-horizontal" size={24} color="#a1a1aa" />
        </TouchableOpacity>
      </View>

      <TextInput
        className="dark:text-zinc-200 mb-4"
        placeholder="Adicionar anotações ou descrição..."
        placeholderTextColor="grey"
        multiline
        value={item.notes}
        onChangeText={(text) => handleUpdateNotes(item.id, text)}
      />

      <View className="justify-between flex-row py-2 px-8 border-b dark:border-zinc-800 border-zinc-300 mb-2">
        <Text className="dark:text-zinc-200 font-bold text-lg w-1/4">S</Text>
        <Text className="dark:text-zinc-200 font-bold text-lg w-1/4 text-center">
          Anterior
        </Text>
        <Text className="dark:text-zinc-200 font-bold text-lg w-1/4 text-center">
          Kg
        </Text>
        <Text className="dark:text-zinc-200 font-bold text-lg w-1/4 text-center">
          Reps
        </Text>
      </View>

      <SwipeListView
        data={item.setsData}
        keyExtractor={(set, index) =>
          `${item.id}-set-${set.setNumber}-${index}`
        }
        renderItem={({ item: set, index: setIndex }) => (
          <View
            className={`justify-between flex-row py-2 px-8 items-center ${
              setIndex % 2 === 1
                ? "dark:bg-zinc-800 bg-zinc-300"
                : "dark:bg-zinc-900 bg-zinc-200"
            }`}
          >
            <Text className="dark:text-zinc-400 text-lg w-1/4">
              {set.setNumber}.
            </Text>
            <Text className="dark:text-zinc-400 text-lg text-center w-1/4">
              {set.previousReps || set.previousKg
                ? `${set.previousReps || "N/A"} x ${set.previousKg || "0"}kg`
                : "N/A"}
            </Text>
            <TextInput
              multiline
              numberOfLines={1}
              className="dark:text-zinc-400 text-lg text-center w-1/4"
              placeholder="0"
              placeholderTextColor="#999"
              value={set.kg}
              onChangeText={(text) =>
                handleUpdateSetData(item.id, setIndex, "kg", text)
              }
              keyboardType="numeric"
            />
            <TextInput
              multiline
              numberOfLines={1}
              className="dark:text-zinc-400 text-lg text-center w-1/4"
              placeholder="0"
              placeholderTextColor="#999"
              value={set.reps}
              onChangeText={(text) =>
                handleUpdateSetData(item.id, setIndex, "reps", text)
              }
              keyboardType="numeric"
            />
          </View>
        )}
        renderHiddenItem={({ item: set, index: setIndex }) => (
          <View className="mb-[0.1] bg-red-500 overflow-hidden">
            <TouchableOpacity
              className="flex-row h-full items-center justify-end px-6"
              onPress={() => handleDeleteSet(item.id, setIndex)}
            >
              <Ionicons name="trash-bin" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
        disableRightSwipe={true}
        rightOpenValue={-75}
        tension={40}
        friction={10}
        swipeToOpenPercent={10}
        swipeToClosePercent={10}
      />

      <TouchableOpacity
        className="dark:bg-zinc-800 bg-zinc-300 mt-4 rounded-full items-center flex-row justify-center gap-2 p-4"
        onPress={() => handleAddSet(item.id)}
      >
        <Ionicons
          name="add-circle-outline"
          size={28}
          className="dark:text-violet-500 text-violet-700"
        />
        <Text className="dark:text-violet-500 text-violet-700 text-xl font-bold">
          Adicionar Série
        </Text>
      </TouchableOpacity>
    </View>
  );
}
