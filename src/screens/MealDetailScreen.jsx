// src/screens/MealDetailScreen.jsx

import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useEffect, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Tags } from "../components/TagItem";
import { useTheme } from "../contexts/ThemeContext";
import { useCollection } from "../contexts/CollectionContext";

import {
  spacing,
  fontSize,
  shadow,
  radius,
} from "../constants/theme";

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  category: "",
  minutes: "",
  image: "",
  tags: "",
  notes: "",
};

export default function MealDetailScreen({
  route,
  navigation,
}) {
  const mealId = route.params?.id;

  const { colors, mode } = useTheme();

  const {
    meals = [],
    toggleFavourite,
    updateMeal,
    removeMeal,
  } = useCollection();

  const insets = useSafeAreaInsets();

  const [editVisible, setEditVisible] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] =
    useState(EMPTY_FORM);

  const meal = useMemo(
    () =>
      meals.find(
        (item) =>
          String(item.id) === String(mealId)
      ),
    [meals, mealId]
  );

  useEffect(() => {
    if (!meal) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  }, [meal, navigation]);

  if (!meal) {
    return (
      <View
        style={[
          styles.root,
          { backgroundColor: colors.bg },
        ]}
      />
    );
  }

  const title =
    meal.title ||
    meal.name ||
    meal.mealName ||
    "Untitled Recipe";

  const subtitle =
    meal.subtitle?.trim() ||
    meal.category?.trim() ||
    "A delicious recipe from your collection.";

  const category =
    meal.category ||
    meal.cuisine ||
    meal.type ||
    "Uncategorized";

  const sourceText =
    meal.source === "mine"
      ? "My Recipe"
      : "Collection";

  const cookTime = meal.minutes
    ? `${meal.minutes} min`
    : "Not set";

  const tags = Array.isArray(meal.tags)
    ? meal.tags
    : [];

  const notes =
    meal.notes?.trim() ||
    meal.description?.trim() ||
    "";

  const dangerColor =
    colors.danger || "#ef4444";

  const favouriteColor =
    colors.favourite || "#f43f5e";

  const palette =
    mode === "dark"
      ? {
          imageFallback: "#172033",
          neutralSoft: "#1f2937",
          blueSoft: "#172554",
          greenSoft: "#12372f",
          orangeSoft: "#422d12",
          pinkSoft: "#3f1726",
          overlay: "rgba(0,0,0,0.72)",
          badge: "rgba(15,23,42,0.68)",
          dangerBorder: "#7f1d1d",
        }
      : {
          imageFallback: "#eaf0f8",
          neutralSoft: "#f1f5f9",
          blueSoft: "#eff6ff",
          greenSoft: "#ecfdf5",
          orangeSoft: "#fff7ed",
          pinkSoft: "#fff1f2",
          overlay: "rgba(15,23,42,0.55)",
          badge: "rgba(15,23,42,0.58)",
          dangerBorder: "#fecaca",
        };

  const hasImage =
    typeof meal.image === "string"
      ? meal.image.trim().length > 0
      : Boolean(meal.image);

  const imageSource =
    typeof meal.image === "string"
      ? { uri: meal.image }
      : meal.image;

  function openUpdateModal() {
    setEditForm({
      title,
      subtitle: meal.subtitle || "",
      category:
        meal.category ||
        meal.cuisine ||
        meal.type ||
        "",
      minutes: meal.minutes
        ? String(meal.minutes)
        : "",
      image:
        typeof meal.image === "string"
          ? meal.image
          : "",
      tags: Array.isArray(meal.tags)
        ? meal.tags.join(", ")
        : "",
      notes:
        meal.notes ||
        meal.description ||
        "",
    });

    setEditVisible(true);
  }

  function closeUpdateModal() {
    if (saving) {
      return;
    }

    setEditVisible(false);
    setEditForm(EMPTY_FORM);
  }

  function changeField(field, value) {
    setEditForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function saveUpdatedMeal() {
    const updatedTitle =
      editForm.title.trim();

    if (!updatedTitle) {
      Alert.alert(
        "Title required",
        "Please enter the recipe title."
      );

      return;
    }

    const minutesText =
      editForm.minutes.trim();

    const minutes = minutesText
      ? Number(minutesText)
      : null;

    if (
      minutesText &&
      (!Number.isFinite(minutes) ||
        minutes < 0)
    ) {
      Alert.alert(
        "Invalid cooking time",
        "Cooking time must be a valid positive number."
      );

      return;
    }

    try {
      setSaving(true);

      const updatedTags = editForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const updates = {
        title: updatedTitle,
        subtitle:
          editForm.subtitle.trim(),
        category:
          editForm.category.trim(),
        minutes,
        image: editForm.image.trim(),
        tags: updatedTags,
        notes: editForm.notes.trim(),
        description:
          editForm.notes.trim(),
      };

      /*
       * Keep compatibility with meal objects
       * that use name or mealName.
       */
      if (
        Object.prototype.hasOwnProperty.call(
          meal,
          "name"
        )
      ) {
        updates.name = updatedTitle;
      }

      if (
        Object.prototype.hasOwnProperty.call(
          meal,
          "mealName"
        )
      ) {
        updates.mealName = updatedTitle;
      }

      updateMeal(meal.id, updates);

      setEditVisible(false);
      setEditForm(EMPTY_FORM);
    } catch (error) {
      console.error(
        "Update meal error:",
        error
      );

      Alert.alert(
        "Update failed",
        "The recipe could not be updated."
      );
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      "Delete recipe",
      `Are you sure you want to delete "${title}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeMeal(meal.id);
          },
        },
      ]
    );
  }

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: colors.bg },
      ]}
    >
      {/* Header */}

      <View
        style={[
          styles.topBar,
          {
            paddingTop:
              insets.top + spacing.xs,
            backgroundColor: colors.bg,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={({ pressed }) => [
            styles.topBarButton,
            {
              backgroundColor:
                palette.neutralSoft,
            },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.text}
          />
        </Pressable>

        <View style={styles.topBarText}>
          <Text
            style={[
              styles.topBarTitle,
              { color: colors.text },
            ]}
            numberOfLines={1}
          >
            Recipe Details
          </Text>

          <Text
            style={[
              styles.topBarSubtitle,
              { color: colors.textMuted },
            ]}
            numberOfLines={1}
          >
            View and manage this recipe
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              spacing.xxl + insets.bottom,
          },
        ]}
      >
        {/* Image card */}

        <View
          style={[
            styles.imageCard,
            {
              backgroundColor:
                palette.imageFallback,
            },
          ]}
        >
          {hasImage ? (
            <Image
              source={imageSource}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                {
                  backgroundColor:
                    palette.imageFallback,
                },
              ]}
            >
              <View
                style={[
                  styles.placeholderIcon,
                  {
                    backgroundColor:
                      palette.neutralSoft,
                  },
                ]}
              >
                <Ionicons
                  name="restaurant-outline"
                  size={48}
                  color={colors.textMuted}
                />
              </View>

              <Text
                style={[
                  styles.placeholderTitle,
                  { color: colors.text },
                ]}
              >
                No recipe photo
              </Text>

              <Text
                style={[
                  styles.placeholderSubtitle,
                  {
                    color: colors.textMuted,
                  },
                ]}
              >
                Add an image by updating this
                recipe.
              </Text>
            </View>
          )}

          <View
            style={[
              styles.imageBadge,
              {
                backgroundColor:
                  palette.badge,
              },
            ]}
          >
            <Ionicons
              name={
                meal.source === "mine"
                  ? "person-outline"
                  : "albums-outline"
              }
              size={14}
              color="#ffffff"
            />

            <Text style={styles.imageBadgeText}>
              {sourceText}
            </Text>
          </View>
        </View>

        {/* Main product-style card */}

        <View
          style={[
            styles.contentCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              ...shadow(1),
            },
          ]}
        >
          <Text
            style={[
              styles.title,
              { color: colors.text },
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.subtitle,
              { color: colors.textMuted },
            ]}
          >
            {subtitle}
          </Text>

          {/* Information cards */}

          <View style={styles.statsGrid}>
            <StatCard
              icon="time-outline"
              label="Cook time"
              value={cookTime}
              iconColor="#2563eb"
              iconBackground={
                palette.blueSoft
              }
              colors={colors}
            />

            <StatCard
              icon="grid-outline"
              label="Category"
              value={category}
              iconColor="#f59e0b"
              iconBackground={
                palette.orangeSoft
              }
              colors={colors}
            />

            <StatCard
              icon="folder-outline"
              label="Source"
              value={sourceText}
              iconColor="#10b981"
              iconBackground={
                palette.greenSoft
              }
              colors={colors}
            />
          </View>

          {/* Tags */}

          <DetailSection
            icon="pricetags-outline"
            title="Tags"
            subtitle="Recipe categories and labels"
            iconColor="#8b5cf6"
            iconBackground={
              palette.blueSoft
            }
            colors={colors}
          >
            {tags.length > 0 ? (
              <Tags tags={tags} />
            ) : (
              <View
                style={[
                  styles.emptyContentCard,
                  {
                    backgroundColor:
                      colors.bg,
                    borderColor:
                      colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="pricetag-outline"
                  size={24}
                  color={colors.textFaint}
                />

                <Text
                  style={[
                    styles.emptyContentText,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  No tags have been added.
                </Text>
              </View>
            )}
          </DetailSection>

          {/* Notes */}

          <DetailSection
            icon="document-text-outline"
            title="Recipe notes"
            subtitle="Description and preparation details"
            iconColor="#f59e0b"
            iconBackground={
              palette.orangeSoft
            }
            colors={colors}
          >
            <View
              style={[
                styles.notesCard,
                {
                  backgroundColor:
                    colors.bg,
                  borderColor: colors.border,
                },
              ]}
            >
              {notes ? (
                <Text
                  style={[
                    styles.notesText,
                    { color: colors.text },
                  ]}
                >
                  {notes}
                </Text>
              ) : (
                <View style={styles.emptyNotes}>
                  <Ionicons
                    name="document-outline"
                    size={27}
                    color={colors.textFaint}
                  />

                  <Text
                    style={[
                      styles.emptyContentText,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    No notes have been added.
                  </Text>
                </View>
              )}
            </View>
          </DetailSection>

          {/* Bottom actions */}

          <View style={styles.actionSection}>
            <Pressable
              onPress={() =>
                toggleFavourite(meal.id)
              }
              style={({ pressed }) => [
                styles.favouriteButton,
                {
                  backgroundColor:
                    colors.primary,
                },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={
                  meal.favourite
                    ? "heart-dislike-outline"
                    : "heart-outline"
                }
                size={20}
                color="#ffffff"
              />

              <Text
                style={
                  styles.favouriteButtonText
                }
              >
                {meal.favourite
                  ? "Remove from favourites"
                  : "Save to favourites"}
              </Text>
            </Pressable>

            <View style={styles.manageActions}>
              <Pressable
                onPress={openUpdateModal}
                style={({ pressed }) => [
                  styles.updateButton,
                  {
                    backgroundColor:
                      palette.orangeSoft,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color="#d97706"
                />

                <Text
                  style={
                    styles.updateButtonText
                  }
                >
                  Update
                </Text>
              </Pressable>

              <Pressable
                onPress={confirmDelete}
                style={({ pressed }) => [
                  styles.deleteButton,
                  {
                    backgroundColor:
                      palette.pinkSoft,
                    borderColor:
                      palette.dangerBorder,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={dangerColor}
                />

                <Text
                  style={[
                    styles.deleteButtonText,
                    { color: dangerColor },
                  ]}
                >
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Update modal */}

      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeUpdateModal}
      >
        <KeyboardAvoidingView
          style={[
            styles.modalOverlay,
            {
              backgroundColor:
                palette.overlay,
            },
          ]}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor:
                  colors.surface,
              },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                {
                  borderBottomColor:
                    colors.border,
                },
              ]}
            >
              <View style={styles.modalHeaderText}>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: colors.text },
                  ]}
                >
                  Update Recipe
                </Text>

                <Text
                  style={[
                    styles.modalSubtitle,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  Edit the selected meal
                </Text>
              </View>

              <Pressable
                onPress={closeUpdateModal}
                disabled={saving}
                style={[
                  styles.modalCloseButton,
                  {
                    backgroundColor:
                      palette.neutralSoft,
                  },
                ]}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={colors.text}
                />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                styles.modalContent
              }
            >
              <FormField
                label="Recipe title"
                icon="restaurant-outline"
                value={editForm.title}
                placeholder="Enter recipe title"
                colors={colors}
                onChangeText={(value) =>
                  changeField("title", value)
                }
              />

              <FormField
                label="Subtitle"
                icon="text-outline"
                value={editForm.subtitle}
                placeholder="Short recipe subtitle"
                colors={colors}
                onChangeText={(value) =>
                  changeField(
                    "subtitle",
                    value
                  )
                }
              />

              <FormField
                label="Category"
                icon="grid-outline"
                value={editForm.category}
                placeholder="Breakfast, lunch..."
                colors={colors}
                onChangeText={(value) =>
                  changeField(
                    "category",
                    value
                  )
                }
              />

              <FormField
                label="Cooking time in minutes"
                icon="time-outline"
                value={editForm.minutes}
                placeholder="Example: 30"
                keyboardType="numeric"
                colors={colors}
                onChangeText={(value) =>
                  changeField(
                    "minutes",
                    value
                  )
                }
              />

              <FormField
                label="Image URL or local URI"
                icon="image-outline"
                value={editForm.image}
                placeholder="https://example.com/image.jpg"
                autoCapitalize="none"
                colors={colors}
                onChangeText={(value) =>
                  changeField("image", value)
                }
              />

              <FormField
                label="Tags"
                icon="pricetags-outline"
                value={editForm.tags}
                placeholder="Dinner, Healthy, Easy"
                colors={colors}
                onChangeText={(value) =>
                  changeField("tags", value)
                }
              />

              <FormField
                label="Recipe notes"
                icon="document-text-outline"
                value={editForm.notes}
                placeholder="Add recipe instructions or notes"
                multiline
                colors={colors}
                onChangeText={(value) =>
                  changeField("notes", value)
                }
              />
            </ScrollView>

            <View
              style={[
                styles.modalFooter,
                {
                  borderTopColor:
                    colors.border,
                },
              ]}
            >
              <Pressable
                onPress={closeUpdateModal}
                disabled={saving}
                style={({ pressed }) => [
                  styles.cancelModalButton,
                  {
                    backgroundColor:
                      palette.neutralSoft,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.cancelModalText,
                    { color: colors.text },
                  ]}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={saveUpdatedMeal}
                disabled={saving}
                style={({ pressed }) => [
                  styles.saveModalButton,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                  pressed && styles.pressed,
                  saving && styles.disabled,
                ]}
              >
                <Ionicons
                  name={
                    saving
                      ? "hourglass-outline"
                      : "checkmark"
                  }
                  size={19}
                  color="#ffffff"
                />

                <Text
                  style={
                    styles.saveModalText
                  }
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  iconColor,
  iconBackground,
  colors,
}) {
  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.statIcon,
          { backgroundColor: iconBackground },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={iconColor}
        />
      </View>

      <Text
        style={[
          styles.statValue,
          { color: colors.text },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>

      <Text
        style={[
          styles.statLabel,
          { color: colors.textMuted },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function DetailSection({
  icon,
  title,
  subtitle,
  iconColor,
  iconBackground,
  colors,
  children,
}) {
  return (
    <View style={styles.detailSection}>
      <View style={styles.sectionHeader}>
        <View
          style={[
            styles.sectionIcon,
            {
              backgroundColor:
                iconBackground,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={iconColor}
          />
        </View>

        <View style={styles.sectionText}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text },
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              { color: colors.textMuted },
            ]}
          >
            {subtitle}
          </Text>
        </View>
      </View>

      {children}
    </View>
  );
}

function FormField({
  label,
  icon,
  value,
  placeholder,
  onChangeText,
  colors,
  multiline = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text
        style={[
          styles.fieldLabel,
          { color: colors.text },
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.bg,
            borderColor: colors.border,
          },
          multiline &&
            styles.multilineContainer,
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={colors.textMuted}
          style={
            multiline
              ? styles.multilineIcon
              : undefined
          }
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={
            colors.textFaint
          }
          selectionColor={colors.primary}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={multiline ? 5 : 1}
          textAlignVertical={
            multiline ? "top" : "center"
          }
          style={[
            styles.input,
            { color: colors.text },
            multiline &&
              styles.multilineInput,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  topBar: {
    minHeight: 70,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth:
      StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
  },

  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  topBarText: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },

  topBarTitle: {
    fontSize: fontSize.md,
    fontWeight: "800",
  },

  topBarSubtitle: {
    marginTop: 2,
    fontSize: 11,
  },

  scrollContent: {
    paddingTop: spacing.md,
  },

  imageCard: {
    height: 310,
    marginHorizontal: spacing.md,
    borderRadius: 28,
    overflow: "hidden",
    position: "relative",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },

  placeholderIcon: {
    width: 90,
    height: 90,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderTitle: {
    marginTop: spacing.md,
    fontSize: fontSize.lg,
    fontWeight: "800",
  },

  placeholderSubtitle: {
    maxWidth: 260,
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    lineHeight: 20,
    textAlign: "center",
  },

  imageBadge: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  imageBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },

  contentCard: {
    marginHorizontal: spacing.md,
    marginTop: -30,
    padding: spacing.md,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderRadius: 28,
  },

  title: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "800",
    letterSpacing: -0.6,
  },

  subtitle: {
    marginTop: spacing.xs,
    fontSize: fontSize.md,
    lineHeight: 22,
  },

  statsGrid: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
  },

  statCard: {
    flex: 1,
    minHeight: 120,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.md,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  statIcon: {
    width: 40,
    height: 40,
    marginBottom: spacing.sm,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  statValue: {
    maxWidth: "100%",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },

  statLabel: {
    marginTop: 4,
    fontSize: 10,
    textAlign: "center",
  },

  detailSection: {
    marginTop: spacing.xl,
  },

  sectionHeader: {
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  sectionIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: "800",
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
  },

  emptyContentCard: {
    minHeight: 100,
    padding: spacing.md,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  emptyContentText: {
    fontSize: fontSize.sm,
    textAlign: "center",
  },

  notesCard: {
    minHeight: 130,
    padding: spacing.md,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderRadius: 19,
  },

  notesText: {
    fontSize: fontSize.md,
    lineHeight: 25,
  },

  emptyNotes: {
    flex: 1,
    minHeight: 95,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  actionSection: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },

  favouriteButton: {
    minHeight: 52,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  favouriteButtonText: {
    color: "#ffffff",
    fontSize: fontSize.md,
    fontWeight: "800",
  },

  manageActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  updateButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  updateButtonText: {
    color: "#d97706",
    fontSize: fontSize.md,
    fontWeight: "800",
  },

  deleteButton: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },

  deleteButtonText: {
    fontSize: fontSize.md,
    fontWeight: "800",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalContainer: {
    maxHeight: "92%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },

  modalHeader: {
    minHeight: 76,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth:
      StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalHeaderText: {
    flex: 1,
    paddingRight: spacing.sm,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "800",
  },

  modalSubtitle: {
    marginTop: 3,
    fontSize: 12,
  },

  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  modalContent: {
    padding: spacing.md,
    gap: spacing.md,
  },

  fieldGroup: {
    gap: 7,
  },

  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: "700",
  },

  inputContainer: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  multilineContainer: {
    minHeight: 125,
    alignItems: "flex-start",
    paddingTop: spacing.md,
  },

  multilineIcon: {
    marginTop: 2,
  },

  input: {
    flex: 1,
    minHeight: 50,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
  },

  multilineInput: {
    minHeight: 100,
    paddingTop: 0,
  },

  modalFooter: {
    padding: spacing.md,
    borderTopWidth:
      StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.sm,
  },

  cancelModalButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelModalText: {
    fontSize: fontSize.sm,
    fontWeight: "700",
  },

  saveModalButton: {
    flex: 1.5,
    minHeight: 50,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  saveModalText: {
    color: "#ffffff",
    fontSize: fontSize.sm,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },

  disabled: {
    opacity: 0.5,
  },
});