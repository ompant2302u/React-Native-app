// src/components/MealItem.jsx
//
// MealCard — shows a meal in a list.
// Key behaviours:
//  - If image is empty/missing → shows a styled placeholder (no broken image)
//  - Heart button stops press event bubbling so it doesn't also open the detail screen
//  - Shadow on outer wrapper (no clip), overflow:hidden on inner card

import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Tags } from "./TagItem";
import { spacing, fontSize, shadow, radius } from "../constants/theme";
import { useTheme } from "../contexts/ThemeContext";
import { useCollection } from "../contexts/CollectionContext";

export const MealCard = ({ item, onPress }) => {
  const { colors } = useTheme();
  const { toggleFavourite } = useCollection();

  const hasImage = item.image && item.image.trim().length > 0;

  return (
    <View style={[styles.shadowWrapper, shadow(2)]}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: colors.surface },
          pressed && styles.pressed,
        ]}
        onPress={() => onPress && onPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.title}`}
      >
        {/* ── Image / Placeholder ─────────────────────────────── */}
        <View style={styles.imageWrapper}>
          {hasImage ? (
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              // onError falls back gracefully — image box stays, just grey
              defaultSource={require("../../assets/icon.png")}
            />
          ) : (
            // Placeholder shown when no image URL is provided
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.tagBg }]}>
              <Ionicons name="restaurant-outline" size={48} color={colors.tagText} />
              <Text style={[styles.placeholderText, { color: colors.tagText }]}>
                No Photo
              </Text>
            </View>
          )}

          {/* Heart button — stopPropagation so it doesn't open detail screen */}
          <Pressable
            style={[styles.favBtn, { backgroundColor: colors.surface + "dd" }]}
            onPress={(e) => {
              e.stopPropagation?.();
              toggleFavourite(item.id);
            }}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={item.favourite ? "Remove from favourites" : "Add to favourites"}
          >
            <Ionicons
              name={item.favourite ? "heart" : "heart-outline"}
              size={20}
              color={item.favourite ? colors.favourite : colors.textMuted}
            />
          </Pressable>

          {/* "Mine" badge */}
          {item.source === "mine" && (
            <View style={[styles.sourceBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.sourceBadgeText}>Mine</Text>
            </View>
          )}
        </View>

        {/* ── Text content ───────────────────────────────────── */}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
          {item.subtitle}
        </Text>

        <Tags tags={item.tags} />

        <View style={styles.footer}>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={13} color={colors.textMuted} />
            <Text style={[styles.timeText, { color: colors.textMuted }]}>
              {item.minutes} min
            </Text>
          </View>
          {item.notes ? (
            <Text style={[styles.notes, { color: colors.textFaint }]} numberOfLines={1}>
              {item.notes}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowWrapper: {
    flex: 1,
    borderRadius: radius.md,
    // transparent background is required for iOS shadow to render
    backgroundColor: "transparent",
  },
  card: {
    flex: 1,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  pressed: { opacity: 0.65 },

  imageWrapper: { position: "relative" },

  image: { width: "100%", height: 190 },

  imagePlaceholder: {
    width: "100%",
    height: 190,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  placeholderText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
  },

  favBtn: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    borderRadius: 20,
    padding: 6,
  },
  sourceBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  sourceBadgeText: {
    color: "#fff",
    fontSize: fontSize.xs,
    fontWeight: "700",
  },

  title: {
    fontSize: fontSize.lg,
    fontWeight: "bold",
    marginTop: spacing.sm,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  timeText: { fontSize: fontSize.sm },
  notes: {
    fontSize: fontSize.xs,
    flex: 1,
    textAlign: "right",
  },
});
