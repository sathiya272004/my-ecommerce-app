//payment.jsx

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  Platform,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Ionicons } from "@expo/vector-icons"
import { auth, db } from "../../firebase/config"
import { fetchCartItems, fetchProductDetails, removeCartItem } from "../../services/api"
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore"
import { createRazorpayOrder, openRazorpayCheckout, verifyPayment } from "../../services/razorpayService"

export default function PaymentScreen() {
  const router = useRouter()
  const { addressId } = useLocalSearchParams()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [address, setAddress] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [products, setProducts] = useState([])
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, shipping: 0, total: 0 })
  const [userProfile, setUserProfile] = useState(null)
  const [paymentError, setPaymentError] = useState(null)

  useEffect(() => {
    loadData()
  }, [addressId])

  const loadData = async () => {
    try {
      setLoading(true)
      const userId = auth.currentUser?.uid
      if (!userId) {
        Alert.alert("Error", "You must be logged in to proceed")
        router.replace("/(auth)/login")
        return
      }

      // Load user profile
      const userRef = doc(db, "users", userId)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        setUserProfile(userSnap.data())
      }

      // Load selected address
      if (addressId) {
        const addressesRef = collection(db, "users", userId, "addresses")
        const addressDoc = await getDoc(doc(addressesRef, addressId))
        if (addressDoc.exists()) {
          setAddress({ id: addressDoc.id, ...addressDoc.data() })
        }
      }

      // Load cart items
      const cartData = await fetchCartItems(userId)
      setCartItems(cartData)

      // Load product details for each cart item
      const productDetails = []
      for (const item of cartData) {
        const product = await fetchProductDetails(item.productId)
        if (product) {
          productDetails.push({
            ...item,
            product,
          })
        }
      }
      setProducts(productDetails)

      // Load totals from AsyncStorage
      const savedTotals = await AsyncStorage.getItem("checkout_total")
      if (savedTotals) {
        setTotals(JSON.parse(savedTotals))
      } else {
        // Calculate totals if not in AsyncStorage
        calculateTotals(productDetails)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      Alert.alert("Error", "Failed to load payment information")
    } finally {
      setLoading(false)
    }
  }

  const calculateTotals = (items) => {
    let subtotal = 0
    items.forEach((item) => {
      const price = item.product?.offerPrice || item.product?.price || 0
      subtotal += price * item.quantity
    })

    const tax = subtotal * 0.18 // 18% tax
    const shipping = subtotal > 999 ? 0 : 40 // Free shipping over ₹999
    const total = subtotal + tax + shipping

    setTotals({ subtotal, tax, shipping, total })
  }

  const initiateRazorpayPayment = async () => {
    if (!address) {
      Alert.alert("Error", "Please select a delivery address")
      return
    }

    if (!userProfile?.email) {
      Alert.alert("Error", "Your account does not have an email address")
      return
    }

    try {
      setProcessing(true)
      setPaymentError(null)

      // Prepare order items for the database
      const orderItems = products.map((item) => ({
        productId: item.productId,
        name: item.product?.product_title || "Unknown Product",
        price: item.product?.offerPrice || item.product?.price || 0,
        quantity: item.quantity,
        size: item.size || "Standard",
        image: item.product?.images?.[0] || null,
      }))

      // Create a temporary order in Firestore
      const orderData = {
        userId: auth.currentUser.uid,
        userEmail: userProfile.email,
        userName: userProfile.displayName || "Customer",
        items: orderItems,
        address: {
          id: address.id,
          name: address.name,
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          phone: address.phone,
        },
        payment: {
          method: "razorpay",
          status: "pending",
        },
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        total: totals.total,
        status: "Pending Payment",
        createdAt: serverTimestamp(),
      }

      const orderRef = await addDoc(collection(db, "orders"), orderData)
      const orderId = orderRef.id

      // Check if platform is supported
      if (Platform.OS === "web") {
        Alert.alert("Error", "Razorpay is not supported on web. Please use the mobile app.")
        await handlePaymentFailure(orderId, "Platform not supported")
        return
      }

      try {
        // Step 1: Create a Razorpay order
        const razorpayOrderData = await createRazorpayOrder({
          amount: Math.round(totals.total * 100), // Razorpay expects amount in paise
          currency: "INR",
          receipt: `order_${orderId}`,
          notes: {
            orderId: orderId,
            userId: auth.currentUser.uid,
          },
        })

        console.log("Razorpay order created:", razorpayOrderData)

        // Step 2: Open Razorpay checkout
        try {
          const paymentData = await openRazorpayCheckout(
            {
              amount: Math.round(totals.total * 100),
              currency: "INR",
              email: userProfile.email,
              phone: address.phone,
              customerName: userProfile.displayName || address.name,
            },
            razorpayOrderData,
          )

          console.log("Payment data received:", paymentData)

          // Step 3: Verify payment
          const isVerified = verifyPayment(paymentData, razorpayOrderData)

          if (isVerified) {
            // Payment successful
            await handlePaymentSuccess(orderId, paymentData.razorpay_payment_id)
          } else {
            // Payment verification failed
            await handlePaymentFailure(orderId, "Payment verification failed")
          }
        } catch (error) {
          console.error("Razorpay checkout error:", error)
          const errorMessage = error.description || error.message || "Payment failed"
          setPaymentError(errorMessage)
          await handlePaymentFailure(orderId, errorMessage)

          // Show a more specific error message to the user
          Alert.alert(
            "Payment Failed",
            `Unable to open payment gateway: ${errorMessage}. Please try again or choose a different payment method.`,
          )
        }
      } catch (error) {
        console.error("Payments failed:", error)
        setPaymentError(error.description || error.message || "Payment failed")
        await handlePaymentFailure(orderId, error.description || error.message || "Payment failed")
      }
    } catch (error) {
      console.error("Error initiating payment:", error)
      Alert.alert("Error", "Failed to initiate payment. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const handlePaymentSuccess = async (orderId, paymentId) => {
    try {
      // Update order status in Firestore
      const orderRef = doc(db, "orders", orderId)
      await updateDoc(orderRef, {
        "payment.status": "completed",
        "payment.id": paymentId,
        status: "Processing",
        updatedAt: serverTimestamp(),
      })

      // Clear cart items
      for (const item of cartItems) {
        await removeCartItem(auth.currentUser.uid, item.id)
      }

      // Navigate to order confirmation
      router.replace({
        pathname: "/(tabs)/order-confirmation",
        params: { orderId },
      })
    } catch (error) {
      console.error("Error processing successful payment:", error)
      Alert.alert(
        "Payment Successful",
        "Your payment was successful, but we encountered an error updating your order. Please contact customer support.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)/home"),
          },
        ],
      )
    }
  }

  const handlePaymentFailure = async (orderId, errorMessage) => {
    try {
      // Update order status to failed
      const orderRef = doc(db, "orders", orderId)
      await updateDoc(orderRef, {
        "payment.status": "failed",
        "payment.error": errorMessage,
        status: "Payment Failed",
        updatedAt: serverTimestamp(),
      })

      Alert.alert(
        "Payment Failed",
        "Your payment was not successful. Please try again or choose a different payment method.",
        [
          {
            text: "OK",
            onPress: () => setProcessing(false),
          },
        ],
      )
    } catch (error) {
      console.error("Error handling payment failure:", error)
      setProcessing(false)
    }
  }

  const handleCashOnDelivery = async () => {
    try {
      setProcessing(true)

      if (!address) {
        Alert.alert("Error", "Please select a delivery address")
        setProcessing(false)
        return
      }

      // Prepare order items for the database
      const orderItems = products.map((item) => ({
        productId: item.productId,
        name: item.product?.product_title || "Unknown Product",
        price: item.product?.offerPrice || item.product?.price || 0,
        quantity: item.quantity,
        size: item.size || "Standard",
        image: item.product?.images?.[0] || null,
      }))

      // Create order in Firestore
      const orderData = {
        userId: auth.currentUser.uid,
        userEmail: userProfile?.email,
        userName: userProfile?.displayName || "Customer",
        items: orderItems,
        address: {
          id: address.id,
          name: address.name,
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          phone: address.phone,
        },
        payment: {
          method: "cod",
          status: "pending",
        },
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        total: totals.total,
        status: "Processing",
        createdAt: serverTimestamp(),
      }

      const orderRef = await addDoc(collection(db, "orders"), orderData)
      const orderId = orderRef.id

      // Clear cart items
      for (const item of cartItems) {
        await removeCartItem(auth.currentUser.uid, item.id)
      }

      // Navigate to order confirmation
      router.replace({
        pathname: "/(tabs)/order-confirmation",
        params: { orderId },
      })
    } catch (error) {
      console.error("Error processing COD order:", error)
      Alert.alert("Error", "Failed to place your order. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a84ff" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{totals.subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (18%)</Text>
            <Text style={styles.summaryValue}>₹{totals.tax.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>{totals.shipping > 0 ? `₹${totals.shipping.toFixed(2)}` : "Free"}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{totals.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>

          {address ? (
            <View style={styles.addressCard}>
              <Text style={styles.addressName}>{address.name}</Text>
              <Text style={styles.addressDetails}>
                {address.street}, {address.city}, {address.state} {address.pincode}
              </Text>
              <Text style={styles.addressPhone}>Phone: {address.phone}</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.selectAddressButton} onPress={() => router.push("/(tabs)/select-address")}>
              <Text style={styles.selectAddressText}>Select Delivery Address</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>

          {paymentError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{paymentError}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.paymentOption} onPress={initiateRazorpayPayment} disabled={processing}>
            <View style={styles.paymentOptionLeft}>
              <Image source={{ uri: "https://razorpay.com/favicon.png" }} style={styles.paymentIcon} />
              <Text style={styles.paymentText}>Pay with Razorpay</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.paymentOption} onPress={handleCashOnDelivery} disabled={processing}>
            <View style={styles.paymentOptionLeft}>
              <Ionicons name="cash-outline" size={24} color="#4CAF50" style={styles.paymentIcon} />
              <Text style={styles.paymentText}>Cash on Delivery</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {processing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.processingText}>Processing your payment...</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0a84ff",
  },
  addressCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  addressName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  addressDetails: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  addressPhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  selectAddressButton: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  selectAddressText: {
    fontSize: 16,
    color: "#0a84ff",
    fontWeight: "500",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
  },
  paymentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  paymentOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: "500",
  },
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  processingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
  },
})
