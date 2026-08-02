import {
  FlatList,
  StyleSheet,
  View,
  Text,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, fontSize } from "../constants/theme";
import SEED_ITEMS from "../data/seed";
import { MealCard } from "./MealItem";
import { useTheme } from "../contexts/ThemeContext";

const ListScreen = () => {
  let numColumns = 1;
  const { width } = useWindowDimensions();
  numColumns = width > 600 ? 2 : 1;
  const { colors, toggle, mode } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Text style={styles.title}>My Collection</Text>
          <Pressable onPress={toggle}>
            <Text style={{ color: colors.primary, fontSize: fontSize.xl }}>
              {mode}
            </Text>
          </Pressable>
        </View>
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
    paddingBottom: spacing.xxl,
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
