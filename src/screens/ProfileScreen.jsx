// src/screens/ProfileScreen.jsx

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Alert,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useProfile } from "../contexts/ProfileContext";
import { useCollection } from "../contexts/CollectionContext";
import { spacing, fontSize, radius, shadow } from "../constants/theme";

const AVATAR_BASE = "https://ui-avatars.com/api/?background=2563eb&color=fff&size=128&name=";

export default function ProfileScreen() {
  const { colors, mode, toggle } = useTheme();
  const { profile, updateProfile } = useProfile();
  const { meals, favourites } = useCollection();
  const insets = useSafeAreaInsets();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState({ ...profile });

  const myMeals = meals.filter((m) => m.source === "mine");

  const startEdit  = () => { setDraft({ ...profile }); setEditing(true); };
  const cancelEdit = () => { setDraft({ ...profile }); setEditing(false); };
  const saveEdit   = () => {
    const name = draft.name.trim();
    if (!name) { Alert.alert("Name required", "Please enter your name."); return; }
    updateProfile({ name, bio: draft.bio.trim(), avatar: draft.avatar.trim() });
    setEditing(false);
  };

  const avatarUri =
    (editing ? draft.avatar : profile.avatar) ||
    `${AVATAR_BASE}${encodeURIComponent(profile.name)}`;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top }]}>

      {/* ── Fixed header ──────────────────────────────────────── */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.bg }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        {!editing ? (
          <Pressable onPress={startEdit} style={[styles.editBtn, { borderColor: colors.primary }]}>
            <Ionicons name="pencil-outline" size={16} color={colors.primary} />
            <Text style={[styles.editBtnText, { color: colors.primary }]}>Edit</Text>
          </Pressable>
        ) : (
          <View style={styles.rowGap}>
            <Pressable onPress={cancelEdit} style={styles.iconBtn}>
              <Ionicons name="close-outline" size={24} color={colors.textMuted} />
            </Pressable>
            <Pressable onPress={saveEdit} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* ── Scrollable body ───────────────────────────────────── */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={{ paddingBottom: spacing.xxl + insets.bottom }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            {editing && (
              <View style={[styles.avatarBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            )}
          </View>

          {editing ? (
            <>
              <Field label="Name" value={draft.name}
                onChange={(v) => setDraft((p) => ({ ...p, name: v }))}
                placeholder="Your name" colors={colors} />
              <Field label="Bio" value={draft.bio}
                onChange={(v) => setDraft((p) => ({ ...p, bio: v }))}
                placeholder="A short bio…" multiline colors={colors} />
              <Field label="Avatar URL" value={draft.avatar}
                onChange={(v) => setDraft((p) => ({ ...p, avatar: v }))}
                placeholder="https://… (blank = initials avatar)"
                colors={colors} keyboardType="url" autoCapitalize="none" />
            </>
          ) : (
            <>
              <Text style={[styles.name, { color: colors.text }]}>{profile.name}</Text>
              {profile.bio ? (
                <Text style={[styles.bio, { color: colors.textMuted }]}>{profile.bio}</Text>
              ) : null}
            </>
          )}
        </View>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface, ...shadow(1) }]}>
          <StatCell icon="restaurant-outline" label="Total" value={meals.length} colors={colors} />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <StatCell icon="heart" label="Favourites" value={favourites.length} colors={colors} />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <StatCell icon="create-outline" label="My Recipes" value={myMeals.length} colors={colors} />
        </View>

        {/* Settings */}
        <SectionLabel title="Settings" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface, ...shadow(1) }]}>
          <SettingRow icon={mode === "dark" ? "moon" : "sunny-outline"} label="Dark Mode" colors={colors}>
            <Switch
              value={mode === "dark"}
              onValueChange={toggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </SettingRow>
        </View>

        {/* About */}
        <SectionLabel title="About" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface, ...shadow(1) }]}>
          <SettingRow icon="information-circle-outline" label="Meal Collection" colors={colors}>
            <Text style={[styles.settingValue, { color: colors.textMuted }]}>v1.0</Text>
          </SettingRow>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingRow icon="code-slash-outline" label="Built with Expo" colors={colors}>
            <Ionicons name="heart" size={16} color={colors.favourite} />
          </SettingRow>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, multiline, colors, keyboardType, autoCapitalize }) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
      <TextInput
        style={[
          styles.fieldInput,
          { color: colors.text, backgroundColor: colors.bg, borderColor: colors.border },
          multiline && styles.multiline,
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "sentences"}
      />
    </View>
  );
}

function StatCell({ icon, label, value, colors }) {
  return (
    <View style={styles.statCell}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

function SectionLabel({ title, colors }) {
  return <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>;
}

function SettingRow({ icon, label, colors, children }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: fontSize.xl, fontWeight: "bold" },
  rowGap: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  editBtnText: { fontSize: fontSize.sm, fontWeight: "600" },
  iconBtn: { padding: spacing.xs },
  saveBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: fontSize.sm },

  avatarSection: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  avatarWrapper: { position: "relative" },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarBadge: {
    position: "absolute",
    bottom: 2, right: 2,
    width: 26, height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  name: { fontSize: fontSize.xl, fontWeight: "bold", marginTop: spacing.sm },
  bio: { fontSize: fontSize.md, textAlign: "center", lineHeight: fontSize.md * 1.5 },

  fieldWrapper: { width: "100%", gap: spacing.xs },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: "600" },
  fieldInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    minHeight: 46,
  },
  multiline: { minHeight: 80, textAlignVertical: "top" },

  statsCard: {
    flexDirection: "row",
    marginHorizontal: spacing.md,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statCell: { flex: 1, alignItems: "center", gap: 4 },
  statDivider: { width: 1, marginHorizontal: spacing.sm },
  statValue: { fontSize: fontSize.xl, fontWeight: "bold" },
  statLabel: { fontSize: fontSize.xs },

  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: "700",
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  card: {
    marginHorizontal: spacing.md,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  settingLabel: { fontSize: fontSize.md },
  settingValue: { fontSize: fontSize.sm },
  divider: { height: 1 },
});
