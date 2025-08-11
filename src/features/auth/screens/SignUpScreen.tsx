import React, { useState } from "react";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";

import Logo from "../../../assets/logoguf.png";

import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../../shared/types"; // Ajuste o caminho se necessário

type Props = StackScreenProps<RootStackParamList, "SignUp">;

export default function SignUpScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignUp() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erro", "Por favor, preencha o e-mail e a senha.");
      return;
    }
    setIsLoading(true);
    try {
      await auth().createUserWithEmailAndPassword(email, password);

      // Após o cadastro, o listener onAuthStateChanged também será acionado,
      // fazendo o login automático. Portanto, não navegamos manualmente.
      // Apenas damos um feedback ao usuário.
      Alert.alert("Sucesso!", "Sua conta foi criada e você já está logado.");
    } catch (error: any) {
      let errorMessage = "Não foi possível criar a conta. Tente novamente.";
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Este endereço de e-mail já está em uso.";
          break;
        case "auth/invalid-email":
          errorMessage = "O formato do e-mail é inválido.";
          break;
        case "auth/weak-password":
          errorMessage = "A senha é muito fraca. Use pelo menos 6 caracteres.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Erro de conexão. Verifique sua internet.";
          break;
      }
      Alert.alert("Erro no Cadastro", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // O resto da sua UI (JSX) permanece o mesmo...
  return (
    <SafeAreaView className="flex-1 bg-zinc-200 dark:bg-zinc-900 pb-6">
      <KeyboardAvoidingView
        className="flex-1 items-center justify-top px-6"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View className="items-center mb-6 w-full">
          <Image
            source={Logo}
            className="w-[180] h-[120] mb-6"
            resizeMode="contain"
          />
          <Text className="text-2xl font-bold text-center w-2/3 dark:text-zinc-400">
            Crie sua conta para começar.
          </Text>
        </View>

        <TextInput
          className="w-full dark:bg-white/5 dark:text-zinc-100 bg-black/5 py-4 px-6 rounded-full mb-4"
          placeholder="Seu melhor e-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
          placeholderTextColor={"#999"}
        />

        <TextInput
          className="w-full dark:bg-white/5 dark:text-zinc-100 bg-black/5 py-4 px-6 rounded-full mb-4"
          placeholder="Crie uma senha forte"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
          placeholderTextColor={"#999"}
        />

        <View className="flex-row mt-8 gap-4 justify-between items-center w-full">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-zinc-500 dark:text-zinc-400">
              Já tenho conta
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 bg-violet-800 p-4 rounded-full w-40"
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text className="text-zinc-50 font-bold">Cadastrar</Text>
                <Ionicons name="arrow-forward" size={22} color={"white"} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
