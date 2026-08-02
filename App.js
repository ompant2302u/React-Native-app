// App.js — Enhanced Meal-Collection

import "react-native-gesture-handler";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext";
import { CollectionProvider } from "./src/contexts/CollectionContext";
import { ProfileProvider } from "./src/contexts/ProfileContext";
import AppNavigator from "./src/navigation/AppNavigator";

// Inner component so we can read theme for StatusBar + NavigationContainer
function AppContent() {
  const { colors, mode } = useTheme();

  // Spread the full DefaultTheme / DarkTheme so the required `fonts` key is
  // always present — omitting it causes "cannot read property 'regular' of
  // undefined" inside @react-navigation/bottom-tabs.
  const baseTheme = mode === "dark" ? DarkTheme : DefaultTheme;

  const navTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      background: colors.bg,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CollectionProvider>
          <ProfileProvider>
            <AppContent />
          </ProfileProvider>
        </CollectionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
