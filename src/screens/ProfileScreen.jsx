// src/screens/ProfileScreen.jsx

import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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
  const [draft, setDraft] = useState(currentProfile);
  const [pickingImage, setPickingImage] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

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

  const initials = getInitials(
    displayedProfile.name
  );

  const hasAvatar =
    Boolean(displayedProfile.avatar?.trim()) &&
    !imageFailed;

  const completion = useMemo(() => {
    const completedFields = [
      currentProfile.name.trim(),
      currentProfile.bio.trim(),
      currentProfile.avatar.trim(),
    ].filter(Boolean).length;

    return Math.round(
      (completedFields / 3) * 100
    );
  }, [
    currentProfile.name,
    currentProfile.bio,
    currentProfile.avatar,
  ]);

  const ui =
    mode === "dark"
      ? {
          hero: "#111827",
          heroAccent: "#1d4ed8",
          glass: "rgba(255,255,255,0.12)",
          softBlue: "#172554",
          softPink: "#3f1726",
          softGreen: "#12372f",
          softOrange: "#422d12",
          progressTrack: "#273449",
        }
      : {
          hero: "#172554",
          heroAccent: "#2563eb",
          glass: "rgba(255,255,255,0.14)",
          softBlue: "#eff6ff",
          softPink: "#fff1f2",
          softGreen: "#ecfdf5",
          softOrange: "#fff7ed",
          progressTrack: "#e2e8f0",
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
        setDraft((previous) => ({
          ...previous,
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
      setDraft((previous) => ({
        ...previous,
        avatar: "",
      }));
    } else {
      updateProfile({
        name: currentProfile.name,
        bio: currentProfile.bio,
        avatar: "",
      });
    }
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
              borderBottomColor: colors.border,
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
              Manage your personal information
            </Text>
          </View>

          {!editing ? (
            <Pressable
              onPress={startEditing}
              style={({ pressed }) => [
                styles.editButton,
                {
                  backgroundColor: ui.softBlue,
                },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="pencil-outline"
                size={17}
                color={colors.primary}
              />

              <Text
                style={[
                  styles.editButtonText,
                  { color: colors.primary },
                ]}
              >
                Edit
              </Text>
            </Pressable>
          ) : (
            <View style={styles.headerActions}>
              <Pressable
                onPress={cancelEditing}
                style={({ pressed }) => [
                  styles.cancelButton,
                  {
                    backgroundColor:
                      colors.surface,
                    borderColor: colors.border,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="close"
                  size={21}
                  color={colors.textMuted}
                />
              </Pressable>

              <Pressable
                onPress={saveProfile}
                style={({ pressed }) => [
                  styles.saveButton,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="checkmark"
                  size={18}
                  color="#ffffff"
                />

                <Text style={styles.saveButtonText}>
                  Save
                </Text>
              </Pressable>
            </View>
          )}
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
          {/* Profile hero */}

          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: ui.hero,
                ...shadow(1),
              },
            ]}
          >
            <View
              style={[
                styles.heroCircleLarge,
                {
                  backgroundColor:
                    ui.heroAccent,
                },
              ]}
            />

            <View
              style={[
                styles.heroCircleSmall,
                {
                  backgroundColor: ui.glass,
                },
              ]}
            />

            <View style={styles.heroBadges}>
              <View
                style={[
                  styles.heroBadge,
                  {
                    backgroundColor: ui.glass,
                  },
                ]}
              >
                <Ionicons
                  name="sparkles-outline"
                  size={14}
                  color="#ffffff"
                />

                <Text style={styles.heroBadgeText}>
                  Meal collector
                </Text>
              </View>

              <View
                style={[
                  styles.heroBadge,
                  {
                    backgroundColor: ui.glass,
                  },
                ]}
              >
                <View style={styles.activeDot} />

                <Text style={styles.heroBadgeText}>
                  Active
                </Text>
              </View>
            </View>

            <Pressable
              onPress={selectProfileImage}
              disabled={pickingImage}
              style={({ pressed }) => [
                styles.avatarButton,
                pressed && styles.avatarPressed,
              ]}
            >
              <View style={styles.avatarBorder}>
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
                          colors.primary,
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
                  size={18}
                  color="#ffffff"
                />
              </View>
            </Pressable>

            <Text
              style={styles.profileName}
              numberOfLines={1}
            >
              {displayedProfile.name ||
                "Your name"}
            </Text>

            <Text
              style={styles.profileBio}
              numberOfLines={3}
            >
              {displayedProfile.bio?.trim() ||
                "Add a short bio to tell others about yourself."}
            </Text>

            <Pressable
              onPress={selectProfileImage}
              disabled={pickingImage}
              style={({ pressed }) => [
                styles.choosePhotoButton,
                {
                  backgroundColor: ui.glass,
                },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="images-outline"
                size={18}
                color="#ffffff"
              />

              <Text style={styles.choosePhotoText}>
                {pickingImage
                  ? "Opening gallery..."
                  : "Choose profile photo"}
              </Text>
            </Pressable>
          </View>

          {/* Edit form */}

          {editing && (
            <View
              style={[
                styles.editCard,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor: colors.border,
                  ...shadow(1),
                },
              ]}
            >
              <SectionHeading
                icon="person-outline"
                title="Personal details"
                subtitle="Update your profile information"
                colors={colors}
                compact
              />

              <ProfileField
                label="Name"
                icon="person-outline"
                value={draft.name}
                placeholder="Enter your name"
                maxLength={60}
                colors={colors}
                onChangeText={(value) =>
                  setDraft((previous) => ({
                    ...previous,
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
                  setDraft((previous) => ({
                    ...previous,
                    bio: value,
                  }))
                }
              />

              <Text
                style={[
                  styles.characterCount,
                  { color: colors.textFaint },
                ]}
              >
                {draft.bio.length}/180
              </Text>

              <View style={styles.imageActions}>
                <Pressable
                  onPress={selectProfileImage}
                  disabled={pickingImage}
                  style={({ pressed }) => [
                    styles.selectImageButton,
                    {
                      backgroundColor:
                        ui.softBlue,
                    },
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="images-outline"
                    size={19}
                    color={colors.primary}
                  />

                  <Text
                    style={[
                      styles.selectImageText,
                      { color: colors.primary },
                    ]}
                  >
                    Select from device
                  </Text>
                </Pressable>

                {Boolean(draft.avatar) && (
                  <Pressable
                    onPress={removeProfileImage}
                    style={({ pressed }) => [
                      styles.removeImageButton,
                      {
                        backgroundColor:
                          ui.softPink,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color="#ef4444"
                    />

                    <Text
                      style={styles.removeImageText}
                    >
                      Remove
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}

          {/* Statistics */}

          <SectionHeading
            icon="analytics-outline"
            title="Collection overview"
            subtitle="Your meal activity"
            colors={colors}
          />

          <View style={styles.statsRow}>
            <StatCard
              icon="restaurant-outline"
              value={meals.length}
              label="Meals"
              iconColor={colors.primary}
              iconBackground={ui.softBlue}
              colors={colors}
            />

            <StatCard
              icon="heart"
              value={favourites.length}
              label="Favourites"
              iconColor="#f43f5e"
              iconBackground={ui.softPink}
              colors={colors}
            />

            <StatCard
              icon="create-outline"
              value={myMeals.length}
              label="My recipes"
              iconColor="#10b981"
              iconBackground={ui.softGreen}
              colors={colors}
            />
          </View>

          {/* Profile completion */}

          <SectionHeading
            icon="checkmark-circle-outline"
            title="Profile progress"
            subtitle="Complete your profile details"
            colors={colors}
          />

          <View
            style={[
              styles.progressCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                ...shadow(1),
              },
            ]}
          >
            <View style={styles.progressTop}>
              <View style={styles.progressInformation}>
                <View
                  style={[
                    styles.progressIcon,
                    {
                      backgroundColor:
                        ui.softOrange,
                    },
                  ]}
                >
                  <Ionicons
                    name="trophy-outline"
                    size={22}
                    color="#f59e0b"
                  />
                </View>

                <View style={styles.progressText}>
                  <Text
                    style={[
                      styles.progressTitle,
                      { color: colors.text },
                    ]}
                  >
                    Profile completion
                  </Text>

                  <Text
                    style={[
                      styles.progressSubtitle,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    Add your name, bio and photo
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.progressPercentage,
                  { color: colors.primary },
                ]}
              >
                {completion}%
              </Text>
            </View>

            <View
              style={[
                styles.progressTrack,
                {
                  backgroundColor:
                    ui.progressTrack,
                },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${completion}%`,
                    backgroundColor:
                      colors.primary,
                  },
                ]}
              />
            </View>
          </View>

          {/* Preferences */}

          <SectionHeading
            icon="options-outline"
            title="Preferences"
            subtitle="Customize your app"
            colors={colors}
          />

          <View
            style={[
              styles.settingsCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                ...shadow(1),
              },
            ]}
          >
            <SettingRow
              icon={
                mode === "dark"
                  ? "moon"
                  : "sunny-outline"
              }
              title="Dark mode"
              subtitle={
                mode === "dark"
                  ? "Dark appearance enabled"
                  : "Light appearance enabled"
              }
              iconColor={
                mode === "dark"
                  ? "#818cf8"
                  : "#f59e0b"
              }
              iconBackground={
                mode === "dark"
                  ? ui.softBlue
                  : ui.softOrange
              }
              colors={colors}
            >
              <Switch
                value={mode === "dark"}
                onValueChange={toggle}
                trackColor={{
                  false: colors.border,
                  true: colors.primary,
                }}
                thumbColor="#ffffff"
                ios_backgroundColor={
                  colors.border
                }
              />
            </SettingRow>
          </View>

          {/* About */}

          <SectionHeading
            icon="information-circle-outline"
            title="Application"
            subtitle="App information"
            colors={colors}
          />

          <View
            style={[
              styles.settingsCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                ...shadow(1),
              },
            ]}
          >
            <SettingRow
              icon="restaurant-outline"
              title="Meal Collection"
              subtitle="Save and organize your meals"
              iconColor={colors.primary}
              iconBackground={ui.softBlue}
              colors={colors}
            >
              <View
                style={[
                  styles.versionBadge,
                  {
                    backgroundColor:
                      ui.softBlue,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.versionText,
                    { color: colors.primary },
                  ]}
                >
                  v1.0
                </Text>
              </View>
            </SettingRow>

            <View
              style={[
                styles.divider,
                {
                  backgroundColor:
                    colors.border,
                },
              ]}
            />

            <SettingRow
              icon="code-slash-outline"
              title="Built with Expo"
              subtitle="React Native application"
              iconColor="#10b981"
              iconBackground={ui.softGreen}
              colors={colors}
            >
              <View
                style={[
                  styles.heartBadge,
                  {
                    backgroundColor:
                      ui.softPink,
                  },
                ]}
              >
                <Ionicons
                  name="heart"
                  size={16}
                  color="#f43f5e"
                />
              </View>
            </SettingRow>
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
  multiline = false,
  maxLength,
  colors,
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

function SectionHeading({
  icon,
  title,
  subtitle,
  colors,
  compact = false,
}) {
  return (
    <View
      style={[
        styles.sectionHeading,
        compact &&
          styles.compactSectionHeading,
      ]}
    >
      <View
        style={[
          styles.sectionIcon,
          {
            backgroundColor: colors.primary,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={17}
          color="#ffffff"
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
          borderColor: colors.border,
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

function SettingRow({
  icon,
  title,
  subtitle,
  iconColor,
  iconBackground,
  colors,
  children,
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInformation}>
        <View
          style={[
            styles.settingIcon,
            {
              backgroundColor:
                iconBackground,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={21}
            color={iconColor}
          />
        </View>

        <View style={styles.settingText}>
          <Text
            style={[
              styles.settingTitle,
              { color: colors.text },
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.settingSubtitle,
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
    minHeight: 72,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth:
      StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerText: {
    flex: 1,
    paddingRight: spacing.sm,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  editButton: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  editButtonText: {
    fontSize: fontSize.sm,
    fontWeight: "700",
  },

  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  saveButton: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
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

  scrollContent: {
    paddingTop: spacing.md,
  },

  heroCard: {
    position: "relative",
    overflow: "hidden",
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderRadius: 30,
    alignItems: "center",
  },

  heroCircleLarge: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    top: -125,
    right: -70,
    opacity: 0.76,
  },

  heroCircleSmall: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    left: -70,
    bottom: -75,
  },

  heroBadges: {
    width: "100%",
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroBadge: {
    minHeight: 30,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  heroBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#34d399",
  },

  avatarButton: {
    position: "relative",
  },

  avatarPressed: {
    transform: [{ scale: 0.97 }],
  },

  avatarBorder: {
    width: 122,
    height: 122,
    borderRadius: 61,
    padding: 5,
    backgroundColor:
      "rgba(255,255,255,0.96)",
    alignItems: "center",
    justifyContent: "center",
  },

  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },

  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },

  avatarInitials: {
    color: "#ffffff",
    fontSize: 38,
    fontWeight: "800",
  },

  cameraButton: {
    position: "absolute",
    right: 0,
    bottom: 3,
    width: 37,
    height: 37,
    borderRadius: 19,
    borderWidth: 3,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  profileName: {
    maxWidth: "90%",
    marginTop: spacing.md,
    color: "#ffffff",
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: -0.6,
    textAlign: "center",
  },

  profileBio: {
    maxWidth: 300,
    marginTop: spacing.xs,
    color: "rgba(255,255,255,0.76)",
    fontSize: fontSize.sm,
    lineHeight: 20,
    textAlign: "center",
  },

  choosePhotoButton: {
    minHeight: 41,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  choosePhotoText: {
    color: "#ffffff",
    fontSize: fontSize.sm,
    fontWeight: "700",
  },

  editCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 24,
    borderWidth:
      StyleSheet.hairlineWidth,
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
    borderRadius: 16,
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
    minHeight: 88,
    paddingTop: 0,
  },

  characterCount: {
    marginTop: -spacing.sm,
    fontSize: 11,
    textAlign: "right",
  },

  imageActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  selectImageButton: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: spacing.sm,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  selectImageText: {
    fontSize: 13,
    fontWeight: "700",
  },

  removeImageButton: {
    minHeight: 46,
    paddingHorizontal: spacing.md,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  removeImageText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "700",
  },

  sectionHeading: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  compactSectionHeading: {
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: spacing.xs,
  },

  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
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
    marginTop: 2,
    fontSize: 12,
  },

  statsRow: {
    marginHorizontal: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
  },

  statCard: {
    flex: 1,
    minHeight: 132,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderWidth:
      StyleSheet.hairlineWidth,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  statIcon: {
    width: 43,
    height: 43,
    marginBottom: spacing.sm,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  statValue: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  statLabel: {
    marginTop: 3,
    fontSize: 11,
    textAlign: "center",
  },

  progressCard: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: 22,
    borderWidth:
      StyleSheet.hairlineWidth,
  },

  progressTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  progressInformation: {
    flex: 1,
    paddingRight: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  progressIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  progressText: {
    flex: 1,
  },

  progressTitle: {
    fontSize: fontSize.md,
    fontWeight: "800",
  },

  progressSubtitle: {
    marginTop: 3,
    fontSize: 12,
  },

  progressPercentage: {
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

  settingsCard: {
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 22,
    borderWidth:
      StyleSheet.hairlineWidth,
    overflow: "hidden",
  },

  settingRow: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  settingInformation: {
    flex: 1,
    paddingRight: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  settingText: {
    flex: 1,
  },

  settingTitle: {
    fontSize: fontSize.md,
    fontWeight: "700",
  },

  settingSubtitle: {
    marginTop: 3,
    fontSize: 12,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 56,
  },

  versionBadge: {
    minWidth: 52,
    minHeight: 31,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  versionText: {
    fontSize: 12,
    fontWeight: "800",
  },

  heartBadge: {
    width: 35,
    height: 35,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});