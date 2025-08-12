import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";

// Importa o hook para acessar os dados do usuário autenticado
import { useAuth } from "../../../contexts/AuthContext";
import { clearLocalData } from "../../../db/database";

export default function ContaScreen() {
  const { user } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Sair da Conta",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await clearLocalData();

              await auth().signOut();

              // A navegação para a tela de login é feita automaticamente pelo listener no AuthContext.
            } catch (error) {
              console.error("Erro ao fazer logout:", error);
              Alert.alert("Erro", "Não foi possível sair da conta.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Função auxiliar para pegar a primeira letra do e-mail para o avatar
  const getInitials = (email: string | null | undefined) => {
    if (!email) return "?";
    return email.charAt(0).toUpperCase();
  };

  console.log(user);

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-zinc-900">
      <View className="p-5 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 items-center">
        <Text className="text-2xl font-bold text-gray-800 dark:text-zinc-100">
          Minha Conta
        </Text>
      </View>

      <View className="items-center p-5">
        <View className="bg-white dark:bg-zinc-800 w-full p-5 rounded-xl items-center shadow-md">
          {user?.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              className="w-24 h-24 rounded-full mb-4 border-2 border-violet-600"
            />
          ) : (
            // Avatar de fallback com as iniciais do usuário
            <View className="w-24 h-24 rounded-full mb-4 border-2 border-violet-600 bg-violet-200 dark:bg-violet-900 justify-center items-center">
              <Text className="text-4xl font-bold text-violet-600 dark:text-violet-300">
                {getInitials(user?.email)}
              </Text>
            </View>
          )}
          <Text className="text-xl font-bold text-gray-800 dark:text-zinc-100 mb-1">
            {user?.displayName || "Usuário"}
          </Text>
          <Text className="text-base text-gray-500 dark:text-zinc-400">
            {user?.email}
          </Text>
        </View>
      </View>

      <View className="mx-5">
        <View className="bg-white dark:bg-zinc-800 rounded-xl shadow-md">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100 dark:border-zinc-700">
            <AntDesign
              name="setting"
              size={22}
              color="#6B7280"
              className="mr-4"
            />
            <Text className="flex-1 text-base text-gray-800 dark:text-zinc-200">
              Configurações da Conta
            </Text>
            <AntDesign name="right" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100 dark:border-zinc-700">
            <AntDesign name="lock" size={22} color="#6B7280" className="mr-4" />
            <Text className="flex-1 text-base text-gray-800 dark:text-zinc-200">
              Privacidade e Segurança
            </Text>
            <AntDesign name="right" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center p-4">
            <AntDesign
              name="questioncircleo"
              size={22}
              color="#6B7280"
              className="mr-4"
            />
            <Text className="flex-1 text-base text-gray-800 dark:text-zinc-200">
              Ajuda e Suporte
            </Text>
            <AntDesign name="right" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-4 p-5">
        <TouchableOpacity
          className="bg-red-500 p-4 rounded-lg items-center justify-center shadow-lg"
          onPress={handleLogout}
        >
          <Text className="text-white font-bold text-lg">Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
