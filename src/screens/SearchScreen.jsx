// src/screens/SearchScreen.jsx

import {
  FlatList,
  Platform,
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { MealCard } from "../components/MealItem";
import { useTheme } from "../contexts/ThemeContext";
import { useCollection } from "../contexts/CollectionContext";
import { spacing, fontSize, radius } from "../constants/theme";

export default function SearchScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const numColumns = width > 600 ? 2 : 1;
  const { colors } = useTheme();
  const { meals } = useCollection();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  const allTags = useMemo(() => {
    const set = new Set();
    meals.forEach((m) => m.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [meals]);

  const toggleTag = (tag) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return meals.filter((meal) => {
      const matchesQuery =
        !q ||
        meal.title.toLowerCase().includes(q) ||
        meal.subtitle.toLowerCase().includes(q) ||
        (meal.notes && meal.notes.toLowerCase().includes(q)) ||
        meal.tags.some((t) => t.toLowerCase().includes(q));
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => meal.tags.includes(tag));
      return matchesQuery && matchesTags;
    });
  }, [meals, query, selectedTags]);

  const hasFilters = query.trim().length > 0 || selectedTags.length > 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top }]}>

      {/* ── Header ──────────────────────────────────────────── */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Search</Text>
        {hasFilters && (
          <Pressable
            onPress={() => { setQuery(""); setSelectedTags([]); }}
            hitSlop={8}
          >
            <Text style={[styles.clearAll, { color: colors.primary }]}>Clear all</Text>
          </Pressable>
        )}
      </View>

      {/* ── Search input ────────────────────────────────────── */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Name, cuisine, tag, notes…"
            placeholderTextColor={colors.textFaint}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode={Platform.OS === "ios" ? "while-editing" : "never"}
          />
          {query.length > 0 && Platform.OS === "android" && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Tag chips ───────────────────────────────────────── */}
      {allTags.length > 0 && (
        <View style={styles.tagsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsScroll}
            keyboardShouldPersistTaps="handled"
          >
            {allTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <Pressable
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[
                    styles.tagChip,
                    {
                      backgroundColor: active ? colors.primary : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  {active && <Ionicons name="checkmark" size={12} color="#fff" />}
                  <Text style={[styles.tagChipText, { color: active ? "#fff" : colors.text }]}>
                    {tag}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ── Results bar ─────────────────────────────────────── */}
      <View style={[styles.resultsBar, { borderBottomColor: colors.border }]}>
        <Text style={[styles.resultsCount, { color: colors.textMuted }]}>
          {hasFilters ? `${results.length} of ${meals.length} meals` : `${meals.length} meals`}
        </Text>
        {selectedTags.length > 0 && (
          <Text style={[styles.activeFilters, { color: colors.primary }]} numberOfLines={1}>
            Filter: {selectedTags.join(", ")}
          </Text>
        )}
      </View>

      {/* ── Results list ────────────────────────────────────── */}
      {/* flex:1 bounds height — without this FlatList expands forever */}
      <View style={styles.listContainer}>
        <FlatList
          key={numColumns}
          data={results}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          renderItem={({ item }) => (
            <MealCard
              item={item}
              onPress={(meal) => navigation.navigate("MealDetail", { id: meal.id })}
            />
          )}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: spacing.xxl + insets.bottom },
          ]}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapperStyle : undefined}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={60} color={colors.textFaint} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {hasFilters ? "No meals found" : "Start searching"}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                {hasFilters
                  ? "Try different keywords or remove a filter"
                  : "Type a name, cuisine, tag or keyword above"}
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  title: { fontSize: fontSize.xl, fontWeight: "bold" },
  clearAll: { fontSize: fontSize.sm, fontWeight: "600" },

  searchRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    minHeight: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: spacing.sm,
  },

  tagsWrapper: { height: 44, justifyContent: "center" },
  tagsScroll: { paddingHorizontal: spacing.md, alignItems: "center" },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
    gap: 4,
  },
  tagChipText: { fontSize: fontSize.sm, fontWeight: "500" },

  resultsBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
  },
  resultsCount: { fontSize: fontSize.sm },
  activeFilters: { fontSize: fontSize.xs, fontWeight: "500", marginTop: 1 },

  listContainer: { flex: 1 },
  contentContainer: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  columnWrapperStyle: { gap: spacing.md },

  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: "600", marginTop: spacing.sm },
  emptySubtitle: { fontSize: fontSize.md, textAlign: "center", lineHeight: fontSize.md * 1.5 },
});
