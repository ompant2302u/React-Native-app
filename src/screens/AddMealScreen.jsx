// src/screens/AddMealScreen.jsx

import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useCollection } from "../contexts/CollectionContext";
import { spacing, fontSize, radius, shadow } from "../constants/theme";

const SUGGESTED_TAGS = [
  "Chicken", "Beef", "Lamb", "Fish", "Vegetarian", "Vegan",
  "Indian", "Italian", "Japanese", "Chinese", "Mexican", "British",
  "American", "Dutch", "French", "Thai",
  "Pasta", "Rice", "Soup", "Salad", "Dessert", "Breakfast",
];

const EMPTY = { title: "", subtitle: "", image: "", minutes: "", notes: "", tagInput: "", tags: [] };

export default function AddMealScreen({ navigation }) {
  const { colors } = useTheme();
  const { addMeal } = useCollection();
  const insets = useSafeAreaInsets();

  const [form, setForm]           = useState(EMPTY);
  const [imageError, setImageError] = useState(false);

  const set = (key) => (val) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (key === "image") setImageError(false);
  };

  const addTag = (raw) => {
    const clean = raw.trim();
    if (!clean) return;
    setForm((p) => ({
      ...p,
      tagInput: "",
      tags: p.tags.includes(clean) ? p.tags : [...p.tags, clean],
    }));
  };

  const removeTag = (tag) =>
    setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));

  const toggleSuggest = (tag) =>
    form.tags.includes(tag) ? removeTag(tag) : setForm((p) => ({ ...p, tags: [...p.tags, tag] }));

  const reset = () => { setForm(EMPTY); setImageError(false); };

  const submit = () => {
    const title = form.title.trim();
    if (!title) { Alert.alert("Required", "Please enter a meal title."); return; }
    const mins = parseInt(form.minutes, 10);
    if (form.minutes && isNaN(mins)) { Alert.alert("Invalid", "Cook time must be a number."); return; }

    addMeal({
      title,
      subtitle: form.subtitle.trim() || "My Recipe",
      image:    imageError ? "" : form.image.trim(),
      tags:     form.tags.length ? form.tags : ["Uncategorised"],
      minutes:  isNaN(mins) ? 30 : mins,
      notes:    form.notes.trim(),
    });

    Alert.alert("Added! 🎉", `"${title}" added to your collection.`, [
      { text: "Add Another", onPress: reset },
      { text: "Done", onPress: () => navigation.goBack(), style: "default" },
    ]);
  };

  const hasImage = form.image.trim().length > 0 && !imageError;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ── Top bar ──────────────────────────────────────────── */}
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
          <Text style={[styles.topBarTitle, { color: colors.text }]}>Add New Meal</Text>
          <Pressable onPress={submit} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.saveBtnText}>Save</Text>
          </Pressable>
        </View>

        {/* ── Form ─────────────────────────────────────────────── */}
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: spacing.xxl + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image preview */}
          <View style={[styles.preview, { backgroundColor: colors.tagBg }]}>
            {hasImage ? (
              <Image
                source={{ uri: form.image.trim() }}
                style={styles.previewImg}
                onError={() => setImageError(true)}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.previewEmpty}>
                <Ionicons name="image-outline" size={48} color={colors.tagText} />
                <Text style={[styles.previewHint, { color: colors.tagText }]}>
                  {imageError ? "⚠️ Invalid image URL" : "No image — enter URL below"}
                </Text>
              </View>
            )}
          </View>

          {/* Fields */}
          <Field label="Meal Title *"            value={form.title}    onChange={set("title")}    placeholder="e.g. Chicken Tikka Masala"  colors={colors} />
          <Field label="Subtitle"                value={form.subtitle} onChange={set("subtitle")} placeholder="e.g. Indian · Chicken"       colors={colors} />
          <Field label="Image URL (optional)"    value={form.image}    onChange={set("image")}    placeholder="https://…"                  colors={colors} keyboardType="url" autoCapitalize="none" autoCorrect={false}
            helperText={imageError ? "⚠️ Could not load this image" : ""} helperColor={colors.danger} />
          <Field label="Cook Time (minutes)"     value={form.minutes}  onChange={set("minutes")}  placeholder="e.g. 45"                    colors={colors} keyboardType="numeric" />

          {/* Tags */}
          <View style={styles.fieldWrapper}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Tags</Text>
            <View style={[styles.tagInputRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.tagInputField, { color: colors.text }]}
                value={form.tagInput}
                onChangeText={set("tagInput")}
                placeholder="Type a tag and tap +"
                placeholderTextColor={colors.textFaint}
                onSubmitEditing={() => addTag(form.tagInput)}
                returnKeyType="done"
                blurOnSubmit={false}
              />
              <Pressable onPress={() => addTag(form.tagInput)}
                style={[styles.tagAddBtn, { backgroundColor: colors.primary }]}>
                <Ionicons name="add" size={20} color="#fff" />
              </Pressable>
            </View>

            {form.tags.length > 0 && (
              <>
                <Text style={[styles.subLabel, { color: colors.textMuted }]}>Added (tap to remove):</Text>
                <View style={styles.tagRow}>
                  {form.tags.map((tag) => (
                    <Pressable key={tag} onPress={() => removeTag(tag)}
                      style={[styles.tagChip, { backgroundColor: colors.primary }]}>
                      <Text style={styles.tagChipWhite}>{tag}</Text>
                      <Ionicons name="close-circle" size={13} color="#fff" />
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            <Text style={[styles.subLabel, { color: colors.textMuted }]}>Quick add:</Text>
            <View style={styles.tagRow}>
              {SUGGESTED_TAGS.map((tag) => {
                const active = form.tags.includes(tag);
                return (
                  <Pressable key={tag} onPress={() => toggleSuggest(tag)}
                    style={[
                      styles.tagChip,
                      { backgroundColor: active ? colors.primary : colors.surface,
                        borderColor: colors.border, borderWidth: 1 },
                    ]}>
                    <Text style={[styles.tagChipText, { color: active ? "#fff" : colors.text }]}>
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.fieldWrapper}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Notes</Text>
            <TextInput
              style={[styles.notesInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
              value={form.notes}
              onChangeText={set("notes")}
              placeholder="Tips, memories, variations…"
              placeholderTextColor={colors.textFaint}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Submit */}
          <Pressable onPress={submit}
            style={[styles.bigSubmit, { backgroundColor: colors.primary, ...shadow(2) }]}>
            <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
            <Text style={styles.bigSubmitText}>Add to Collection</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Reusable field ───────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, colors, keyboardType, autoCapitalize, autoCorrect, helperText, helperColor }) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize={autoCapitalize ?? "sentences"}
        autoCorrect={autoCorrect ?? true}
      />
      {helperText ? <Text style={[styles.helper, { color: helperColor ?? colors.textMuted }]}>{helperText}</Text> : null}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  iconBtn: { padding: spacing.sm },
  topBarTitle: { fontSize: fontSize.lg, fontWeight: "700", flex: 1, textAlign: "center" },
  saveBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radius.pill },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: fontSize.sm },

  scroll: { padding: spacing.md, gap: spacing.lg },

  preview: { width: "100%", height: 200, borderRadius: radius.md, overflow: "hidden" },
  previewImg: { width: "100%", height: "100%" },
  previewEmpty: { flex: 1, justifyContent: "center", alignItems: "center", gap: spacing.sm },
  previewHint: { fontSize: fontSize.sm, fontWeight: "500" },

  fieldWrapper: { gap: spacing.xs },
  label: { fontSize: fontSize.sm, fontWeight: "600" },
  fieldInput: {
    borderWidth: 1, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: fontSize.md, minHeight: 48,
  },
  notesInput: {
    borderWidth: 1, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: fontSize.md, minHeight: 100,
  },
  helper: { fontSize: fontSize.xs, marginTop: 2 },

  tagInputRow: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderRadius: radius.md,
    overflow: "hidden", minHeight: 48,
  },
  tagInputField: { flex: 1, fontSize: fontSize.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  tagAddBtn: { paddingHorizontal: spacing.md, alignSelf: "stretch", justifyContent: "center" },

  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.xs },
  tagChip: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: radius.pill, gap: 4,
  },
  tagChipText: { fontSize: fontSize.xs, fontWeight: "500" },
  tagChipWhite: { color: "#fff", fontSize: fontSize.xs, fontWeight: "500" },
  subLabel: { fontSize: fontSize.xs, marginTop: spacing.sm, fontWeight: "600" },

  bigSubmit: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, marginTop: spacing.sm,
  },
  bigSubmitText: { color: "#fff", fontSize: fontSize.lg, fontWeight: "700" },
});
