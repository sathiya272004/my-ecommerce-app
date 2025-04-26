"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/Colors"
import { useCart } from "../../hooks/useCart"
import { useAuth } from "../../hooks/useAuth"
import Button from "../../components/ui/Button"
import { formatCurrency } from "../../utils/helpers"
import { createOrder } from "../../services/api"

export default function CartScreen() {
  const router = useRouter()
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleQuantityChange = (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity)
    } else {
      handleRemoveItem(productId)
    }
  }

  const handleRemoveItem = (productId) => {
    Alert.alert("Remove Item", "Are you sure you want to remove this item from your cart?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeFromCart(productId) },
    ])
  }

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      Alert.alert("Login Required", "Please login to continue with checkout", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push("/(auth)/login") },
      ])
      return
    }

    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Your cart is empty")
      return
    }

    try {
      setLoading(true)

      // Create order in Firestore
      const orderData = {
        userId: user.uid,
        customerName: user.displayName || "Customer",
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.images && item.images.length > 0 ? item.images[0] : null,
        })),
        totalAmount: getCartTotal(),
        status: "Processing",
        shippingAddress: {
          // In a real app, you would get this from a form or user profile
          street: "123 Main St",
          city: "Anytown",
          state: "CA",
          zip: "12345",
        },
      }

      await createOrder(orderData)

      // Clear cart after successful order
      await clearCart()

      Alert.alert("Order Placed", "Your order has been placed successfully!", [{ text: "OK" }])
    } catch (error) {
      console.error("Error creating order:", error)
      Alert.alert("Error", "Failed to place order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{
          uri: item.images && item.images.length > 0 ? item.images[0] : "https://via.placeholder.com/100",
        }}
        style={styles.itemImage}
      />

      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, item.quantity, -1)}
          >
            <Ionicons name="remove" size={16} color={Colors.TEXT} />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.id, item.quantity, 1)}
          >
            <Ionicons name="add" size={16} color={Colors.TEXT} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveItem(item.id)}>
        <Ionicons name="trash-outline" size={20} color={Colors.DANGER} />
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              Alert.alert("Clear Cart", "Are you sure you want to clear your cart?", [
                { text: "Cancel", style: "cancel" },
                { text: "Clear", style: "destructive", onPress: () => clearCart() },
              ])
            }}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={Colors.MUTED} />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Button title="Start Shopping" onPress={() => router.push("/(tabs)/home")} style={styles.shopButton} />
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.cartList}
          />

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(getCartTotal())}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>Free</Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(getCartTotal())}</Text>
            </View>

            <Button title="Proceed to Checkout" onPress={handleCheckout} loading={loading} fullWidth />
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: Colors.CARD,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.TEXT,
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    color: Colors.DANGER,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.MUTED,
    marginVertical: 20,
  },
  shopButton: {
    marginTop: 20,
  },
  cartList: {
    padding: 15,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: Colors.CARD,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.TEXT,
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.PRIMARY,
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.BACKGROUND,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  removeButton: {
    padding: 5,
  },
  summaryContainer: {
    backgroundColor: Colors.CARD,
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.MUTED,
  },
  summaryValue: {
    fontSize: 16,
    color: Colors.TEXT,
  },
  totalRow: {
    marginVertical: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.TEXT,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.PRIMARY,
  },
})

