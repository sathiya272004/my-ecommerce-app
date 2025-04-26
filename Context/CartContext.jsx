"use client"

import { createContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useAuth } from "../hooks/useAuth"
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase/config"

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Load cart from AsyncStorage (for guest users) or Firestore (for logged in users)
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true)
        if (user) {
          // User is logged in, load cart from Firestore
          const cartDoc = await getDoc(doc(db, "carts", user.uid))
          if (cartDoc.exists()) {
            setCartItems(cartDoc.data().items || [])
          } else {
            // Create empty cart in Firestore
            await setDoc(doc(db, "carts", user.uid), {
              items: [],
              updatedAt: serverTimestamp(),
            })
            setCartItems([])
          }
        } else {
          // User is guest, load cart from AsyncStorage
          const storedCart = await AsyncStorage.getItem("cart")
          if (storedCart) {
            setCartItems(JSON.parse(storedCart))
          }
        }
      } catch (error) {
        console.error("Error loading cart:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [user])

  // Save cart to AsyncStorage (for guest users) or Firestore (for logged in users)
  const saveCart = async (items) => {
    try {
      if (user) {
        // User is logged in, save cart to Firestore
        await updateDoc(doc(db, "carts", user.uid), {
          items,
          updatedAt: serverTimestamp(),
        })
      } else {
        // User is guest, save cart to AsyncStorage
        await AsyncStorage.setItem("cart", JSON.stringify(items))
      }
    } catch (error) {
      console.error("Error saving cart:", error)
    }
  }

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    try {
      const existingItemIndex = cartItems.findIndex((item) => item.id === product.id)

      let updatedCart
      if (existingItemIndex >= 0) {
        // Item already exists in cart, update quantity
        updatedCart = [...cartItems]
        updatedCart[existingItemIndex].quantity += quantity
      } else {
        // Item doesn't exist in cart, add it
        updatedCart = [...cartItems, { ...product, quantity }]
      }

      setCartItems(updatedCart)
      await saveCart(updatedCart)

      return { success: true }
    } catch (error) {
      console.error("Error adding to cart:", error)
      return { success: false, error: error.message }
    }
  }

  // Update item quantity in cart
  const updateQuantity = async (productId, quantity) => {
    try {
      if (quantity <= 0) {
        return removeFromCart(productId)
      }

      const updatedCart = cartItems.map((item) => (item.id === productId ? { ...item, quantity } : item))

      setCartItems(updatedCart)
      await saveCart(updatedCart)

      return { success: true }
    } catch (error) {
      console.error("Error updating quantity:", error)
      return { success: false, error: error.message }
    }
  }

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      const updatedCart = cartItems.filter((item) => item.id !== productId)

      setCartItems(updatedCart)
      await saveCart(updatedCart)

      return { success: true }
    } catch (error) {
      console.error("Error removing from cart:", error)
      return { success: false, error: error.message }
    }
  }

  // Clear cart
  const clearCart = async () => {
    try {
      setCartItems([])
      await saveCart([])

      return { success: true }
    } catch (error) {
      console.error("Error clearing cart:", error)
      return { success: false, error: error.message }
    }
  }

  // Calculate cart total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  // Get cart item count
  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

