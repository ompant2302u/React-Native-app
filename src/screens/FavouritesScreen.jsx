// src/screens/FavouritesScreen.jsx

import {
  FlatList,
  StyleSheet,
  View,
  Text,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MealCard } from "../components/MealItem";
import { useTheme } from "../contexts/ThemeContext";
import { useCollection } from "../contexts/CollectionContext";
import { spacing, fontSize } from "../constants/theme";

export default function FavouritesScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const numColumns = width > 600 ? 2 : 1;
  const { colors } = useTheme();
  const { favourites } = useCollection();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top }]}>

      {/* ── Header ──────────────────────────────────────────── */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Favourites</Text>
        {favourites.length > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.favourite }]}>
            <Text style={styles.badgeText}>{favourites.length}</Text>
          </View>
        )}
      </View>

      {/* ── List ────────────────────────────────────────────── */}
      <FlatList
        key={numColumns}
        data={favourites}
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={colors.textFaint} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No favourites yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Tap the ❤️ on any meal card to save it here
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
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  title: { fontSize: fontSize.xl, fontWeight: "bold" },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: { color: "#fff", fontSize: fontSize.xs, fontWeight: "700" },
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
  emptySubtitle: { fontSize: fontSize.md, textAlign: "center", lineHeight: fontSize.md * 1.5 },
});
