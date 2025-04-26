"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/Colors"
import { fetchProductById, fetchProducts } from "../../services/api"
import { useCart } from "../../hooks/useCart"
import Button from "../../components/ui/Button"
import ProductCard from "../../components/products/ProductCard"
import { formatCurrency } from "../../utils/helpers"

const { width } = Dimensions.get("window")

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        const productData = await fetchProductById(id)
        setProduct(productData)

        // Fetch related products from the same category
        if (productData.categoryId) {
          const related = await fetchProducts(productData.categoryId, 5)
          // Filter out the current product
          setRelatedProducts(related.filter((item) => item.id !== id))
        }
      } catch (error) {
        console.error("Error loading product:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadProduct()
    }
  }, [id])

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity)
    }
  }

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change
    if (newQuantity > 0) {
      setQuantity(newQuantity)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    )
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={Colors.MUTED} />
        <Text style={styles.errorText}>Product not found</Text>
        <Button title="Go Back" onPress={() => router.back()} style={styles.backButton} />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Product Images */}
      <View style={styles.imageContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / width)
            setActiveImageIndex(newIndex)
          }}
        >
          {product.images && product.images.length > 0 ? (
            product.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.productImage} resizeMode="cover" />
            ))
          ) : (
            <Image source={{ uri: "https://via.placeholder.com/400" }} style={styles.productImage} resizeMode="cover" />
          )}
        </ScrollView>

        {/* Image Pagination Dots */}
        {product.images && product.images.length > 1 && (
          <View style={styles.pagination}>
            {product.images.map((_, index) => (
              <View
                key={index}
                style={[styles.paginationDot, index === activeImageIndex && styles.paginationDotActive]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{product.name}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
          {product.originalPrice && <Text style={styles.originalPrice}>{formatCurrency(product.originalPrice)}</Text>}
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Quantity:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(-1)}>
              <Ionicons name="remove" size={20} color={Colors.TEXT} />
            </TouchableOpacity>

            <Text style={styles.quantityValue}>{quantity}</Text>

            <TouchableOpacity style={styles.quantityButton} onPress={() => handleQuantityChange(1)}>
              <Ionicons name="add" size={20} color={Colors.TEXT} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Add to Cart Button */}
        <Button title="Add to Cart" onPress={handleAddToCart} fullWidth style={styles.addToCartButton} />

        {/* Product Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
        </View>
      </View>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <View style={styles.relatedProductsContainer}>
          <Text style={styles.sectionTitle}>Related Products</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedProductsList}
          >
            {relatedProducts.map((item) => (
              <View key={item.id} style={styles.relatedProductItem}>
                <ProductCard product={item} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.MUTED,
    marginVertical: 20,
  },
  backButton: {
    marginTop: 20,
  },
  imageContainer: {
    position: "relative",
    height: width,
  },
  productImage: {
    width,
    height: width,
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: Colors.PRIMARY,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: Colors.CARD,
  },
  productName: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.TEXT,
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.PRIMARY,
  },
  originalPrice: {
    fontSize: 18,
    color: Colors.MUTED,
    textDecorationLine: "line-through",
    marginLeft: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    color: Colors.TEXT,
    marginRight: 10,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.BACKGROUND,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: "500",
    marginHorizontal: 15,
  },
  addToCartButton: {
    marginBottom: 20,
  },
  descriptionContainer: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.TEXT,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.TEXT,
  },
  relatedProductsContainer: {
    padding: 20,
    backgroundColor: Colors.CARD,
    marginTop: 15,
  },
  relatedProductsList: {
    paddingVertical: 10,
  },
  relatedProductItem: {
    marginRight: 15,
  },
})

