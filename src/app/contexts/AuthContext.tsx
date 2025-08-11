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
}

// Cria o Contexto
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Cria o componente Provedor
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Este listener é chamado sempre que o usuário faz login ou logout
    const subscriber = auth().onAuthStateChanged((userState) => {
      setUser(userState);
      if (initializing) {
        setInitializing(false);
      }
    });

    // Encerra o listener quando o componente é desmontado
    return subscriber;
  }, []);

  return (
    <AuthContext.Provider value={{ user, initializing }}>
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
