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
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "../../../assets/guf.png";

import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../../shared/types";

type Props = StackScreenProps<RootStackParamList, "Login">;

export default function Login({ navigation }: Props) {
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
      // navigation.replace('MainApp'); // Se necessário, direciona para a tela principal
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
    <SafeAreaView style={styles.safeAreaContainer}>
      <KeyboardAvoidingView
        style={styles.contentContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.top}>
          <Image source={Logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.welcomeText}>
            Bem-vindo de volta ao seu espaço de evolução.
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="E-mail ou Usuário"
          value={login}
          onChangeText={setLogin}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
        />

        <View style={{ width: "100%", alignItems: "flex-end" }}>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          <AntDesign
            name="google"
            size={24}
            color="#EA4335"
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Logar com o Google</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Não possui conta?</Text>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.signupLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#541cb6" />
            <Text style={{ marginTop: 10, fontSize: 16, color: "#541cb6" }}>
              Carregando...
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  top: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 90,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginTop: 5,
  },
  input: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 15,
    backgroundColor: "#00000010",
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#541cb6",
    paddingVertical: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  loginButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 18,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 12,
    width: "100%",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: "#00000010",
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
  },
  forgotPasswordText: {
    marginTop: 5,
    color: "#541cb6",
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  signupText: {
    color: "#333",
    marginRight: 8,
  },
  signupLink: {
    color: "#541cb6",
    fontWeight: "bold",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.93)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
});
