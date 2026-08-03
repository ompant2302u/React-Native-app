// src/screens/FavouritesScreen.jsx

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { MealCard } from "../components/MealItem";
import { useTheme } from "../contexts/ThemeContext";
import { useCollection } from "../contexts/CollectionContext";
import { spacing, fontSize } from "../constants/theme";

export default function FavouritesScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const { colors, mode, toggle } = useTheme();
  const { favourites = [] } = useCollection();

  const numberOfColumns = width >= 700 ? 2 : 1;

  const cardWidth =
    numberOfColumns === 2
      ? (width - spacing.md * 3) / 2
      : width - spacing.md * 2;

  const controlBackground =
    mode === "dark" ? "#1f2937" : "#f1f5f9";

  const emptyBackground =
    mode === "dark" ? "#3f1726" : "#fff1f2";

  function openMeal(meal) {
    navigation.navigate("MealDetail", {
      id: meal.id,
    });
  }

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.bg,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Saved recipes heading */}

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
            ]}
          >
            Saved recipes
          </Text>

          <Text
            style={[
              styles.subtitle,
              { color: colors.textMuted },
            ]}
          >
            {favourites.length}{" "}
            {favourites.length === 1
              ? "favourite recipe"
              : "favourite recipes"}
          </Text>
        </View>

        <Pressable
          onPress={toggle}
          accessibilityRole="button"
          accessibilityLabel="Toggle dark mode"
          style={({ pressed }) => [
            styles.themeButton,
            {
              backgroundColor:
                controlBackground,
            },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={
              mode === "dark"
                ? "sunny-outline"
                : "moon-outline"
            }
            size={21}
            color={colors.primary}
          />
        </Pressable>
      </View>

      {/* Favourite recipes */}

      <FlatList
        key={numberOfColumns}
        data={favourites}
        numColumns={numberOfColumns}
        keyExtractor={(item, index) =>
          String(item.id ?? index)
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.mealWrapper,
              { width: cardWidth },
            ]}
          >
            <MealCard
              item={item}
              onPress={(selectedMeal) =>
                openMeal(selectedMeal || item)
              }
            />
          </View>
        )}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom:
              spacing.xxl + insets.bottom,
          },
          favourites.length === 0 &&
            styles.emptyListContent,
        ]}
        columnWrapperStyle={
          numberOfColumns > 1
            ? styles.columnWrapper
            : undefined
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            colors={colors}
            backgroundColor={emptyBackground}
          />
        }
      />
    </View>
  );
}

function EmptyState({
  colors,
  backgroundColor,
}) {
  return (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor },
        ]}
      >
        <Ionicons
          name="heart-outline"
          size={43}
          color="#e11d48"
        />
      </View>

      <Text
        style={[
          styles.emptyTitle,
          { color: colors.text },
        ]}
      >
        No saved recipes
      </Text>

      <Text
        style={[
          styles.emptySubtitle,
          { color: colors.textMuted },
        ]}
      >
        Open a recipe and press the Save to
        favourites button. Your saved recipes will
        appear here automatically.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  header: {
    minHeight: 78,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerText: {
    flex: 1,
    paddingRight: spacing.md,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: 4,
    fontSize: fontSize.sm,
  },

  themeButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  columnWrapper: {
    gap: spacing.md,
  },

  mealWrapper: {
    marginBottom: spacing.md,
  },

  emptyContainer: {
    flex: 1,
    minHeight: 430,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIconContainer: {
    width: 94,
    height: 94,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: spacing.lg,
    fontSize: fontSize.lg,
    fontWeight: "800",
    textAlign: "center",
  },

  emptySubtitle: {
    maxWidth: 330,
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    lineHeight: 21,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
});