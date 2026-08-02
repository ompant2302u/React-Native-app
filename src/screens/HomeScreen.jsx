// src/screens/HomeScreen.jsx

import {
  FlatList,
  StyleSheet,
  View,
  Text,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { spacing, fontSize } from "../constants/theme";
import { MealCard } from "../components/MealItem";
import { useTheme } from "../contexts/ThemeContext";
import { useCollection } from "../contexts/CollectionContext";

export default function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const numColumns = width > 600 ? 2 : 1;
  const { colors, toggle, mode } = useTheme();
  const { meals } = useCollection();
  const insets = useSafeAreaInsets();

  return (
    // Plain View — the Tab Navigator already insets the bottom; we manage top ourselves
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top }]}>

      {/* ── Header ─────────────────────────────────────────── */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>My Collection</Text>
          <Text style={[styles.count, { color: colors.textMuted }]}>
            {meals.length} {meals.length === 1 ? "recipe" : "recipes"}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={toggle}
            style={styles.headerBtn}
            accessibilityRole="button"
            accessibilityLabel="Toggle dark mode"
          >
            <Ionicons
              name={mode === "dark" ? "sunny-outline" : "moon-outline"}
              size={22}
              color={colors.primary}
            />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("AddMeal")}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Add new meal"
          >
            <Ionicons name="add" size={22} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* ── List ───────────────────────────────────────────── */}
      <FlatList
        key={numColumns}
        data={meals}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        renderItem={({ item }) => (
          <MealCard
            item={item}
            onPress={(meal) => navigation.navigate("MealDetail", { id: meal.id })}
          />
        )}
        // paddingBottom = tab bar height is handled by the navigator;
        // add extra spacing.xl so last card isn't flush with the tab bar
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: spacing.xxl + insets.bottom },
        ]}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapperStyle : undefined}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color={colors.textFaint} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No meals yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Tap the + button to add your first recipe
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  headerBtn: { padding: spacing.sm },
  title: { fontSize: fontSize.xl, fontWeight: "bold" },
  count: { fontSize: fontSize.sm, marginTop: 1 },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  columnWrapperStyle: { gap: spacing.md },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 80,
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: "600", marginTop: spacing.sm },
  emptySubtitle: { fontSize: fontSize.md, textAlign: "center" },
});
