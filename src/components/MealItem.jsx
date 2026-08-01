import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { Tags } from "./TagItem";
import { colors, spacing, fontSize, shadow } from "../constants/theme";

export const MealCard = ({ item }) => {
  const onItemPress = () => {
    console.log(`Pressed item: ${item.title}`);
  };
  return (
    <Pressable
      style={({ pressed }) =>
        pressed
          ? [styles.cardContainer, styles.pressedCardContainer]
          : styles.cardContainer
      }
      onPress={onItemPress}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
      <Tags tags={item.tags} />
      <View style={styles.rowContainer}>
        <Text>{item.minutes} min</Text>
        {item.favourite && <Text style={styles.favourite}>★</Text>}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    ...shadow(2),
  },
  pressedCardContainer: {
    opacity: 0.5,
  },
  cardTitle: { fontSize: fontSize.xl, fontWeight: "bold", margin: spacing.sm },
  cardSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  image: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: spacing.sm,
    borderTopRightRadius: spacing.sm,
  },
  rowContainer: {
    flexDirection: "row",
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: "center",
    justifyContent: "space-between",
  },
  favourite: { color: colors.favourite, fontSize: fontSize.lg },
});
