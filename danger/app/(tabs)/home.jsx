"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList } from "react-native"
import { useRouter } from "expo-router"
import { Colors } from "../../constants/Colors"
import { Ionicons } from "@expo/vector-icons"
import { fetchProducts, fetchCategories } from "../../services/api"
import ProductCard from "../../components/products/ProductCard"
import Loading from "../../components/ui/Loading"

export default function HomeScreen() {
  const router = useRouter()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch featured products (limit to 5)
        const productsData = await fetchProducts(null, 10)

        // Split products into featured and new arrivals
        setFeaturedProducts(productsData.slice(0, 5))
        setNewArrivals(productsData.slice(5, 10))

        // Fetch categories
        const categoriesData = await fetchCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() =>
        router.push({
          pathname: "/search",
          params: { category: item.id },
        })
      }
    >
      <Image
        source={{ uri: item.images && item.images.length > 0 ? item.images[0] : "https://via.placeholder.com/150" }}
        style={styles.categoryImage}
        resizeMode="cover"
      />
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  )

  if (loading) {
    return <Loading fullScreen />
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Banner */}
      <View style={styles.banner}>
        <Image source={require("../../assets/images/banner.jpg")} style={styles.bannerImage} resizeMode="cover" />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>Summer Sale</Text>
          <Text style={styles.bannerSubtitle}>Up to 50% off</Text>
          <TouchableOpacity style={styles.bannerButton} onPress={() => router.push("/search")}>
            <Text style={styles.bannerButtonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => router.push("/search")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No categories found</Text>
            </View>
          }
        />
      </View>

      {/* Featured Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity onPress={() => router.push("/search")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={featuredProducts}
          renderItem={({ item }) => (
            <View style={styles.productItem}>
              <ProductCard product={item} />
            </View>
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      </View>

      {/* New Arrivals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Arrivals</Text>
          <TouchableOpacity onPress={() => router.push("/search")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={newArrivals}
          renderItem={({ item }) => (
            <View style={styles.productItem}>
              <ProductCard product={item} />
            </View>
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      </View>

      {/* Special Offers */}
      <View style={styles.specialOfferCard}>
        <View style={styles.specialOfferContent}>
          <Text style={styles.specialOfferTitle}>Special Offer</Text>
          <Text style={styles.specialOfferDescription}>Get an extra 10% off on your first order</Text>
          <TouchableOpacity style={styles.specialOfferButton} onPress={() => router.push("/search")}>
            <Text style={styles.specialOfferButtonText}>Claim Offer</Text>
          </TouchableOpacity>
        </View>
        <Ionicons name="gift" size={80} color="#fff" style={styles.specialOfferIcon} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  banner: {
    position: "relative",
    height: 200,
    marginBottom: 20,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 20,
    justifyContent: "center",
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  bannerSubtitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 15,
  },
  bannerButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  bannerButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.TEXT,
  },
  seeAllText: {
    color: Colors.PRIMARY,
    fontWeight: "600",
  },
  categoriesList: {
    paddingBottom: 10,
  },
  categoryCard: {
    width: 100,
    marginRight: 15,
    alignItems: "center",
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    color: Colors.TEXT,
  },
  productsList: {
    paddingBottom: 10,
  },
  productItem: {
    marginRight: 15,
  },
  specialOfferCard: {
    flexDirection: "row",
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 20,
    overflow: "hidden",
  },
  specialOfferContent: {
    flex: 1,
  },
  specialOfferTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  specialOfferDescription: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 15,
    opacity: 0.9,
  },
  specialOfferButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  specialOfferButtonText: {
    color: Colors.PRIMARY,
    fontWeight: "bold",
  },
  specialOfferIcon: {
    position: "absolute",
    right: -10,
    bottom: -10,
    opacity: 0.3,
  },
  emptyContainer: {
    width: 200,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: Colors.MUTED,
    fontSize: 14,
  },
})

