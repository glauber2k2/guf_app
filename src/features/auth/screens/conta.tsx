import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { RootStackParamList } from "../../../shared/types";

type ContaScreenNavigationProp = NavigationProp<RootStackParamList, "MainTab">;

const MOCK_USER_DATA = {
  name: "Glauber Monteiro",
  email: "glauber.monteiro@example.com",
  profilePicture:
    "https://avatars.githubusercontent.com/u/103267667?s=400&u=8fe0b80c48948ddaf1989dac827909d961f091dd&v=4",
};

export default function ContaScreen() {
  const navigation = useNavigation<ContaScreenNavigationProp>();
  const [userData, setUserData] = useState<typeof MOCK_USER_DATA | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simula o carregamento de dados do usuário (futuramente viria de uma API)
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Simula um atraso de rede
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setUserData(MOCK_USER_DATA);
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados do usuário.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Lógica para deslogar o usuário
  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair da sua conta?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          onPress: () => {
            // Em uma aplicação real:
            // 1. Limpar tokens de autenticação (ex: AsyncStorage.clear())
            // 2. Redirecionar para a tela de login
            console.log("Usuário deslogado!");
            navigation.navigate("Login"); // Navega de volta para a tela de Login
          },
        },
      ],
      { cancelable: false }
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#541cb6" />
        <Text style={styles.loadingText}>Carregando dados da conta...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minha Conta</Text>
      </View>

      <View style={styles.profileCard}>
        <Image
          source={{ uri: userData?.profilePicture }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{userData?.name}</Text>
        <Text style={styles.profileEmail}>{userData?.email}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.optionButton}>
          <AntDesign
            name="setting"
            size={24}
            color="#555"
            style={styles.optionIcon}
          />
          <Text style={styles.optionText}>Configurações da Conta</Text>
          <AntDesign name="right" size={18} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton}>
          <AntDesign
            name="lock"
            size={24}
            color="#555"
            style={styles.optionIcon}
          />
          <Text style={styles.optionText}>Privacidade e Segurança</Text>
          <AntDesign name="right" size={18} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionButton}>
          <AntDesign
            name="questioncircleo"
            size={24}
            color="#555"
            style={styles.optionIcon}
          />
          <Text style={styles.optionText}>Ajuda e Suporte</Text>
          <AntDesign name="right" size={18} color="#999" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Sair</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "#f0f2f5", // Fundo claro para a tela
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#541cb6",
  },
  header: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  profileCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#541cb6",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionIcon: {
    marginRight: 15,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  logoutButton: {
    backgroundColor: "#e74c3c", // Cor de destaque para o botão de sair
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});
