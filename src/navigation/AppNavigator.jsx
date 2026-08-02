// src/navigation/AppNavigator.jsx
//
// Bottom tab navigator. The tab bar itself is pushed above the system
// navigation bar by react-navigation's built-in safe area handling.
// Individual tab screens only guard the TOP edge — the bottom is handled
// here at the navigator level so we never double-count insets.

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

import HomeScreen      from "../screens/HomeScreen";
import MealDetailScreen from "../screens/MealDetailScreen";
import FavouritesScreen from "../screens/FavouritesScreen";
import SearchScreen    from "../screens/SearchScreen";
import ProfileScreen   from "../screens/ProfileScreen";
import AddMealScreen   from "../screens/AddMealScreen";

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Stack wrappers (one per tab that needs a detail screen) ──────────────

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="HomeMain"   component={HomeScreen} />
      <Stack.Screen name="MealDetail" component={MealDetailScreen} />
      <Stack.Screen name="AddMeal"    component={AddMealScreen} />
    </Stack.Navigator>
  );
}

function FavouritesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="FavouritesMain" component={FavouritesScreen} />
      <Stack.Screen name="MealDetail"     component={MealDetailScreen} />
    </Stack.Navigator>
  );
}

function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen name="MealDetail" component={MealDetailScreen} />
    </Stack.Navigator>
  );
}

// ── Root Tab Navigator ────────────────────────────────────────────────────

export default function AppNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        // The tab bar background and borders
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          // elevation/shadow for Android
          elevation: 8,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
        },

        tabBarActiveTintColor:   colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginBottom: 2 },

        // Icons
        tabBarIcon: ({ focused, color, size }) => {
          const map = {
            Home:       focused ? "home"   : "home-outline",
            Favourites: focused ? "heart"  : "heart-outline",
            Search:     focused ? "search" : "search-outline",
            Profile:    focused ? "person" : "person-outline",
          };
          return <Ionicons name={map[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"       component={HomeStack} />
      <Tab.Screen name="Favourites" component={FavouritesStack} />
      <Tab.Screen name="Search"     component={SearchStack} />
      <Tab.Screen name="Profile"    component={ProfileScreen} />
    </Tab.Navigator>
  );
}
