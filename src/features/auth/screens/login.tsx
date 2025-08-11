import React, { useState } from "react";
import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Dimensions } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import auth from "@react-native-firebase/auth";
import { useColorScheme } from "nativewind";

import Logo from "../../../assets/logoguf.png";

import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../../shared/types";

type Props = StackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const screenHeight = Dimensions.get("screen").height;
  const { colorScheme } = useColorScheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleSignUp() {
    navigation.navigate("SignUp");
  }

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Atenção", "Por favor, preencha seu e-mail e senha.");
      return;
    }
    setIsLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
      // NENHUMA NAVEGAÇÃO AQUI! O AppNavigator fará isso automaticamente.
    } catch (error: any) {
      let errorMessage = "Ocorreu um erro ao tentar fazer login.";
      switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          errorMessage = "E-mail ou senha inválidos.";
          break;
        case "auth/invalid-email":
          errorMessage = "O formato do e-mail é inválido.";
          break;
        case "auth/user-disabled":
          errorMessage = "Este usuário foi desabilitado.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Erro de conexão. Verifique sua internet.";
          break;
      }
      Alert.alert("Erro de Login", errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      Alert.alert(
        "Esqueceu a Senha?",
        "Por favor, digite seu e-mail no campo correspondente e tente novamente."
      );
      return;
    }
    setIsLoading(true);
    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert(
        "Verifique seu E-mail",
        "Enviamos um link para você redefinir sua senha."
      );
    } catch (error: any) {
      let errorMessage = "Não foi possível enviar o e-mail de redefinição.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "Nenhuma conta encontrada com este e-mail.";
      }
      Alert.alert("Erro", errorMessage);
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
            Bem-vindo ao seu espaço de evolução.
          </Text>
        </View>

        <TextInput
          className="w-full dark:bg-white/5 dark:text-zinc-100 bg-black/5 py-4 px-6 rounded-full mb-4"
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
          placeholderTextColor={"#999"}
        />

        <TextInput
          className="w-full dark:bg-white/5 dark:text-zinc-100 bg-black/5 py-4 px-6 rounded-full"
          placeholder="Senha"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
          placeholderTextColor={"#999"}
        />

        <TouchableOpacity
          className="self-end mt-2 mb-4"
          onPress={handleForgotPassword}
        >
          <Text className="dark:text-zinc-400 text-zinc-600">
            Esqueceu a senha?
          </Text>
        </TouchableOpacity>

        <View className="flex-row w-full mt-4 gap-4 justify-end">
          <TouchableOpacity
            className="dark:bg-zinc-800 bg-black/10 flex-row items-center gap-2 p-4 rounded-full"
            onPress={() =>
              Alert.alert("Em breve", "Login com Google em desenvolvimento.")
            }
            disabled={isLoading}
          >
            <AntDesign
              name="google"
              size={22}
              color={colorScheme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 bg-violet-800 p-4 rounded-full flex-1"
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text className="text-zinc-50 font-bold">Entrar</Text>
                <Ionicons name="arrow-forward" size={22} color={"white"} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View
          className="flex-row gap-2 mt-8"
          style={{ marginBottom: screenHeight * 0.05 }}
        >
          <Text className="dark:text-zinc-50">Não possui conta?</Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text className="text-violet-700 font-bold">Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
