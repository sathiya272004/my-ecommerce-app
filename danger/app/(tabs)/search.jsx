"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, TextInput, FlatList, TouchableOpacity, Text } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/Colors"
import { fetchProducts, fetchCategories, searchProducts } from "../../services/api"
import ProductList from "../../components/products/ProductList"
import Loading from "../../components/ui/Loading"
import { debounce } from "../../utils/helpers"

export default function SearchScreen() {
  const { category: initialCategoryId } = useLocalSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId || null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)

        // Fetch categories
        const categoriesData = await fetchCategories()
        setCategories(categoriesData)

        // Fetch products based on selected category
        const productsData = await fetchProducts(selectedCategory)
        setProducts(productsData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [selectedCategory])

  // Debounced search function
  const debouncedSearch = debounce(async (query) => {
    if (!query.trim()) {
      // If search query is empty, load products based on category
      const productsData = await fetchProducts(selectedCategory)
      setProducts(productsData)
      setSearching(false)
      return
    }

    try {
      setSearching(true)
      const results = await searchProducts(query)
      setProducts(results)
    } catch (error) {
      console.error("Error searching products:", error)
    } finally {
      setSearching(false)
    }
  }, 500)

  const handleSearch = (text) => {
    setSearchQuery(text)
    debouncedSearch(text)
  }

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId)
    setSearchQuery("")
  }

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryChip, selectedCategory === item.id && styles.selectedCategoryChip]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Text style={[styles.categoryChipText, selectedCategory === item.id && styles.selectedCategoryChipText]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.MUTED} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={handleSearch}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          ListHeaderComponent={
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === null && styles.selectedCategoryChip]}
              onPress={() => handleCategorySelect(null)}
            >
              <Text style={[styles.categoryChipText, selectedCategory === null && styles.selectedCategoryChipText]}>
                All
              </Text>
            </TouchableOpacity>
          }
        />
      </View>

      {loading ? (
        <Loading />
      ) : (
        <ProductList
          products={products}
          loading={searching}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={60} color={Colors.MUTED} />
              <Text style={styles.emptyText}>
                {searchQuery ? "No products found for your search" : "No products found in this category"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: Colors.CARD,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: Colors.TEXT,
  },
  categoriesContainer: {
    backgroundColor: Colors.CARD,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  categoriesList: {
    paddingHorizontal: 15,
  },
  categoryChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.BACKGROUND,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  selectedCategoryChip: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  categoryChipText: {
    color: Colors.TEXT,
    fontWeight: "500",
  },
  selectedCategoryChipText: {
    color: "#fff",
  },
  productsList: {
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.MUTED,
    textAlign: "center",
    marginTop: 10,
  },
})

