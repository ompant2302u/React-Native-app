// src/screens/ProfileScreen.jsx

import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { useTheme } from "../contexts/ThemeContext";
import { useProfile } from "../contexts/ProfileContext";
import { useCollection } from "../contexts/CollectionContext";

import {
  spacing,
  fontSize,
  radius,
  shadow,
} from "../constants/theme";

export default function ProfileScreen() {
  const { colors, mode, toggle } = useTheme();
  const { profile, updateProfile } = useProfile();
  const { meals = [], favourites = [] } = useCollection();
  const insets = useSafeAreaInsets();

  const currentProfile = {
    name: profile?.name || "",
    bio: profile?.bio || "",
    avatar: profile?.avatar || "",
  };

  const [editing, setEditing] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const [draft, setDraft] = useState({
    name: currentProfile.name,
    bio: currentProfile.bio,
    avatar: currentProfile.avatar,
  });

  const displayedProfile = editing
    ? draft
    : currentProfile;

  const myMeals = useMemo(
    () =>
      meals.filter(
        (meal) => meal.source === "mine"
      ),
    [meals]
  );

  const profileCompletion = useMemo(() => {
    const fields = [
      currentProfile.name.trim(),
      currentProfile.bio.trim(),
      currentProfile.avatar.trim(),
    ];

    const completedFields =
      fields.filter(Boolean).length;

    return Math.round(
      (completedFields / fields.length) * 100
    );
  }, [
    currentProfile.name,
    currentProfile.bio,
    currentProfile.avatar,
  ]);

  const favouritePercentage = useMemo(() => {
    if (meals.length === 0) {
      return 0;
    }

    return Math.round(
      (favourites.length / meals.length) * 100
    );
  }, [favourites.length, meals.length]);

  const initials = getInitials(
    displayedProfile.name
  );

  const hasAvatar =
    Boolean(displayedProfile.avatar?.trim()) &&
    !imageFailed;

  const palette =
    mode === "dark"
      ? {
          control: "#1f2937",
          profileCover: "#172033",
          avatarBackground: "#1d4ed8",
          blueSoft: "#172554",
          pinkSoft: "#3f1726",
          greenSoft: "#12372f",
          orangeSoft: "#422d12",
          purpleSoft: "#2e1f4f",
          progressTrack: "#273449",
          completed: "#10b981",
          locked: "#64748b",
        }
      : {
          control: "#f1f5f9",
          profileCover: "#f8fafc",
          avatarBackground: "#2563eb",
          blueSoft: "#eff6ff",
          pinkSoft: "#fff1f2",
          greenSoft: "#ecfdf5",
          orangeSoft: "#fff7ed",
          purpleSoft: "#f5f3ff",
          progressTrack: "#e2e8f0",
          completed: "#10b981",
          locked: "#94a3b8",
        };

  function startEditing() {
    setDraft({
      name: currentProfile.name,
      bio: currentProfile.bio,
      avatar: currentProfile.avatar,
    });

    setImageFailed(false);
    setEditing(true);
  }

  function cancelEditing() {
    setDraft({
      name: currentProfile.name,
      bio: currentProfile.bio,
      avatar: currentProfile.avatar,
    });

    setImageFailed(false);
    setEditing(false);
  }

  function saveProfile() {
    const name = draft.name.trim();

    if (!name) {
      Alert.alert(
        "Name required",
        "Please enter your name."
      );

      return;
    }

    updateProfile({
      name,
      bio: draft.bio.trim(),
      avatar: draft.avatar.trim(),
    });

    setImageFailed(false);
    setEditing(false);
  }

  async function selectProfileImage() {
    if (pickingImage) {
      return;
    }

    try {
      setPickingImage(true);

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Photo permission required",
          "Allow access to your photos to choose a profile picture."
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (
        result.canceled ||
        !result.assets?.length
      ) {
        return;
      }

      const selectedUri =
        result.assets[0]?.uri;

      if (!selectedUri) {
        Alert.alert(
          "Image error",
          "The selected image could not be loaded."
        );

        return;
      }

      setImageFailed(false);

      if (editing) {
        setDraft((current) => ({
          ...current,
          avatar: selectedUri,
        }));
      } else {
        updateProfile({
          name: currentProfile.name,
          bio: currentProfile.bio,
          avatar: selectedUri,
        });
      }
    } catch (error) {
      console.error(
        "Profile image picker error:",
        error
      );

      Alert.alert(
        "Unable to open gallery",
        "Please try selecting the image again."
      );
    } finally {
      setPickingImage(false);
    }
  }

  function removeProfileImage() {
    setImageFailed(false);

    if (editing) {
      setDraft((current) => ({
        ...current,
        avatar: "",
      }));

      return;
    }

    updateProfile({
      name: currentProfile.name,
      bio: currentProfile.bio,
      avatar: "",
    });
  }

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
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
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
                styles.headerTitle,
                { color: colors.text },
              ]}
            >
              Profile
            </Text>

            <Text
              style={[
                styles.headerSubtitle,
                { color: colors.textMuted },
              ]}
            >
              Your account and collection activity
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

        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                spacing.xxl + insets.bottom,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Profile card */}

          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: colors.surface,
                ...shadow(1),
              },
            ]}
          >
            <View
              style={[
                styles.profileCover,
                {
                  backgroundColor:
                    palette.profileCover,
                },
              ]}
            >
              <View
                style={[
                  styles.coverCircleLarge,
                  {
                    backgroundColor:
                      palette.blueSoft,
                  },
                ]}
              />

              <View
                style={[
                  styles.coverCircleSmall,
                  {
                    backgroundColor:
                      palette.greenSoft,
                  },
                ]}
              />
            </View>

            <View style={styles.profileContent}>
              <Pressable
                onPress={selectProfileImage}
                disabled={pickingImage}
                style={({ pressed }) => [
                  styles.avatarPressable,
                  pressed && styles.avatarPressed,
                ]}
              >
                <View
                  style={[
                    styles.avatarOuter,
                    {
                      backgroundColor:
                        colors.surface,
                    },
                  ]}
                >
                  {hasAvatar ? (
                    <Image
                      source={{
                        uri: displayedProfile.avatar,
                      }}
                      style={styles.avatar}
                      resizeMode="cover"
                      onError={() =>
                        setImageFailed(true)
                      }
                    />
                  ) : (
                    <View
                      style={[
                        styles.avatar,
                        styles.avatarFallback,
                        {
                          backgroundColor:
                            palette.avatarBackground,
                        },
                      ]}
                    >
                      <Text
                        style={styles.avatarInitials}
                      >
                        {initials}
                      </Text>
                    </View>
                  )}
                </View>

                <View
                  style={[
                    styles.cameraButton,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      pickingImage
                        ? "hourglass-outline"
                        : "camera-outline"
                    }
                    size={17}
                    color="#ffffff"
                  />
                </View>
              </Pressable>

              {!editing ? (
                <>
                  <Text
                    style={[
                      styles.profileName,
                      { color: colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {currentProfile.name ||
                      "Your name"}
                  </Text>

                  <Text
                    style={[
                      styles.profileBio,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    {currentProfile.bio?.trim() ||
                      "Add a short bio to introduce yourself."}
                  </Text>

                  <View style={styles.profileActions}>
                    <Pressable
                      onPress={startEditing}
                      style={({ pressed }) => [
                        styles.editProfileButton,
                        {
                          backgroundColor:
                            colors.primary,
                        },
                        pressed &&
                          styles.pressed,
                      ]}
                    >
                      <Ionicons
                        name="pencil-outline"
                        size={18}
                        color="#ffffff"
                      />

                      <Text
                        style={
                          styles.editProfileText
                        }
                      >
                        Edit profile
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={selectProfileImage}
                      disabled={pickingImage}
                      style={({ pressed }) => [
                        styles.changePhotoButton,
                        {
                          backgroundColor:
                            palette.blueSoft,
                        },
                        pressed &&
                          styles.pressed,
                      ]}
                    >
                      <Ionicons
                        name="image-outline"
                        size={18}
                        color={colors.primary}
                      />

                      <Text
                        style={[
                          styles.changePhotoText,
                          {
                            color:
                              colors.primary,
                          },
                        ]}
                      >
                        Change photo
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <View style={styles.editForm}>
                  <ProfileField
                    label="Display name"
                    icon="person-outline"
                    value={draft.name}
                    placeholder="Enter your name"
                    maxLength={60}
                    colors={colors}
                    onChangeText={(value) =>
                      setDraft((current) => ({
                        ...current,
                        name: value,
                      }))
                    }
                  />

                  <ProfileField
                    label="Bio"
                    icon="document-text-outline"
                    value={draft.bio}
                    placeholder="Write something about yourself"
                    maxLength={180}
                    multiline
                    colors={colors}
                    onChangeText={(value) =>
                      setDraft((current) => ({
                        ...current,
                        bio: value,
                      }))
                    }
                  />

                  <Text
                    style={[
                      styles.characterCount,
                      {
                        color:
                          colors.textFaint,
                      },
                    ]}
                  >
                    {draft.bio.length}/180
                  </Text>

                  <View style={styles.photoActions}>
                    <Pressable
                      onPress={selectProfileImage}
                      disabled={pickingImage}
                      style={({ pressed }) => [
                        styles.selectPhotoButton,
                        {
                          backgroundColor:
                            palette.blueSoft,
                        },
                        pressed &&
                          styles.pressed,
                      ]}
                    >
                      <Ionicons
                        name="images-outline"
                        size={18}
                        color={colors.primary}
                      />

                      <Text
                        style={[
                          styles.selectPhotoText,
                          {
                            color:
                              colors.primary,
                          },
                        ]}
                      >
                        Select photo
                      </Text>
                    </Pressable>

                    {Boolean(draft.avatar) && (
                      <Pressable
                        onPress={
                          removeProfileImage
                        }
                        style={({ pressed }) => [
                          styles.removePhotoButton,
                          {
                            backgroundColor:
                              palette.pinkSoft,
                          },
                          pressed &&
                            styles.pressed,
                        ]}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#ef4444"
                        />

                        <Text
                          style={
                            styles.removePhotoText
                          }
                        >
                          Remove
                        </Text>
                      </Pressable>
                    )}
                  </View>

                  <View style={styles.formActions}>
                    <Pressable
                      onPress={cancelEditing}
                      style={({ pressed }) => [
                        styles.cancelButton,
                        {
                          backgroundColor:
                            palette.control,
                        },
                        pressed &&
                          styles.pressed,
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
                      onPress={saveProfile}
                      style={({ pressed }) => [
                        styles.saveButton,
                        {
                          backgroundColor:
                            colors.primary,
                        },
                        pressed &&
                          styles.pressed,
                      ]}
                    >
                      <Ionicons
                        name="checkmark"
                        size={19}
                        color="#ffffff"
                      />

                      <Text
                        style={
                          styles.saveButtonText
                        }
                      >
                        Save changes
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Collection overview */}

          <SectionHeader
            title="Your activity"
            subtitle="Overview of your recipe collection"
            colors={colors}
          />

          <View style={styles.statsRow}>
            <StatCard
              icon="restaurant-outline"
              value={meals.length}
              label="All meals"
              iconColor={colors.primary}
              iconBackground={palette.blueSoft}
              colors={colors}
            />

            <StatCard
              icon="heart"
              value={favourites.length}
              label="Favourites"
              iconColor="#e11d48"
              iconBackground={palette.pinkSoft}
              colors={colors}
            />

            <StatCard
              icon="create-outline"
              value={myMeals.length}
              label="My recipes"
              iconColor="#10b981"
              iconBackground={palette.greenSoft}
              colors={colors}
            />
          </View>

          {/* Profile completion */}

          <SectionHeader
            title="Profile completion"
            subtitle="Complete your basic account details"
            colors={colors}
          />

          <View
            style={[
              styles.completionCard,
              {
                backgroundColor: colors.surface,
                ...shadow(1),
              },
            ]}
          >
            <View style={styles.completionHeader}>
              <View
                style={[
                  styles.completionIcon,
                  {
                    backgroundColor:
                      palette.orangeSoft,
                  },
                ]}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color="#f59e0b"
                />
              </View>

              <View style={styles.completionText}>
                <Text
                  style={[
                    styles.completionTitle,
                    { color: colors.text },
                  ]}
                >
                  Complete your profile
                </Text>

                <Text
                  style={[
                    styles.completionSubtitle,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  Add your name, bio and profile
                  photo
                </Text>
              </View>

              <Text
                style={[
                  styles.completionValue,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                {profileCompletion}%
              </Text>
            </View>

            <View
              style={[
                styles.progressTrack,
                {
                  backgroundColor:
                    palette.progressTrack,
                },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${profileCompletion}%`,
                    backgroundColor:
                      colors.primary,
                  },
                ]}
              />
            </View>

            <View style={styles.checklist}>
              <ChecklistItem
                title="Display name"
                completed={Boolean(
                  currentProfile.name.trim()
                )}
                colors={colors}
                completedBackground={
                  palette.greenSoft
                }
              />

              <ChecklistItem
                title="Profile bio"
                completed={Boolean(
                  currentProfile.bio.trim()
                )}
                colors={colors}
                completedBackground={
                  palette.greenSoft
                }
              />

              <ChecklistItem
                title="Profile photo"
                completed={Boolean(
                  currentProfile.avatar.trim()
                )}
                colors={colors}
                completedBackground={
                  palette.greenSoft
                }
              />
            </View>
          </View>

          {/* Collection insights */}

          <SectionHeader
            title="Collection insights"
            subtitle="A quick summary of your recipe habits"
            colors={colors}
          />

          <View
            style={[
              styles.insightsCard,
              {
                backgroundColor: colors.surface,
                ...shadow(1),
              },
            ]}
          >
            <InsightRow
              icon="heart-outline"
              title="Favourite rate"
              description="Recipes saved as favourites"
              value={`${favouritePercentage}%`}
              iconColor="#e11d48"
              iconBackground={palette.pinkSoft}
              valueBackground={palette.pinkSoft}
              valueColor="#e11d48"
              colors={colors}
            />

            <InsightRow
              icon="create-outline"
              title="Recipes created"
              description="Recipes added by you"
              value={String(myMeals.length)}
              iconColor="#10b981"
              iconBackground={palette.greenSoft}
              valueBackground={palette.greenSoft}
              valueColor="#10b981"
              colors={colors}
            />

            <InsightRow
              icon="albums-outline"
              title="Collection size"
              description="Total recipes available"
              value={String(meals.length)}
              iconColor={colors.primary}
              iconBackground={palette.blueSoft}
              valueBackground={palette.blueSoft}
              valueColor={colors.primary}
              colors={colors}
            />

            <InsightRow
              icon="person-circle-outline"
              title="Profile status"
              description="Overall profile completion"
              value={`${profileCompletion}%`}
              iconColor="#8b5cf6"
              iconBackground={palette.purpleSoft}
              valueBackground={palette.purpleSoft}
              valueColor="#8b5cf6"
              colors={colors}
            />
          </View>

          {/* Achievements */}

          <SectionHeader
            title="Achievements"
            subtitle="Milestones from your collection"
            colors={colors}
          />

          <View style={styles.achievementsGrid}>
            <AchievementCard
              icon="restaurant-outline"
              title="Meal explorer"
              description="Build your first collection"
              unlocked={meals.length > 0}
              backgroundColor={palette.blueSoft}
              iconColor={colors.primary}
              colors={colors}
              completedColor={palette.completed}
              lockedColor={palette.locked}
            />

            <AchievementCard
              icon="heart-outline"
              title="First favourite"
              description="Save a recipe you love"
              unlocked={favourites.length > 0}
              backgroundColor={palette.pinkSoft}
              iconColor="#e11d48"
              colors={colors}
              completedColor={palette.completed}
              lockedColor={palette.locked}
            />

            <AchievementCard
              icon="create-outline"
              title="Recipe creator"
              description="Create your first recipe"
              unlocked={myMeals.length > 0}
              backgroundColor={palette.greenSoft}
              iconColor="#10b981"
              colors={colors}
              completedColor={palette.completed}
              lockedColor={palette.locked}
            />

            <AchievementCard
              icon="ribbon-outline"
              title="Complete profile"
              description="Finish all profile details"
              unlocked={profileCompletion === 100}
              backgroundColor={palette.orangeSoft}
              iconColor="#f59e0b"
              colors={colors}
              completedColor={palette.completed}
              lockedColor={palette.locked}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function ProfileField({
  label,
  icon,
  value,
  placeholder,
  onChangeText,
  colors,
  multiline = false,
  maxLength,
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
          styles.inputWrapper,
          {
            backgroundColor: colors.bg,
            borderColor: colors.border,
          },
          multiline &&
            styles.multilineWrapper,
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
          multiline={multiline}
          maxLength={maxLength}
          numberOfLines={multiline ? 4 : 1}
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

function SectionHeader({
  title,
  subtitle,
  colors,
}) {
  return (
    <View style={styles.sectionHeader}>
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
  );
}

function StatCard({
  icon,
  value,
  label,
  iconColor,
  iconBackground,
  colors,
}) {
  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: colors.surface,
          ...shadow(1),
        },
      ]}
    >
      <View
        style={[
          styles.statIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={iconColor}
        />
      </View>

      <Text
        style={[
          styles.statValue,
          { color: colors.text },
        ]}
      >
        {value}
      </Text>

      <Text
        style={[
          styles.statLabel,
          { color: colors.textMuted },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

function ChecklistItem({
  title,
  completed,
  colors,
  completedBackground,
}) {
  return (
    <View style={styles.checklistItem}>
      <View
        style={[
          styles.checkIcon,
          {
            backgroundColor: completed
              ? completedBackground
              : colors.bg,
          },
        ]}
      >
        <Ionicons
          name={
            completed
              ? "checkmark"
              : "ellipse-outline"
          }
          size={16}
          color={
            completed
              ? "#10b981"
              : colors.textFaint
          }
        />
      </View>

      <Text
        style={[
          styles.checklistText,
          {
            color: completed
              ? colors.text
              : colors.textMuted,
          },
        ]}
      >
        {title}
      </Text>
    </View>
  );
}

function InsightRow({
  icon,
  title,
  description,
  value,
  iconColor,
  iconBackground,
  valueBackground,
  valueColor,
  colors,
}) {
  return (
    <View style={styles.insightRow}>
      <View
        style={[
          styles.insightIcon,
          { backgroundColor: iconBackground },
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={iconColor}
        />
      </View>

      <View style={styles.insightText}>
        <Text
          style={[
            styles.insightTitle,
            { color: colors.text },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.insightDescription,
            { color: colors.textMuted },
          ]}
        >
          {description}
        </Text>
      </View>

      <View
        style={[
          styles.insightValueBox,
          { backgroundColor: valueBackground },
        ]}
      >
        <Text
          style={[
            styles.insightValue,
            { color: valueColor },
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function AchievementCard({
  icon,
  title,
  description,
  unlocked,
  backgroundColor,
  iconColor,
  colors,
  completedColor,
  lockedColor,
}) {
  return (
    <View
      style={[
        styles.achievementCard,
        {
          backgroundColor: colors.surface,
          ...shadow(1),
        },
      ]}
    >
      <View style={styles.achievementTop}>
        <View
          style={[
            styles.achievementIcon,
            { backgroundColor },
          ]}
        >
          <Ionicons
            name={icon}
            size={23}
            color={iconColor}
          />
        </View>

        <View
          style={[
            styles.achievementStatus,
            {
              backgroundColor: unlocked
                ? "rgba(16,185,129,0.14)"
                : colors.bg,
            },
          ]}
        >
          <Ionicons
            name={
              unlocked
                ? "checkmark-circle"
                : "lock-closed-outline"
            }
            size={17}
            color={
              unlocked
                ? completedColor
                : lockedColor
            }
          />
        </View>
      </View>

      <Text
        style={[
          styles.achievementTitle,
          { color: colors.text },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.achievementDescription,
          { color: colors.textMuted },
        ]}
      >
        {description}
      </Text>

      <Text
        style={[
          styles.achievementLabel,
          {
            color: unlocked
              ? completedColor
              : lockedColor,
          },
        ]}
      >
        {unlocked ? "Unlocked" : "Locked"}
      </Text>
    </View>
  );
}

function getInitials(name = "") {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!words.length) {
    return "U";
  }

  return words
    .map((word) =>
      word.charAt(0).toUpperCase()
    )
    .join("");
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  flex: {
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

  headerTitle: {
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

  scrollContent: {
    paddingTop: spacing.sm,
  },

  profileCard: {
    marginHorizontal: spacing.md,
    borderRadius: 24,
    overflow: "hidden",
  },

  profileCover: {
    height: 92,
    position: "relative",
    overflow: "hidden",
  },

  coverCircleLarge: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    right: -45,
    top: -80,
  },

  coverCircleSmall: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    left: -35,
    bottom: -65,
  },

  profileContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    alignItems: "center",
  },

  avatarPressable: {
    position: "relative",
    marginTop: -54,
  },

  avatarPressed: {
    transform: [{ scale: 0.97 }],
  },

  avatarOuter: {
    width: 116,
    height: 116,
    borderRadius: 58,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: 106,
    height: 106,
    borderRadius: 53,
  },

  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },

  avatarInitials: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "800",
  },

  cameraButton: {
    position: "absolute",
    right: 1,
    bottom: 2,
    width: 35,
    height: 35,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  profileName: {
    maxWidth: "90%",
    marginTop: spacing.sm,
    fontSize: 23,
    fontWeight: "800",
    textAlign: "center",
  },

  profileBio: {
    maxWidth: 320,
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    lineHeight: 21,
    textAlign: "center",
  },

  profileActions: {
    width: "100%",
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
  },

  editProfileButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  editProfileText: {
    color: "#ffffff",
    fontSize: fontSize.sm,
    fontWeight: "800",
  },

  changePhotoButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  changePhotoText: {
    fontSize: fontSize.sm,
    fontWeight: "700",
  },

  editForm: {
    width: "100%",
    marginTop: spacing.md,
    gap: spacing.md,
  },

  fieldGroup: {
    gap: 7,
  },

  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: "700",
  },

  inputWrapper: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  multilineWrapper: {
    minHeight: 110,
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
    minHeight: 86,
    paddingTop: 0,
  },

  characterCount: {
    marginTop: -spacing.sm,
    fontSize: 11,
    textAlign: "right",
  },

  photoActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  selectPhotoButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  selectPhotoText: {
    fontSize: 13,
    fontWeight: "700",
  },

  removePhotoButton: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  removePhotoText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "700",
  },

  formActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  cancelButton: {
    flex: 1,
    minHeight: 48,
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
    minHeight: 48,
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

  sectionHeader: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },

  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
  },

  statsRow: {
    marginHorizontal: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
  },

  statCard: {
    flex: 1,
    minHeight: 118,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
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
    marginTop: 3,
    fontSize: 10,
    textAlign: "center",
  },

  completionCard: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: 22,
  },

  completionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  completionIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  completionText: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },

  completionTitle: {
    fontSize: fontSize.md,
    fontWeight: "800",
  },

  completionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
  },

  completionValue: {
    fontSize: 20,
    fontWeight: "800",
  },

  progressTrack: {
    height: 8,
    marginTop: spacing.md,
    borderRadius: radius.pill,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: radius.pill,
  },

  checklist: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },

  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  checklistText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },

  insightsCard: {
    marginHorizontal: spacing.md,
    padding: spacing.sm,
    borderRadius: 22,
  },

  insightRow: {
    minHeight: 72,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },

  insightIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  insightText: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },

  insightTitle: {
    fontSize: fontSize.sm,
    fontWeight: "700",
  },

  insightDescription: {
    marginTop: 3,
    fontSize: 11,
  },

  insightValueBox: {
    minWidth: 51,
    minHeight: 34,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  insightValue: {
    fontSize: 13,
    fontWeight: "800",
  },

  achievementsGrid: {
    marginHorizontal: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  achievementCard: {
    width: "48%",
    minHeight: 176,
    padding: spacing.md,
    borderRadius: 21,
  },

  achievementTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  achievementIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  achievementStatus: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  achievementTitle: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    fontWeight: "800",
  },

  achievementDescription: {
    minHeight: 34,
    marginTop: 5,
    fontSize: 11,
    lineHeight: 16,
  },

  achievementLabel: {
    marginTop: spacing.sm,
    fontSize: 11,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.97 }],
  },
});