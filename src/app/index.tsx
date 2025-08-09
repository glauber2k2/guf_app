import React, { useEffect } from "react";
import "../../global.css";

import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { initDatabase } from "../db/database";

export default function App() {
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

  useEffect(() => {
    // Inicializa o banco de dados e cria as tabelas na primeira vez que o app abre.
    initDatabase().catch((err: any) =>
      console.error("Falha ao inicializar o DB", err)
    );
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
