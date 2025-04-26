//razozorpayService
import axios from "axios"
import { Platform } from "react-native"


// Razorpay key
const RAZORPAY_KEY_ID = "rzp_test_JQ3qfa8eGYKkBj"
// WARNING: This should be stored securely on your backend
// Only included here for demonstration purposes
const RAZORPAY_KEY_SECRET = "n9dvi3hJSmhFxEfLYLrziox1"

// Function to create a Razorpay order via Axios
export const createRazorpayOrder = async (orderData) => {
  const { amount, currency = "INR", receipt, notes = {} } = orderData

  try {
    // In a real app, this should be a call to your backend
    // For demo purposes, we're making a direct call (NOT RECOMMENDED for production)
    const response = await axios({
      method: "post",
      url: "https://api.razorpay.com/v1/orders",
      auth: {
        username: RAZORPAY_KEY_ID,
        password: RAZORPAY_KEY_SECRET,
      },
      data: {
        amount: amount,
        currency: currency,
        receipt: receipt,
        notes: notes,
      },
    })

    return response.data
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    throw new Error(error.response?.data?.error?.description || "Failed to create order")
  }
}

// Function to open Razorpay checkout
export const openRazorpayCheckout = async (orderData, razorpayOrderData) => {
  const { amount, currency = "INR", email, phone, customerName } = orderData

  // Check if we're running on a device (not on web)
  if (Platform.OS === "web") {
    throw new Error("Razorpay is not supported on web")
  }

  // Import RazorpayCheckout dynamically
  let RazorpayCheckout
  try {
    // Ensure the module is available and properly imported
    RazorpayCheckout = require("react-native-razorpay").default
    
    // If RazorpayCheckout is still null after import, throw an error
    if (!RazorpayCheckout) {
      throw new Error("Razorpay SDK not properly initialized")
    }
  } catch (error) {
    console.error("Failed to load Razorpay SDK:", error)
    throw new Error("Failed to initialize payment gateway. Please try again.")
  }

  // Configure Razorpay options
  const options = {
    description: "Payment for your order",
    image: "https://your-app-logo-url.png",
    currency: currency,
    key: RAZORPAY_KEY_ID,
    amount: amount,
    name: "Your Store Name",
    order_id: razorpayOrderData.id,
    prefill: {
      email: email || "",
      contact: phone || "",
      name: customerName || "",
    },
    theme: { color: "#0a84ff" },
  }

  console.log("Opening Razorpay with options:", JSON.stringify(options))
  
  // Return a promise that resolves with payment data or rejects with error
  return new Promise((resolve, reject) => {
    try {
      // Make sure RazorpayCheckout is available before calling open
      if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
        throw new Error("Razorpay SDK not properly initialized or missing open method")
      }
      
      RazorpayCheckout.open(options)
        .then((data) => {
          console.log("Payment successful:", data)
          resolve(data)
        })
        .catch((error) => {
          console.log("Payment error:", error)
          reject(error)
        })
    } catch (error) {
      console.error("Error opening Razorpay:", error)
      reject(new Error("Failed to open Razorpay checkout: " + error.message))
    }
  })
}

// Function to verify payment (should be done on server in production)
export const verifyPayment = (paymentData, razorpayOrderData) => {
  const { razorpay_payment_id, razorpay_signature } = paymentData
  const orderId = razorpayOrderData.id

  // In a real production app, this verification should happen on a server
  console.log("Payment verification would happen here")
  console.log("Order ID:", orderId)
  console.log("Payment ID:", razorpay_payment_id)
  console.log("Signature:", razorpay_signature)

  // For demo purposes, we'll just return true
  // In production, implement proper signature verification
  return true
}