// src/screens/SearchScreen.jsx

import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { MealCard } from "../components/MealItem";
import { useTheme } from "../contexts/ThemeContext";
import { useCollection } from "../contexts/CollectionContext";
import {
  spacing,
  fontSize,
  radius,
} from "../constants/theme";

export default function SearchScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const { colors, mode, toggle } = useTheme();
  const { meals = [] } = useCollection();

  const [query, setQuery] = useState("");

  const numberOfColumns = width >= 700 ? 2 : 1;

  const cardWidth =
    numberOfColumns === 2
      ? (width - spacing.md * 3) / 2
      : width - spacing.md * 2;

  const palette =
    mode === "dark"
      ? {
          control: "#1f2937",
          search: "#172033",
          iconBackground: "#172554",
          emptyBackground: "#172554",
          clearBackground: "#293548",
        }
      : {
          control: "#f1f5f9",
          search: "#ffffff",
          iconBackground: "#eff6ff",
          emptyBackground: "#eff6ff",
          clearBackground: "#f1f5f9",
        };

  const normalizedQuery = query
    .trim()
    .toLowerCase();

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return meals;
    }

    return meals.filter((meal) => {
      const searchableText = [
        meal?.title,
        meal?.name,
        meal?.mealName,
        meal?.subtitle,
        meal?.category,
        meal?.cuisine,
        meal?.type,
        meal?.notes,
        meal?.description,
        Array.isArray(meal?.tags)
          ? meal.tags.join(" ")
          : meal?.tags,
        Array.isArray(meal?.ingredients)
          ? meal.ingredients.join(" ")
          : meal?.ingredients,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        normalizedQuery
      );
    });
  }, [meals, normalizedQuery]);

  const hasQuery = normalizedQuery.length > 0;

  function clearSearch() {
    setQuery("");
  }

  function openMeal(meal) {
    navigation.navigate("MealDetail", {
      id: meal.id,
    });
  }

  const listHeader = (
    <View>
      {/* Search card */}

      <View
        style={[
          styles.searchCard,
          {
            backgroundColor: palette.search,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.searchIcon,
            {
              backgroundColor:
                palette.iconBackground,
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={21}
            color={colors.primary}
          />
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search recipes, cuisines or notes"
          placeholderTextColor={colors.textFaint}
          selectionColor={colors.primary}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode={
            Platform.OS === "ios"
              ? "while-editing"
              : "never"
          }
          style={[
            styles.searchInput,
            { color: colors.text },
          ]}
        />

        {query.length > 0 &&
          Platform.OS === "android" && (
            <Pressable
              onPress={clearSearch}
              hitSlop={10}
              style={({ pressed }) => [
                styles.clearButton,
                {
                  backgroundColor:
                    palette.clearBackground,
                },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="close"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          )}
      </View>

      {/* Results heading */}

      <View style={styles.resultsHeader}>
        <View style={styles.resultsText}>
          <Text
            style={[
              styles.resultsTitle,
              { color: colors.text },
            ]}
          >
            {hasQuery
              ? "Search results"
              : "Explore recipes"}
          </Text>

          <Text
            style={[
              styles.resultsSubtitle,
              { color: colors.textMuted },
            ]}
          >
            {hasQuery
              ? `${results.length} ${
                  results.length === 1
                    ? "recipe found"
                    : "recipes found"
                }`
              : `${meals.length} ${
                  meals.length === 1
                    ? "recipe available"
                    : "recipes available"
                }`}
          </Text>
        </View>

        {hasQuery && (
          <Pressable
            onPress={clearSearch}
            style={({ pressed }) => [
              styles.resetButton,
              {
                backgroundColor:
                  palette.iconBackground,
              },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="refresh-outline"
              size={16}
              color={colors.primary}
            />

            <Text
              style={[
                styles.resetText,
                { color: colors.primary },
              ]}
            >
              Reset
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );

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
      {/* Header */}

      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.bg,
          },
        ]}
      >
        <View style={styles.headerText}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
            ]}
          >
            Search
          </Text>

          <Text
            style={[
              styles.headerSubtitle,
              { color: colors.textMuted },
            ]}
          >
            Find meals from your collection
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
                palette.control,
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

      {/* Recipe results */}

      <FlatList
        key={numberOfColumns}
        data={results}
        numColumns={numberOfColumns}
        ListHeaderComponent={listHeader}
        keyExtractor={(item, index) =>
          String(item?.id ?? index)
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
          results.length === 0 &&
            styles.emptyList,
        ]}
        columnWrapperStyle={
          numberOfColumns > 1
            ? styles.columnWrapper
            : undefined
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <EmptyState
            colors={colors}
            backgroundColor={
              palette.emptyBackground
            }
            query={query}
            onClear={clearSearch}
          />
        }
      />
    </View>
  );
}

function EmptyState({
  colors,
  backgroundColor,
  query,
  onClear,
}) {
  return (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIcon,
          { backgroundColor },
        ]}
      >
        <Ionicons
          name="search-outline"
          size={42}
          color={colors.primary}
        />
      </View>

      <Text
        style={[
          styles.emptyTitle,
          { color: colors.text },
        ]}
      >
        No recipes found
      </Text>

      <Text
        style={[
          styles.emptySubtitle,
          { color: colors.textMuted },
        ]}
      >
        No recipe matches “{query.trim()}”. Try
        another recipe name, cuisine or keyword.
      </Text>

      <Pressable
        onPress={onClear}
        style={({ pressed }) => [
          styles.emptyButton,
          {
            backgroundColor: colors.primary,
          },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="refresh-outline"
          size={18}
          color="#ffffff"
        />

        <Text style={styles.emptyButtonText}>
          Clear search
        </Text>
      </Pressable>
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

  headerSubtitle: {
    marginTop: 4,
    fontSize: 12,
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
    paddingTop: spacing.sm,
  },

  emptyList: {
    flexGrow: 1,
  },

  searchCard: {
    minHeight: 58,
    paddingHorizontal: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  searchIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  searchInput: {
    flex: 1,
    minHeight: 54,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
  },

  clearButton: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  resultsHeader: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultsText: {
    flex: 1,
    paddingRight: spacing.sm,
  },

  resultsTitle: {
    fontSize: fontSize.lg,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  resultsSubtitle: {
    marginTop: 4,
    fontSize: 12,
  },

  resetButton: {
    minHeight: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  resetText: {
    fontSize: 12,
    fontWeight: "700",
  },

  columnWrapper: {
    gap: spacing.md,
  },

  mealWrapper: {
    marginBottom: spacing.md,
  },

  emptyContainer: {
    minHeight: 390,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
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

  emptyButton: {
    minHeight: 46,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  emptyButtonText: {
    color: "#ffffff",
    fontSize: fontSize.sm,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.97 }],
  },
});