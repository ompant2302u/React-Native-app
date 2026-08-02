// App.js — start of Day 5
//
// Deliberately unstyled. This is the "before" picture.
// By the end of Day 5 this screen looks like a real app.

import { Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ListScreen from "./src/components/ListScreen";
import { ThemeProvider } from "./src/contexts/ThemeContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ListScreen />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
