import React, { useState } from "react";
import {
  Text,
  View,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert, // Importar Alert para feedback ao usuário
  ActivityIndicator, // Importar ActivityIndicator para o estado de carregamento
  KeyboardAvoidingView, // Importar KeyboardAvoidingView para evitar que o teclado cubra os inputs
  Platform, // Importar Platform para ajustes específicos de SO
} from 'react-native';
import { AntDesign } from '@expo/vector-icons'; // Importar ícone do Google
import { useNavigation, type NavigationProp } from '@react-navigation/native'; // Importar useNavigation e NavigationProp
import { SafeAreaView } from 'react-native-safe-area-context'; // Importar SafeAreaView

// Certifique-se de que o caminho para sua imagem de logo está correto.
// Se 'guf.png' estiver na pasta 'assets' diretamente no seu projeto,
// o caminho pode ser '../assets/guf.png' ou 'assets/guf.png' dependendo da estrutura.
// Para este exemplo, vou assumir que 'Logo' é um caminho válido.
import Logo from '../assets/logoguf.png';

// --- INÍCIO: Adição de Tipagem para React Navigation ---
// Define os tipos para as rotas e seus parâmetros
// 'undefined' significa que a rota não espera nenhum parâmetro
// 'MainApp' será a rota que encapsula o BottomTabNavigator
export type RootStackParamList = {
  Login: undefined;
  MainApp: { screen: 'Treinos' | 'Feed' | 'Conta' }; // MainApp agora espera um parâmetro 'screen'
  // Adicione outras rotas aqui
};

// Define o tipo para o hook useNavigation
type LoginScreenNavigationProp = NavigationProp<RootStackParamList, 'Login'>;
// --- FIM: Adição de Tipagem para React Navigation ---

// Dados mockados para simular um usuário válido
const MOCK_USER = 'usuario@example.com';
const MOCK_PASSWORD = 'senha123';

const styles = StyleSheet.create({
  // O container principal agora é o SafeAreaView
  safeAreaContainer: {
    flex: 1,
    // Adicionado backgroundColor para garantir que o fundo ocupe todo o espaço
    backgroundColor: '#f8f8f8',
  },
  // O container interno para centralizar o conteúdo e padding
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // Centraliza o conteúdo verticalmente
    padding: 20,
  
  },
  top: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 90,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24, // Aumenta o tamanho da fonte para melhor visibilidade
    fontWeight: 'bold', // Deixa o texto em negrito
    color: '#000', // Cor mais escura para o texto
    textAlign: 'center',
    marginTop: 5,
  },
 
  input: {
    width: '100%',
    height: 50, // Aumenta a altura para melhor toque
    borderRadius: 8, // Bordas mais arredondadas
    marginTop: 10,
    paddingHorizontal: 15, // Mais padding interno
    backgroundColor: '#00000010', // Fundo branco para os inputs
    fontSize: 16, // Tamanho da fonte do input
  },
  loginButton: {
    backgroundColor: '#541cb6',
    paddingVertical: 15, // Aumenta o padding para melhor toque
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center', // Centraliza o conteúdo (texto ou loading)
    marginTop: 20, // Espaçamento superior
  },

  loginButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 18, // Aumenta o tamanho da fonte
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 12, // Ajusta o padding
    width: '100%',
    justifyContent: 'center',
    marginTop: 10, // Mais espaçamento superior
    backgroundColor: '#00000010',
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#555', // Cor mais suave para o texto
    fontWeight: '500', // Peso da fonte
  },
  forgotPasswordText: {
    marginTop: 5,
    color: '#541cb6',
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  signupText: {
    color: '#333',
    marginRight: 8,
  },
  signupLink: {
    color: '#541cb6',
    fontWeight: 'bold',
  },
  // Estilos para a sobreposição de carregamento
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject, // Preenche a tela inteira
    backgroundColor: 'rgba(255, 255, 255, 0.93)', // Fundo semi-transparente branco
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Garante que fique acima de outros elementos
  },
});

export default function Login() {
  const [login, setLogin] = useState('usuario@example.com');
  const [password, setPassword] = useState('senha123');
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar o carregamento
  // Usa o tipo definido para o hook useNavigation
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleLogin = async () => {
    setIsLoading(true); // Inicia o estado de carregamento
    try {
      // Simula uma chamada de API com um atraso de 2 segundos
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Lógica de autenticação mockada
      if (login === MOCK_USER && password === MOCK_PASSWORD) {
        // ESSA É A LINHA CRÍTICA: NAVEGAR PARA 'MainApp' E ESPECIFICAR A TELA 'Treinos' DENTRO DELA
        navigation.navigate('MainApp', { screen: 'Treinos' });
      } else {
        Alert.alert('Erro', 'Credenciais inválidas. Verifique seu usuário e senha.');
      }
    } catch (error) {
      console.error("Erro durante o login:", error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false); // Finaliza o estado de carregamento, independentemente do resultado
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true); // Inicia o estado de carregamento para o login com Google
    try {
      // Simula uma chamada de API para login com Google
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Google Login', 'Simulando login com o Google...');
      // Se o login com Google também levar para as abas, use a mesma lógica
      // navigation.navigate('MainApp', { screen: 'Feed' }); // Exemplo: ir para a aba Feed
    } catch (error) {
      console.error("Erro durante o login com Google:", error);
      Alert.alert('Erro', 'Não foi possível fazer login com o Google. Tente novamente.');
    } finally {
      setIsLoading(false); // Finaliza o estado de carregamento
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Esqueceu a Senha?', 'Funcionalidade para recuperar senha em desenvolvimento.');
    // Em uma aplicação real, você navegaria para uma tela de recuperação de senha
  };

  return (
    // SafeAreaView como o contêiner principal para respeitar as áreas seguras
    <SafeAreaView style={styles.safeAreaContainer}>
      <KeyboardAvoidingView
        style={styles.contentContainer} // Aplica o estilo de conteúdo ao KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.top}>
          <Image source={Logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.welcomeText}>Bem-vindo de volta ao seu espaço de evolução.</Text>
         
        </View>

        <TextInput
          style={styles.input}
          placeholder="E-mail ou Usuário"
          value={login}
          onChangeText={setLogin}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading} // Desabilita input durante o carregamento
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          editable={!isLoading} // Desabilita input durante o carregamento
        />

      <View style={{ width: '100%', alignItems: 'flex-end' }}>
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading} // Desabilita botão durante o carregamento
        >
          <Text style={styles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          disabled={isLoading} // Desabilita botão durante o carregamento
        >
          <AntDesign name="google" size={24} color="#EA4335" style={styles.googleIcon} />
          <Text style={styles.googleButtonText}>Logar com o Google</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Não possui conta?</Text>
            <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.signupLink}>Cadastre-se</Text>
            </TouchableOpacity>
        </View>

        {/* Sobreposição de carregamento em tela cheia */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#541cb6" />
            <Text style={{ marginTop: 10, fontSize: 16, color: '#541cb6' }}>Carregando...</Text>
          </View>
        )}
      </KeyboardAvoidingView>
      
    </SafeAreaView>
  );
}
