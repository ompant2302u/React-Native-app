import {
  FlatList,
  StyleSheet,
  View,
  Text,
  Image,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, shadow, spacing, fontSize } from "../constants/theme";
import SEED_ITEMS from "../data/seed";
import { MealCard } from "./MealItem";

const ListScreen = () => {
  let numColumns = 1;
  const { width } = useWindowDimensions();
  numColumns = width > 600 ? 2 : 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View>
        <Text style={styles.title}>My Collection</Text>
        <FlatList
          key={numColumns} // important for re-rendering when numColumns changes
          data={SEED_ITEMS}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          renderItem={({ item }) => <MealCard item={item} />}
          contentContainerStyle={styles.contentContainer}
          columnWrapperStyle={
            numColumns > 1 ? styles.columnWrapperStyle : undefined
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingBottom: spacing.xxl,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    ...shadow(2),
  },
  columnWrapperStyle: {
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    margin: spacing.md,
  },
  contentContainer: {
    gap: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
});
export default ListScreen;
