import React from "react";
import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import AppProviders from "./src/AppProviders";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <RootNavigator />
    </AppProviders>
  );
}
