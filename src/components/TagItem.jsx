import { View, Text, StyleSheet } from "react-native";
import { spacing, colors } from "../constants/theme";

export const Tags = ({ tags }) => {
  return (
    <View style={styles.tagContainer}>
      {tags.map((tag) => {
        return (
          <View style={styles.tagStyle} key={tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        );
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
    color: colors.tagText,
  },
  tagStyle: {
    backgroundColor: colors.tagBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
  },
});
