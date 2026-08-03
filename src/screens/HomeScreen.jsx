// src/screens/HomeScreen.jsx

import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { spacing, fontSize } from "../constants/theme";
import { MealCard } from "../components/MealItem";
import { useTheme } from "../contexts/ThemeContext";
import { useCollection } from "../contexts/CollectionContext";

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  category: "",
  minutes: "",
  image: "",
  tags: "",
  notes: "",
};

export default function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const { colors, toggle, mode } = useTheme();

  const {
    meals = [],
    favourites = [],
    updateMeal,
    removeMeal,
  } = useCollection();

  const [editingMeal, setEditingMeal] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const numberOfColumns = width >= 700 ? 2 : 1;

  const cardWidth =
    numberOfColumns === 2
      ? (width - spacing.md * 3) / 2
      : width - spacing.md * 2;

  const myMealsCount = useMemo(
    () =>
      meals.filter((meal) => meal.source === "mine")
        .length,
    [meals]
  );

  const palette =
    mode === "dark"
      ? {
          hero: "#111827",
          heroAccent: "#1d4ed8",
          surface: "#172033",
          control: "#1f2937",
          blueSoft: "#172554",
          pinkSoft: "#3f1726",
          greenSoft: "#12372f",
          orangeSoft: "#422d12",
          updateIcon: "#513810",
          deleteIcon: "#581c2b",
          glass: "rgba(255,255,255,0.12)",
          heroText: "rgba(255,255,255,0.76)",
          overlay: "rgba(0,0,0,0.72)",
        }
      : {
          hero: "#172554",
          heroAccent: "#2563eb",
          surface: "#ffffff",
          control: "#f1f5f9",
          blueSoft: "#eff6ff",
          pinkSoft: "#fff1f2",
          greenSoft: "#ecfdf5",
          orangeSoft: "#fff7ed",
          updateIcon: "#ffedd5",
          deleteIcon: "#ffe4e6",
          glass: "rgba(255,255,255,0.14)",
          heroText: "rgba(255,255,255,0.78)",
          overlay: "rgba(15,23,42,0.55)",
        };

  function openAddMeal() {
    navigation.navigate("AddMeal");
  }

  function openMeal(meal) {
    navigation.navigate("MealDetail", {
      id: meal.id,
    });
  }

  function openUpdateModal(meal) {
    setEditingMeal(meal);

    setEditForm({
      title:
        meal.title ||
        meal.name ||
        meal.mealName ||
        "",
      subtitle: meal.subtitle || "",
      category:
        meal.category ||
        meal.cuisine ||
        meal.type ||
        "",
      minutes:
        meal.minutes !== undefined &&
        meal.minutes !== null
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
  }

  function closeUpdateModal() {
    if (saving) {
      return;
    }

    setEditingMeal(null);
    setEditForm(EMPTY_FORM);
  }

  function updateField(field, value) {
    setEditForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function saveUpdatedMeal() {
    if (!editingMeal) {
      return;
    }

    const title = editForm.title.trim();

    if (!title) {
      Alert.alert(
        "Title required",
        "Please enter the recipe title."
      );
      return;
    }

    const minutesText = editForm.minutes.trim();

    const minutes = minutesText
      ? Number(minutesText)
      : null;

    if (
      minutesText &&
      (!Number.isFinite(minutes) || minutes < 0)
    ) {
      Alert.alert(
        "Invalid cooking time",
        "Enter a valid cooking time in minutes."
      );
      return;
    }

    try {
      setSaving(true);

      const updates = {
        title,
        subtitle: editForm.subtitle.trim(),
        category: editForm.category.trim(),
        minutes,
        image: editForm.image.trim(),
        tags: editForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        notes: editForm.notes.trim(),
        description: editForm.notes.trim(),
      };

      if (
        Object.prototype.hasOwnProperty.call(
          editingMeal,
          "name"
        )
      ) {
        updates.name = title;
      }

      if (
        Object.prototype.hasOwnProperty.call(
          editingMeal,
          "mealName"
        )
      ) {
        updates.mealName = title;
      }

      updateMeal(editingMeal.id, updates);

      setEditingMeal(null);
      setEditForm(EMPTY_FORM);
    } catch (error) {
      console.error("Update meal error:", error);

      Alert.alert(
        "Update failed",
        "The recipe could not be updated."
      );
    } finally {
      setSaving(false);
    }
  }

  function confirmDeleteMeal(meal) {
    const mealTitle =
      meal.title ||
      meal.name ||
      meal.mealName ||
      "this recipe";

    Alert.alert(
      "Delete recipe",
      `Are you sure you want to delete "${mealTitle}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMeal(meal.id),
        },
      ]
    );
  }

  function deleteMeal(id) {
    try {
      setDeletingId(id);
      removeMeal(id);
    } catch (error) {
      console.error("Delete meal error:", error);

      Alert.alert(
        "Delete failed",
        "The recipe could not be deleted."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const listHeader = (
    <View>
      <View
        style={[
          styles.hero,
          {
            backgroundColor: palette.hero,
          },
        ]}
      >
        <View
          style={[
            styles.heroCircleLarge,
            {
              backgroundColor:
                palette.heroAccent,
            },
          ]}
        />

        <View
          style={[
            styles.heroCircleSmall,
            {
              backgroundColor: palette.glass,
            },
          ]}
        />

        <View
          style={[
            styles.heroBadge,
            {
              backgroundColor: palette.glass,
            },
          ]}
        >
          <Ionicons
            name="sparkles-outline"
            size={14}
            color="#ffffff"
          />

          <Text style={styles.heroBadgeText}>
            Your personal cookbook
          </Text>
        </View>

        <Text style={styles.heroTitle}>
          What are you cooking today?
        </Text>

        <Text
          style={[
            styles.heroDescription,
            {
              color: palette.heroText,
            },
          ]}
        >
          Create, organize and manage your favourite
          recipes in one place.
        </Text>

        <Pressable
          onPress={openAddMeal}
          style={({ pressed }) => [
            styles.addRecipeButton,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.addRecipeIcon}>
            <Ionicons
              name="add"
              size={21}
              color="#2563eb"
            />
          </View>

          <Text style={styles.addRecipeText}>
            Add new recipe
          </Text>

          <Ionicons
            name="arrow-forward"
            size={18}
            color="#172554"
          />
        </Pressable>
      </View>

      <View style={styles.collectionHeader}>
        <View>
          <Text
            style={[
              styles.collectionTitle,
              { color: colors.text },
            ]}
          >
            Your collection
          </Text>

          <Text
            style={[
              styles.collectionSubtitle,
              { color: colors.textMuted },
            ]}
          >
            {meals.length}{" "}
            {meals.length === 1
              ? "recipe"
              : "recipes"}
          </Text>
        </View>

        <View
          style={[
            styles.manageBadge,
            {
              backgroundColor:
                palette.blueSoft,
            },
          ]}
        >

        </View>
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
              styles.headerTitle,
              { color: colors.text },
            ]}
          >
            Meal Collection
          </Text>

          <Text
            style={[
              styles.headerSubtitle,
              { color: colors.textMuted },
            ]}
          >
            Manage your personal recipes
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

      <FlatList
        key={numberOfColumns}
        data={meals}
        numColumns={numberOfColumns}
        ListHeaderComponent={listHeader}
        keyExtractor={(item, index) =>
          String(item.id ?? index)
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom:
              spacing.xxl + insets.bottom,
          },
          meals.length === 0 &&
            styles.emptyList,
        ]}
        columnWrapperStyle={
          numberOfColumns > 1
            ? styles.columnWrapper
            : undefined
        }
        renderItem={({ item }) => {
          const isDeleting =
            String(deletingId) ===
            String(item.id);

          return (
            <View
              style={[
                styles.mealCardContainer,
                {
                  width: cardWidth,
                  backgroundColor:
                    palette.surface,
                },
              ]}
            >
              <View style={styles.mealContent}>
                <MealCard
                  item={item}
                  onPress={(selectedMeal) =>
                    openMeal(
                      selectedMeal || item
                    )
                  }
                />
              </View>

              <View style={styles.actionArea}>
                <Pressable
                  onPress={() =>
                    openUpdateModal(item)
                  }
                  disabled={isDeleting}
                  accessibilityRole="button"
                  accessibilityLabel="Update recipe"
                  style={({ pressed }) => [
                    styles.actionButton,
                    {
                      backgroundColor:
                        palette.orangeSoft,
                    },
                    pressed && styles.pressed,
                    isDeleting &&
                      styles.disabled,
                  ]}
                >
                  <View
                    style={[
                      styles.actionIcon,
                      {
                        backgroundColor:
                          palette.updateIcon,
                      },
                    ]}
                  >
                    <Ionicons
                      name="create-outline"
                      size={19}
                      color="#d97706"
                    />
                  </View>

                  <View style={styles.actionText}>
                    <Text
                      style={
                        styles.updateTitle
                      }
                    >
                      Update
                    </Text>

                    <Text
                      style={[
                        styles.actionSubtitle,
                        {
                          color:
                            colors.textMuted,
                        },
                      ]}
                    >
                      Edit this recipe
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() =>
                    confirmDeleteMeal(item)
                  }
                  disabled={isDeleting}
                  accessibilityRole="button"
                  accessibilityLabel="Delete recipe"
                  style={({ pressed }) => [
                    styles.actionButton,
                    {
                      backgroundColor:
                        palette.pinkSoft,
                    },
                    pressed && styles.pressed,
                    isDeleting &&
                      styles.disabled,
                  ]}
                >
                  <View
                    style={[
                      styles.actionIcon,
                      {
                        backgroundColor:
                          palette.deleteIcon,
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        isDeleting
                          ? "hourglass-outline"
                          : "trash-outline"
                      }
                      size={19}
                      color="#ef4444"
                    />
                  </View>

                  <View style={styles.actionText}>
                    <Text
                      style={
                        styles.deleteTitle
                      }
                    >
                      {isDeleting
                        ? "Deleting"
                        : "Delete"}
                    </Text>

                    <Text
                      style={[
                        styles.actionSubtitle,
                        {
                          color:
                            colors.textMuted,
                        },
                      ]}
                    >
                      Remove this recipe
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            colors={colors}
            backgroundColor={palette.blueSoft}
            onAdd={openAddMeal}
          />
        }
      />

      <Modal
        visible={Boolean(editingMeal)}
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
            <View style={styles.modalHeader}>
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
                  Edit the selected recipe
                </Text>
              </View>

              <Pressable
                onPress={closeUpdateModal}
                disabled={saving}
                style={[
                  styles.modalCloseButton,
                  {
                    backgroundColor:
                      palette.control,
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
                  updateField(
                    "title",
                    value
                  )
                }
              />

              <FormField
                label="Subtitle"
                icon="text-outline"
                value={editForm.subtitle}
                placeholder="Short recipe subtitle"
                colors={colors}
                onChangeText={(value) =>
                  updateField(
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
                  updateField(
                    "category",
                    value
                  )
                }
              />

              <FormField
                label="Cooking time"
                icon="time-outline"
                value={editForm.minutes}
                placeholder="Example: 30"
                keyboardType="numeric"
                colors={colors}
                onChangeText={(value) =>
                  updateField(
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
                  updateField(
                    "image",
                    value
                  )
                }
              />

              <FormField
                label="Tags"
                icon="pricetags-outline"
                value={editForm.tags}
                placeholder="Dinner, Easy, Healthy"
                colors={colors}
                onChangeText={(value) =>
                  updateField(
                    "tags",
                    value
                  )
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
                  updateField(
                    "notes",
                    value
                  )
                }
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                onPress={closeUpdateModal}
                disabled={saving}
                style={({ pressed }) => [
                  styles.cancelButton,
                  {
                    backgroundColor:
                      palette.control,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.cancelButtonText,
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
                  styles.saveButton,
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

                <Text style={styles.saveButtonText}>
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
  value,
  label,
  iconColor,
  iconBackground,
  backgroundColor,
  textColor,
  mutedColor,
}) {
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor },
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
          { color: textColor },
        ]}
      >
        {value}
      </Text>

      <Text
        numberOfLines={1}
        style={[
          styles.statLabel,
          { color: mutedColor },
        ]}
      >
        {label}
      </Text>
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

function EmptyState({
  colors,
  backgroundColor,
  onAdd,
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
          name="restaurant-outline"
          size={40}
          color={colors.primary}
        />
      </View>

      <Text
        style={[
          styles.emptyTitle,
          { color: colors.text },
        ]}
      >
        Your collection is empty
      </Text>

      <Text
        style={[
          styles.emptyDescription,
          { color: colors.textMuted },
        ]}
      >
        Add your first recipe to start your personal
        collection.
      </Text>

      <Pressable
        onPress={onAdd}
        style={({ pressed }) => [
          styles.emptyButton,
          {
            backgroundColor: colors.primary,
          },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="add"
          size={19}
          color="#ffffff"
        />

        <Text style={styles.emptyButtonText}>
          Add first recipe
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
    minHeight: 72,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerText: {
    flex: 1,
    paddingRight: spacing.sm,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    marginTop: 3,
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
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },

  emptyList: {
    flexGrow: 1,
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 28,
  },

  heroCircleLarge: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -125,
    right: -65,
    opacity: 0.78,
  },

  heroCircleSmall: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    left: -55,
    bottom: -60,
  },

  heroBadge: {
    alignSelf: "flex-start",
    minHeight: 29,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  heroBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },

  heroTitle: {
    maxWidth: 330,
    marginTop: spacing.md,
    color: "#ffffff",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.7,
  },

  heroDescription: {
    maxWidth: 340,
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },

  addRecipeButton: {
    alignSelf: "flex-start",
    minHeight: 48,
    marginTop: spacing.lg,
    paddingLeft: 6,
    paddingRight: spacing.md,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  addRecipeIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(37,99,235,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  addRecipeText: {
    color: "#172554",
    fontSize: fontSize.sm,
    fontWeight: "800",
  },

  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  statCard: {
    flex: 1,
    minHeight: 118,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },

  statIcon: {
    width: 41,
    height: 41,
    marginBottom: spacing.sm,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  statValue: {
    fontSize: 22,
    fontWeight: "800",
  },

  statLabel: {
    marginTop: 2,
    fontSize: 10,
    textAlign: "center",
  },

  collectionHeader: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  collectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "800",
  },

  collectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
  },

  manageBadge: {
    minHeight: 35,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  manageBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  columnWrapper: {
    gap: spacing.md,
  },

  mealCardContainer: {
    marginBottom: spacing.lg,
    borderRadius: 24,
    overflow: "hidden",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.11,
    shadowRadius: 12,
    elevation: 4,
  },

  mealContent: {
    overflow: "hidden",
  },

  actionArea: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.sm,
  },

  actionButton: {
    flex: 1,
    minHeight: 62,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  actionText: {
    flex: 1,
  },

  updateTitle: {
    color: "#d97706",
    fontSize: 13,
    fontWeight: "800",
  },

  deleteTitle: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "800",
  },

  actionSubtitle: {
    marginTop: 2,
    fontSize: 10,
  },

  emptyContainer: {
    minHeight: 340,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: spacing.lg,
    fontSize: fontSize.lg,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyDescription: {
    maxWidth: 320,
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    lineHeight: 20,
    textAlign: "center",
  },

  emptyButton: {
    minHeight: 46,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  emptyButtonText: {
    color: "#ffffff",
    fontSize: fontSize.sm,
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
    flexDirection: "row",
    gap: spacing.sm,
  },

  cancelButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontSize: fontSize.sm,
    fontWeight: "700",
  },

  saveButton: {
    flex: 1.5,
    minHeight: 50,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  saveButtonText: {
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