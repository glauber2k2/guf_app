import React, { useEffect } from "react";
import "../../global.css";

import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { initDatabase } from "../db/database";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  // Configuração para NativeWind funcionar com Ionicons
  cssInterop(Ionicons, {
    className: {
      target: "style",
      nativeStyleToProp: {
        height: "size",
        width: "size",
        fontSize: "size",
      },
    },
  });

  // Efeito para inicializar o banco de dados local
  useEffect(() => {
    initDatabase().catch((err: any) =>
      console.error("Falha ao inicializar o DB", err)
    );
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
