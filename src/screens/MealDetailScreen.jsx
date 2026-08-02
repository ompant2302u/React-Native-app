// src/screens/MealDetailScreen.jsx
// Full-screen detail view that sits above the tab bar.
// Uses useSafeAreaInsets directly so it adapts to every device notch/gesture bar.

import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Tags } from "../components/TagItem";
import { useTheme } from "../contexts/ThemeContext";
import { useCollection } from "../contexts/CollectionContext";
import { spacing, fontSize, shadow, radius } from "../constants/theme";

export default function MealDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { colors } = useTheme();
  const { meals, toggleFavourite, removeMeal } = useCollection();
  const insets = useSafeAreaInsets();

  const meal = meals.find((m) => m.id === id);
  if (!meal) { navigation.goBack(); return null; }

  const confirmDelete = () =>
    Alert.alert("Remove Meal", `Remove "${meal.title}" from your collection?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => { removeMeal(meal.id); navigation.goBack(); },
      },
    ]);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>

      {/* ── Top bar — padded by status bar height ────────────── */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + spacing.xs,
            borderBottomColor: colors.border,
            backgroundColor: colors.bg,
          },
        ]}
      >
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <Text style={[styles.topBarTitle, { color: colors.text }]} numberOfLines={1}>
          {meal.title}
        </Text>

        <View style={styles.topBarActions}>
          <Pressable onPress={() => toggleFavourite(meal.id)} style={styles.iconBtn} hitSlop={8}>
            <Ionicons
              name={meal.favourite ? "heart" : "heart-outline"}
              size={24}
              color={meal.favourite ? colors.favourite : colors.textMuted}
            />
          </Pressable>
          {meal.source === "mine" && (
            <Pressable onPress={confirmDelete} style={styles.iconBtn} hitSlop={8}>
              <Ionicons name="trash-outline" size={22} color={colors.danger} />
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Scrollable content ───────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing.xxl + insets.bottom },
        ]}
      >
        {/* Hero image or placeholder */}
        {meal.image && meal.image.trim().length > 0 ? (
          <Image source={{ uri: meal.image }} style={styles.hero} resizeMode="cover" />
        ) : (
          <View style={[styles.heroPlaceholder, { backgroundColor: colors.tagBg }]}>
            <Ionicons name="restaurant-outline" size={64} color={colors.tagText} />
            <Text style={[styles.heroPlaceholderText, { color: colors.tagText }]}>No Photo</Text>
          </View>
        )}

        <View style={styles.body}>
          <Text style={[styles.title, { color: colors.text }]}>{meal.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{meal.subtitle}</Text>

          {/* Stats */}
          <View style={[styles.statsRow, { backgroundColor: colors.surface, ...shadow(1) }]}>
            <StatCell icon="time-outline"   label="Cook Time" value={`${meal.minutes} min`} colors={colors} />
            <View style={[styles.statLine,  { backgroundColor: colors.border }]} />
            <StatCell icon="heart"          label="Status"    value={meal.favourite ? "Saved ❤️" : "Not saved"} colors={colors} />
            <View style={[styles.statLine,  { backgroundColor: colors.border }]} />
            <StatCell icon="folder-outline" label="Source"    value={meal.source === "mine" ? "My Recipe" : "Collection"} colors={colors} />
          </View>

          {/* Tags */}
          <SectionTitle title="Tags" colors={colors} />
          <Tags tags={meal.tags} />

          {/* Notes */}
          {meal.notes ? (
            <>
              <SectionTitle title="Notes" colors={colors} />
              <View style={[styles.notesBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.notesText, { color: colors.text }]}>{meal.notes}</Text>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function StatCell({ icon, label, value, colors }) {
  return (
    <View style={styles.statCell}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function SectionTitle({ title, colors }) {
  return <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  topBarTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: "700",
    marginHorizontal: spacing.sm,
  },
  topBarActions: { flexDirection: "row" },
  iconBtn: { padding: spacing.sm },

  scrollContent: {},
  hero: { width: "100%", height: 260 },
  heroPlaceholder: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  heroPlaceholderText: { fontSize: fontSize.md, fontWeight: "600" },

  body: { padding: spacing.md },
  title:    { fontSize: fontSize.xxl, fontWeight: "bold", marginBottom: spacing.xs },
  subtitle: { fontSize: fontSize.md, marginBottom: spacing.lg },

  statsRow: {
    flexDirection: "row",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statCell: { flex: 1, alignItems: "center", gap: 4 },
  statLine: { width: 1, marginHorizontal: spacing.xs },
  statLabel: { fontSize: fontSize.xs, textAlign: "center" },
  statValue: { fontSize: fontSize.xs, fontWeight: "600", textAlign: "center" },

  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  notesBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  notesText: { fontSize: fontSize.md, lineHeight: fontSize.md * 1.6 },
});
