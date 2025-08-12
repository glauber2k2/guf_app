import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

// Define o formato dos dados que o contexto irá fornecer
interface AuthContextData {
  user: FirebaseAuthTypes.User | null;
  initializing: boolean; // Para sabermos se o Firebase já verificou o estado inicial
  refreshUser: () => Promise<void>; // Função para atualizar o usuário manualmente
}

// Cria o Contexto
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Cria o componente Provedor
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Listener para login/logout
    const subscriber = auth().onAuthStateChanged((userState) => {
      setUser(userState);
      if (initializing) {
        setInitializing(false);
      }
    });

    // Limpa o listener ao desmontar
    return subscriber;
  }, []);

  // Função para forçar reload do usuário atual e atualizar estado
  const refreshUser = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      await currentUser.reload();
      setUser(auth().currentUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, initializing, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do contexto em outros componentes
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
