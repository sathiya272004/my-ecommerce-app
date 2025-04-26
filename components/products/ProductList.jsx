import { View, FlatList, StyleSheet, Text } from "react-native"
import ProductCard from "./ProductCard"
import Loading from "../ui/Loading"
import { Colors } from "../../constants/Colors"

const ProductList = ({
  products,
  loading,
  horizontal = false,
  showsHorizontalScrollIndicator = false,
  showsVerticalScrollIndicator = true,
  numColumns = 2,
  contentContainerStyle,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  onEndReached,
  onEndReachedThreshold = 0.5,
  refreshing = false,
  onRefresh,
}) => {
  if (loading) {
    return <Loading text="Loading products..." />
  }

  const renderItem = ({ item }) => (
    <View style={horizontal ? styles.horizontalItem : styles.gridItem}>
      <ProductCard product={item} horizontal={horizontal} />
    </View>
  )

  const defaultEmptyComponent = (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No products found</Text>
    </View>
  )

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      horizontal={horizontal}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      numColumns={horizontal ? 1 : numColumns}
      contentContainerStyle={[
        styles.contentContainer,
        horizontal ? styles.horizontalContainer : styles.gridContainer,
        contentContainerStyle,
      ]}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent || defaultEmptyComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 20,
  },
  horizontalContainer: {
    paddingHorizontal: 15,
  },
  gridContainer: {
    padding: 15,
  },
  horizontalItem: {
    marginRight: 15,
    marginBottom: 10,
    width: 160,
  },
  gridItem: {
    flex: 1 / 2,
    marginHorizontal: 5,
    marginBottom: 15,
    maxWidth: "50%",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: Colors.MUTED,
    textAlign: "center",
  },
})

export default ProductList

