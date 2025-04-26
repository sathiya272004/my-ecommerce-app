"use client"
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/Colors"
import { useCart } from "../../hooks/useCart"
import { formatCurrency, calculateDiscountPercentage } from "../../utils/helpers"

const ProductCard = ({ product, horizontal = false }) => {
  const router = useRouter()
  const { addToCart } = useCart()

  const handlePress = () => {
    router.push(`/product/${product.id}`)
  }

  const handleAddToCart = () => {
    addToCart(product, 1)
  }

  const discountPercentage = product.originalPrice
    ? calculateDiscountPercentage(product.originalPrice, product.price)
    : 0

  return (
    <TouchableOpacity
      style={[styles.container, horizontal ? styles.horizontalContainer : styles.verticalContainer]}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/150",
          }}
          style={styles.image}
          resizeMode="cover"
        />
        {discountPercentage > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          {product.originalPrice && <Text style={styles.originalPrice}>{formatCurrency(product.originalPrice)}</Text>}
        </View>

        {horizontal && (
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
        )}

        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Ionicons name="cart" size={16} color="#fff" />
          <Text style={styles.addToCartText}>Add</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.CARD,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  verticalContainer: {
    width: 160,
    height: 260,
  },
  horizontalContainer: {
    flexDirection: "row",
    width: "100%",
    height: 130,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 160,
  },
  discountBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: Colors.DANGER,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  infoContainer: {
    padding: 10,
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
    color: Colors.TEXT,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.PRIMARY,
  },
  originalPrice: {
    fontSize: 12,
    color: Colors.MUTED,
    textDecorationLine: "line-through",
    marginLeft: 5,
  },
  description: {
    fontSize: 12,
    color: Colors.MUTED,
    marginBottom: 10,
  },
  addToCartButton: {
    backgroundColor: Colors.PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginTop: "auto",
  },
  addToCartText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
})

export default ProductCard

