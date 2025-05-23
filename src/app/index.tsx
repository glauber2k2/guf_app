import React from "react";
import "../../global.css";

import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./navigation/AppNavigator";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";

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

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
