// src/components/TagItem.jsx
// Theme-aware tag chips

import { View, Text, StyleSheet, Pressable } from "react-native";
import { spacing, fontSize } from "../constants/theme";
import { useTheme } from "../contexts/ThemeContext";

export const Tags = ({ tags, selectedTags, onTagPress }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.tagContainer}>
      {tags.map((tag) => {
        const isSelected = selectedTags ? selectedTags.includes(tag) : false;
        const chip = (
          <View
            key={tag}
            style={[
              styles.tagStyle,
              {
                backgroundColor: isSelected ? colors.primary : colors.tagBg,
              },
            ]}
          >
            <Text
              style={[
                styles.tagText,
                { color: isSelected ? "#fff" : colors.tagText },
              ]}
            >
              {tag}
            </Text>
          </View>
        );

        if (onTagPress) {
          return (
            <Pressable key={tag} onPress={() => onTagPress(tag)}>
              {chip}
            </Pressable>
          );
        }
        return chip;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagText: {
    fontSize: fontSize.xs,
    fontWeight: "500",
  },
  tagStyle: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
  },
});
