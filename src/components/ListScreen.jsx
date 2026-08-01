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

const ListScreen = () => {
  let numColumns = 1;
  const { width } = useWindowDimensions();
  console.log("width", width);
  numColumns = width > 600 ? 2 : 1;

  const Tags = ({ tags }) => {
    return (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: spacing.sm,
          marginHorizontal: spacing.sm,
          marginBottom: spacing.sm,
        }}
      >
        {tags.map((tag) => {
          return (
            <View
              style={{
                backgroundColor: colors.tagBg,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                borderRadius: spacing.sm,
              }}
              key={tag}
            >
              <Text style={{ color: colors.tagText }}>{tag}</Text>
            </View>
          );
        })}
      </View>
    );
  };
  const MealCard = ({ item }) => {
    return (
      <View style={styles.cardContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        <Tags tags={item.tags} />
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: spacing.sm,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text>{item.minutes} min</Text>
          {item.favourite && (
            <Text style={{ color: colors.favourite, fontSize: fontSize.xxl }}>
              *
            </Text>
          )}
        </View>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View>
        <Text
          style={{
            fontSize: fontSize.xl,
            fontWeight: "bold",
            margin: spacing.md,
          }}
        >
          My Collection
        </Text>
        <FlatList
          key={numColumns} // important for re-rendering when numColumns changes
          data={SEED_ITEMS}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          renderItem={({ item }) => <MealCard item={item} />}
          contentContainerStyle={{
            gap: spacing.xl,
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.xxl,
          }}
          columnWrapperStyle={numColumns > 1 ? { gap: spacing.sm } : undefined}
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
  image: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: spacing.sm,
    borderTopRightRadius: spacing.sm,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    ...shadow(2),
  },
  cardTitle: { fontSize: fontSize.xl, fontWeight: "bold", margin: spacing.sm },
  cardSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
});
export default ListScreen;
