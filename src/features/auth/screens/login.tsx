import React, { useState } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { Dimensions } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "../../../assets/logoguf.png";

import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../../shared/types";
import { useColorScheme } from "nativewind";

type Props = StackScreenProps<RootStackParamList, "Login">;

export default function Login({ navigation }: Props) {
  const screenHeight = Dimensions.get("screen").height;
  const { colorScheme } = useColorScheme();

  const [login, setLogin] = useState("usuario@example.com");
  const [password, setPassword] = useState("senha123");
  const [isLoading, setIsLoading] = useState(false);

  const MOCK_USER = "usuario@example.com";
  const MOCK_PASSWORD = "senha123";

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (login === MOCK_USER && password === MOCK_PASSWORD) {
        navigation.replace("MainTab");
      } else {
        Alert.alert(
          "Erro",
          "Credenciais inválidas. Verifique seu usuário e senha."
        );
      }
    } catch (error) {
      console.error("Erro durante o login:", error);
      Alert.alert("Erro", "Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert("Google Login", "Simulando login com o Google...");
    } catch (error) {
      console.error("Erro durante o login com Google:", error);
      Alert.alert(
        "Erro",
        "Não foi possível fazer login com o Google. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Esqueceu a Senha?",
      "Funcionalidade para recuperar senha em desenvolvimento."
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-200 dark:bg-zinc-900 pb-6">
      <KeyboardAvoidingView
        className="flex-1 items-center justify-end px-6 "
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View className="items-center mb-6 w-full ">
          <Image
            source={Logo}
            className="w-[180] h-[120] mb-6"
            resizeMode="contain"
          />
          <Text className="text-2xl font-bold text-center w-2/3 dark:text-zinc-400">
            Bem-vindo ao seu espaço de evolução.
          </Text>
        </View>

        <TextInput
          className="w-full dark:bg-white/5 dark:text-zinc-100 bg-black/5 py-4 px-6 rounded-full mb-4"
          placeholder="E-mail ou Usuário"
          value={login}
          onChangeText={setLogin}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
        />

        <TextInput
          className="w-full dark:bg-white/5 dark:text-zinc-100 bg-black/5 py-4 px-6 rounded-full text-black"
          placeholder="Senha"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
        />

        <View
          className="flex-row mt-8 gap-4 ml-auto "
          style={{ marginBottom: screenHeight * 0.2 }}
        >
          <TouchableOpacity
            className="dark:bg-zinc-800 bg-black/5 flex-row gap-2 p-4 rounded-full"
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <AntDesign
              name="google"
              size={22}
              color={colorScheme == "dark" ? "white" : "black"}
            />
            <Text className="dark:text-zinc-50">Logar com o Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center gap-2 bg-violet-800 p-4 ml-auto  rounded-full"
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text className="text-zinc-50 font-bold">Entrar</Text>
            <Ionicons name="arrow-forward" size={22} color={"white"} />
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-2 ">
          <Text className="dark:text-zinc-50">Não possui conta?</Text>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text className="text-violet-700 font-bold">Cadastre-se</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text className="mt-2 dark:text-zinc-500">Esqueceu a senha?</Text>
        </TouchableOpacity>

        {isLoading && (
          <View className="bg-zinc-50 dark:bg-zinc-900 justify-center items-center z-50 absolute left-0 bottom-0 top-0 right-0">
            <Image
              source={Logo}
              className="w-[180] h-[120] mb-6"
              resizeMode="contain"
            />
            <ActivityIndicator size="large" color="#541cb6" />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
